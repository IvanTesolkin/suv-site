import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getConfig } from '@/lib/configService';
import { calculatePrice } from '@/lib/pricing';
import nodemailer from 'nodemailer';

/**
 * API endpoint to create a booking record. The request body must
 * contain all of the required fields for the selected booking mode
 * along with the calculated price. After persisting the booking
 * information this function sends an email notification to the
 * configured admin address and optionally to the customer. Email
 * settings are read from environment variables.
 */
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const {
      mode,
      name,
      phone,
      email,
      preferredContact,
      passengers,
      datetime,
      pickupAddress,
      dropoffAddress,
      hours,
      packageId,
      addons,
      calculatedPrice
    } = data;
    if (!name || !phone || !datetime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const pickupTime = new Date(datetime);
    // If no price was supplied recalculate to prevent tampering
    let priceResult = calculatedPrice;
    if (!priceResult) {
      // derive arguments for pricing based on mode
      let args: any = {};
      if (mode === 'point_to_point') {
        args = {
          distanceMiles: data.distanceMiles,
          durationMinutes: data.durationMinutes,
          datetime: pickupTime,
          addons,
          pickupAddress,
          dropoffAddress
        };
      } else if (mode === 'hourly') {
        args = {
          hours: Number(hours),
          datetime: pickupTime,
          addons
        };
      } else if (mode === 'package') {
        args = {
          packageId,
          datetime: pickupTime,
          addons
        };
      }
      priceResult = await calculatePrice(mode, args);
    }
    const config = await getConfig('pricing') as any;
    const booking = await prisma.booking.create({
      data: {
        mode,
        name,
        phone,
        email,
        preferredContact: preferredContact || null,
        pickupAddress,
        dropoffAddress,
        datetime: pickupTime,
        passengers: passengers ? Number(passengers) : 1,
        addons,
        packageName: packageId || null,
        hoursRequested: hours ? Number(hours) : null,
        distanceMiles: data.distanceMiles || null,
        durationMinutes: data.durationMinutes || null,
        price: priceResult.price,
        currency: config.currency,
        status: 'NEW'
      }
    });
    // Send emails if SMTP is configured
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const adminEmail = process.env.ADMIN_EMAIL;
    const fromEmail = process.env.EMAIL_FROM || adminEmail;
    const sendClient = process.env.SEND_CLIENT_EMAIL === 'true';
    if (smtpHost && smtpPort && smtpUser && smtpPass && adminEmail) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number(smtpPort),
        secure: Number(smtpPort) === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });
      const bookingDetails = `Booking ID: ${booking.id}\nMode: ${booking.mode}\nName: ${booking.name}\nPhone: ${booking.phone}\nEmail: ${booking.email || ''}\nPassengers: ${booking.passengers}\nPickup: ${booking.pickupAddress}\nDropoff: ${booking.dropoffAddress || ''}\nDate/Time: ${booking.datetime.toISOString()}\nPrice: ${booking.price} ${booking.currency}`;
      // Send to admin
      await transporter.sendMail({
        from: fromEmail,
        to: adminEmail,
        subject: 'New booking received',
        text: `A new booking has been created:\n\n${bookingDetails}`
      });
      // Send to client
      if (sendClient && email) {
        await transporter.sendMail({
          from: fromEmail,
          to: email,
          subject: 'Your booking confirmation',
          text: `Thank you for booking with us! Here are your details:\n\n${bookingDetails}`
        });
      }
    }
    return NextResponse.json({ success: true, bookingId: booking.id });
  } catch (error: any) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
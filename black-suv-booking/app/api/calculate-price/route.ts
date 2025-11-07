import { NextResponse } from 'next/server';
import { calculatePrice } from '@/lib/pricing';
import { getConfig } from '@/lib/configService';

/**
 * API endpoint to calculate the price of a booking. It accepts a
 * JSON body with the booking mode and associated parameters. If the
 * distance API is enabled and the caller supplies pickup and
 * drop‑off addresses for a point‑to‑point booking then this
 * endpoint will attempt to fetch the distance and duration via the
 * Google Distance Matrix API. If the API call fails the endpoint
 * returns an error to the client.
 */
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { mode, datetime, distanceMiles, durationMinutes, hours, packageId, addons, pickupAddress, dropoffAddress } = data;
    const config = await getConfig('pricing') as any;
    let args: any = {};
    const pickupTime = datetime ? new Date(datetime) : new Date();
    if (mode === 'point_to_point') {
      let distance = distanceMiles;
      let duration = durationMinutes;
      if ((distance === undefined || duration === undefined) && config.useDistanceApi) {
        if (!pickupAddress || !dropoffAddress) {
          return NextResponse.json({ error: 'Pickup and drop‑off addresses are required when using the distance API' }, { status: 400 });
        }
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
          return NextResponse.json({ error: 'Distance API key not configured' }, { status: 500 });
        }
        // Encode addresses for URL
        const origins = encodeURIComponent(pickupAddress);
        const destinations = encodeURIComponent(dropoffAddress);
        const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${origins}&destinations=${destinations}&key=${apiKey}`;
        const res = await fetch(url);
        if (!res.ok) {
          return NextResponse.json({ error: 'Failed to fetch distance information' }, { status: 500 });
        }
        const dm = await res.json();
        if (dm.status !== 'OK' || dm.rows[0].elements[0].status !== 'OK') {
          return NextResponse.json({ error: 'Invalid response from distance API' }, { status: 500 });
        }
        const element = dm.rows[0].elements[0];
        // Convert distance to miles and duration to minutes
        const distanceMeters = element.distance.value;
        const durationSeconds = element.duration.value;
        distance = distanceMeters / 1609.34;
        duration = durationSeconds / 60;
      }
      if (distance === undefined || duration === undefined) {
        return NextResponse.json({ error: 'Distance and duration are required for point‑to‑point bookings' }, { status: 400 });
      }
      args = { distanceMiles: distance, durationMinutes: duration, datetime: pickupTime, addons, pickupAddress, dropoffAddress };
    } else if (mode === 'hourly') {
      if (!hours) {
        return NextResponse.json({ error: 'Hours must be provided for hourly bookings' }, { status: 400 });
      }
      args = { hours: Number(hours), datetime: pickupTime, addons };
    } else if (mode === 'package') {
      if (!packageId) {
        return NextResponse.json({ error: 'packageId must be provided for package bookings' }, { status: 400 });
      }
      args = { packageId, datetime: pickupTime, addons };
    }
    const result = await calculatePrice(mode, args);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error calculating price:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
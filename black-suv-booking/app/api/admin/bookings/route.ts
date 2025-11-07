import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET: return list of bookings for admin. Supports optional query
 * parameters `status` to filter bookings and `order` (asc, desc) to
 * sort by creation date. Protected using the ADMIN_TOKEN header.
 */
export async function GET(request: Request) {
  const adminToken = process.env.ADMIN_TOKEN;
  const incomingToken = request.headers.get('x-admin-token');
  if (!adminToken || incomingToken !== adminToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || undefined;
  const order = searchParams.get('order') === 'asc' ? 'asc' : 'desc';
  const bookings = await prisma.booking.findMany({
    where: status ? { status } : {},
    orderBy: { createdAt: order }
  });
  return NextResponse.json({ bookings });
}

/**
 * POST: update the status of a booking. Requires body with
 * `bookingId` and `status`. Protected using ADMIN_TOKEN.
 */
export async function POST(request: Request) {
  const adminToken = process.env.ADMIN_TOKEN;
  const incomingToken = request.headers.get('x-admin-token');
  if (!adminToken || incomingToken !== adminToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { bookingId, status } = await request.json();
    if (!bookingId || !status) {
      return NextResponse.json({ error: 'bookingId and status are required' }, { status: 400 });
    }
    await prisma.booking.update({ where: { id: bookingId }, data: { status } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating booking:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
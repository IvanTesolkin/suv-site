"use client";
import { useState } from 'react';

interface Booking {
  id: number;
  createdAt: string;
  mode: string;
  name: string;
  phone: string;
  email?: string;
  pickupAddress: string;
  dropoffAddress?: string;
  datetime: string;
  passengers: number;
  price: number;
  currency?: string;
  status: string;
}

interface BookingsTableProps {
  bookings: Booking[];
  onStatusChange: (bookingId: number, status: string) => Promise<void>;
}

/**
 * Renders a table of bookings. Admin users can update the status of
 * each booking via a dropdown. Updates are sent back to the parent
 * component via the `onStatusChange` callback.
 */
export default function BookingsTable({ bookings, onStatusChange }: BookingsTableProps) {
  const [updating, setUpdating] = useState<number | null>(null);
  const statuses = ['NEW', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-800 text-gray-400">
          <tr>
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Mode</th>
            <th className="px-4 py-2">Price</th>
            <th className="px-4 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id} className="border-b border-gray-700">
              <td className="px-4 py-2">{booking.id}</td>
              <td className="px-4 py-2">
                {new Date(booking.datetime).toLocaleString()}
              </td>
              <td className="px-4 py-2">{booking.name}</td>
              <td className="px-4 py-2 capitalize">{booking.mode.replace(/_/g, ' ')}</td>
              <td className="px-4 py-2">{booking.price.toFixed(2)} {booking.currency || ''}</td>
              <td className="px-4 py-2">
                <select
                  className="bg-gray-800 border border-gray-700 rounded p-1"
                  value={booking.status}
                  onChange={async (e) => {
                    setUpdating(booking.id);
                    await onStatusChange(booking.id, e.target.value);
                    setUpdating(null);
                  }}
                  disabled={updating === booking.id}
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
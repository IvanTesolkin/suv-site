"use client";
import { useState, useEffect } from 'react';
import BookingsTable from '@/components/BookingsTable';
import AdminPricingForm from '@/components/AdminPricingForm';

/**
 * Admin dashboard page. Access is controlled by a token provided via
 * an input field. Once authenticated the dashboard displays current
 * bookings and allows editing of the pricing configuration. A
 * production deployment should secure this route with a proper
 * authentication strategy; for the sake of simplicity this
 * implementation relies on an admin token stored in an environment
 * variable and provided via the `x-admin-token` header on API calls.
 */
export default function AdminPage() {
  const [token, setToken] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [pricing, setPricing] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchDashboard() {
    try {
      // fetch bookings and config simultaneously
      const [bookingsRes, configRes] = await Promise.all([
        fetch('/api/admin/bookings?order=desc', {
          headers: { 'x-admin-token': token }
        }),
        fetch('/api/admin/config', {
          headers: { 'x-admin-token': token }
        })
      ]);
      if (!bookingsRes.ok || !configRes.ok) {
        throw new Error('Invalid token');
      }
      const bookingsData = await bookingsRes.json();
      const configData = await configRes.json();
      setBookings(bookingsData.bookings);
      setPricing(configData.pricing);
      setAuthenticated(true);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      setAuthenticated(false);
    }
  }

  async function handleLogin(e: any) {
    e.preventDefault();
    await fetchDashboard();
  }

  async function updateBookingStatus(bookingId: number, status: string) {
    await fetch('/api/admin/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': token
      },
      body: JSON.stringify({ bookingId, status })
    });
    await fetchDashboard();
  }

  async function savePricing(updates: any) {
    await fetch('/api/admin/update-config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': token
      },
      body: JSON.stringify({ key: 'pricing', updates })
    });
    await fetchDashboard();
  }

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      {!authenticated ? (
        <form onSubmit={handleLogin} className="max-w-md bg-gray-900 p-4 rounded">
          <label className="block mb-2">Admin token</label>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded mb-4"
          />
          <button type="submit" className="bg-primary text-black px-4 py-2 rounded">Login</button>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </form>
      ) : (
        <div>
          <h2 className="text-xl font-semibold mb-2">Bookings</h2>
          <BookingsTable bookings={bookings} onStatusChange={updateBookingStatus} />
          {pricing && <AdminPricingForm pricing={pricing} onSave={savePricing} />}
        </div>
      )}
    </div>
  );
}
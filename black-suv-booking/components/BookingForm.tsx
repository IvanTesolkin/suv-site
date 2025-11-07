"use client";
import { useState } from 'react';
import ModeTabs from '@/components/ModeTabs';
import PriceSummary from '@/components/PriceSummary';

interface BookingFormProps {
  pricingConfig: any;
  packages: any[];
  addons: any[];
}

/**
 * The main booking form component. It renders fields common to all
 * booking modes as well as mode specific inputs. When the user
 * requests a price quote the component calls the `/api/calculate-price`
 * endpoint and displays the returned price summary. On submit it
 * posts the form data to `/api/create-booking`.
 */
export default function BookingForm({ pricingConfig, packages, addons }: BookingFormProps) {
  const availableModes: { id: string; label: string }[] = [];
  if (pricingConfig.enablePointToPoint) availableModes.push({ id: 'point_to_point', label: 'Point‑to‑Point' });
  if (pricingConfig.enableHourly) availableModes.push({ id: 'hourly', label: 'Hourly' });
  if (pricingConfig.enablePackages) availableModes.push({ id: 'package', label: 'Packages' });
  const defaultMode = availableModes[0]?.id || 'point_to_point';
  const [mode, setMode] = useState<string>(defaultMode);
  const [form, setForm] = useState<any>({
    name: '',
    phone: '',
    email: '',
    preferredContact: 'text',
    passengers: 1,
    datetime: '',
    pickupAddress: '',
    dropoffAddress: '',
    hours: 2,
    packageId: packages?.[0]?.id || '',
    addons: {} as Record<string, any>
  });
  const [priceResult, setPriceResult] = useState<any>(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);

  function handleChange(e: any) {
    const { name, value, type, checked } = e.target;
    setForm((prev: any) => {
      if (name.startsWith('addon-')) {
        const id = name.replace('addon-', '');
        const addonsState = { ...prev.addons };
        if (type === 'checkbox') {
          addonsState[id] = checked;
        } else if (type === 'number') {
          addonsState[id] = value;
        } else {
          addonsState[id] = value;
        }
        return { ...prev, addons: addonsState };
      }
      return { ...prev, [name]: value };
    });
  }

  async function requestPrice() {
    setLoadingPrice(true);
    setPriceResult(null);
    try {
      const body: any = {
        mode,
        datetime: form.datetime,
        addons: form.addons,
        pickupAddress: form.pickupAddress,
        dropoffAddress: form.dropoffAddress
      };
      if (mode === 'point_to_point') {
        // addresses will be used by API to calculate distance/duration
      } else if (mode === 'hourly') {
        body.hours = Number(form.hours);
      } else if (mode === 'package') {
        body.packageId = form.packageId;
      }
      const res = await fetch('/api/calculate-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to calculate price');
      setPriceResult(result);
    } catch (error: any) {
      setSubmitStatus(`Error: ${error.message}`);
    } finally {
      setLoadingPrice(false);
    }
  }

  async function handleSubmit(e: any) {
    e.preventDefault();
    setSubmitStatus(null);
    // ensure price is calculated
    if (!priceResult) {
      await requestPrice();
    }
    try {
      const payload: any = {
        mode,
        name: form.name,
        phone: form.phone,
        email: form.email,
        preferredContact: form.preferredContact,
        passengers: Number(form.passengers),
        datetime: form.datetime,
        pickupAddress: form.pickupAddress,
        addons: form.addons,
        calculatedPrice: priceResult,
        distanceMiles: priceResult?.breakdown?.distanceComponent ? undefined : undefined,
        durationMinutes: priceResult?.breakdown?.timeComponent ? undefined : undefined
      };
      if (mode === 'point_to_point') {
        payload.pickupAddress = form.pickupAddress;
        payload.dropoffAddress = form.dropoffAddress;
      } else if (mode === 'hourly') {
        payload.hours = Number(form.hours);
        payload.pickupAddress = form.pickupAddress;
      } else if (mode === 'package') {
        payload.packageId = form.packageId;
        payload.pickupAddress = form.pickupAddress;
      }
      const res = await fetch('/api/create-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to create booking');
      setSubmitStatus('Your booking has been submitted successfully!');
    } catch (error: any) {
      setSubmitStatus(`Error: ${error.message}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto py-8">
      {/* Mode selection */}
      <ModeTabs modes={availableModes} value={mode} onChange={(m) => { setMode(m); setPriceResult(null); }} />
      {/* Common fields */}
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm mb-1">Name*</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Phone*</label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Preferred contact</label>
          <select
            name="preferredContact"
            value={form.preferredContact}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
          >
            <option value="text">Text</option>
            <option value="call">Call</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Passengers</label>
          <select
            name="passengers"
            value={form.passengers}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
          >
            {[...Array(7)].map((_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Pickup date & time*</label>
          <input
            type="datetime-local"
            name="datetime"
            value={form.datetime}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
          />
        </div>
      </div>
      {/* Mode specific fields */}
      {mode === 'point_to_point' && (
        <div className="mt-4 grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm mb-1">Pickup address*</label>
            <input
              type="text"
              name="pickupAddress"
              value={form.pickupAddress}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Drop‑off address*</label>
            <input
              type="text"
              name="dropoffAddress"
              value={form.dropoffAddress}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
            />
          </div>
        </div>
      )}
      {mode === 'hourly' && (
        <div className="mt-4 grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm mb-1">Pickup address*</label>
            <input
              type="text"
              name="pickupAddress"
              value={form.pickupAddress}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Duration (hours)*</label>
            <select
              name="hours"
              value={form.hours}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
            >
              {Object.keys(pricingConfig.hourlyRatesByDuration).map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>
        </div>
      )}
      {mode === 'package' && (
        <div className="mt-4 grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm mb-1">Pickup address*</label>
            <input
              type="text"
              name="pickupAddress"
              value={form.pickupAddress}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Package*</label>
            <select
              name="packageId"
              value={form.packageId}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
            >
              {packages.filter((p) => p.active).map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}
      {/* Add‑ons */}
      {addons && addons.filter((a) => a.active).length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Add‑ons</h4>
          <div className="space-y-2">
            {addons.filter((a) => a.active).map((addon) => (
              <div key={addon.id} className="flex items-center justify-between">
                <label className="mr-2">{addon.label}</label>
                {addon.type === 'checkbox' && (
                  <input
                    type="checkbox"
                    name={`addon-${addon.id}`}
                    checked={!!form.addons[addon.id]}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                )}
                {addon.type === 'number' && (
                  <input
                    type="number"
                    min={0}
                    name={`addon-${addon.id}`}
                    value={form.addons[addon.id] || ''}
                    onChange={handleChange}
                    className="w-20 px-2 py-1 bg-gray-800 border border-gray-700 rounded"
                  />
                )}
                {addon.type === 'select' && Array.isArray(addon.options) && (
                  <select
                    name={`addon-${addon.id}`}
                    value={form.addons[addon.id] || ''}
                    onChange={handleChange}
                    className="w-40 px-2 py-1 bg-gray-800 border border-gray-700 rounded"
                  >
                    {addon.options.map((opt: any) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Buttons */}
      <div className="mt-6 flex flex-col space-y-2">
          <button
            type="button"
            onClick={requestPrice}
            disabled={loadingPrice}
            className="bg-primary text-black px-4 py-2 rounded hover:opacity-90 disabled:opacity-50"
          >
            {loadingPrice ? 'Calculating...' : 'Get Price'}
          </button>
          <button
            type="submit"
            className="bg-primary text-black px-4 py-2 rounded hover:opacity-90"
          >
            Submit Booking
          </button>
          {submitStatus && (
            <p className="text-sm mt-2">{submitStatus}</p>
          )}
      </div>
      {/* Price Summary */}
      <PriceSummary result={priceResult} />
    </form>
  );
}
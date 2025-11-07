"use client";
import { useState } from 'react';

interface AdminPricingFormProps {
  pricing: any;
  onSave: (updates: any) => Promise<void>;
}

/**
 * Form used by the admin to edit a handful of pricing parameters. More
 * fields can be added as required. The form maintains local state
 * until the user clicks save, at which point the `onSave` callback
 * persists the changes via the admin API.
 */
export default function AdminPricingForm({ pricing, onSave }: AdminPricingFormProps) {
  const [values, setValues] = useState<any>({
    baseFee: pricing.baseFee,
    ratePerMile: pricing.ratePerMile,
    ratePerMinute: pricing.ratePerMinute,
    minFare: pricing.minFare,
    roundingStep: pricing.roundingStep
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function handleChange(e: any) {
    const { name, value } = e.target;
    setValues((prev: any) => ({ ...prev, [name]: value }));
  }

  async function handleSave(e: any) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      // convert strings to numbers
      const updates: any = {};
      Object.keys(values).forEach((key) => {
        updates[key] = parseFloat(values[key]);
      });
      await onSave(updates);
      setMessage('Configuration saved');
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="bg-gray-900 p-4 rounded-md space-y-4 mt-4">
      <h3 className="text-lg font-semibold">Pricing Configuration</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.keys(values).map((key) => (
          <div key={key}>
            <label className="block text-sm capitalize mb-1">{key.replace(/([A-Z])/g, ' $1')}</label>
            <input
              type="number"
              name={key}
              value={values[key]}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
            />
          </div>
        ))}
      </div>
      <button
        type="submit"
        disabled={saving}
        className="bg-primary text-black px-4 py-2 rounded hover:opacity-90 disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save'}
      </button>
      {message && <p className="text-sm mt-2">{message}</p>}
    </form>
  );
}
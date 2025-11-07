"use client";

interface PriceSummaryProps {
  result: {
    price: number;
    currency: string;
    breakdown: Record<string, any>;
    isEstimated: boolean;
  } | null;
}

/**
 * Displays the calculated price and a breakdown of the components. If
 * the result is null nothing is rendered. When `isEstimated` is
 * true the component includes a note indicating the price is an
 * estimate.
 */
export default function PriceSummary({ result }: PriceSummaryProps) {
  if (!result) return null;
  const { price, currency, breakdown, isEstimated } = result;
  return (
    <div className="bg-gray-800 p-4 rounded-lg mt-4 text-sm">
      <h3 className="text-lg mb-2 font-semibold">Price Summary</h3>
      <div className="flex justify-between py-1">
        <span>Base</span>
        <span>{breakdown.base?.toFixed(2)} {currency}</span>
      </div>
      {breakdown.distanceComponent !== undefined && (
        <div className="flex justify-between py-1">
          <span>Distance</span>
          <span>{breakdown.distanceComponent.toFixed(2)} {currency}</span>
        </div>
      )}
      {breakdown.timeComponent !== undefined && (
        <div className="flex justify-between py-1">
          <span>Time</span>
          <span>{breakdown.timeComponent.toFixed(2)} {currency}</span>
        </div>
      )}
      {breakdown.multiplier !== undefined && breakdown.multiplier !== 1 && (
        <div className="flex justify-between py-1">
          <span>Time multiplier</span>
          <span>× {breakdown.multiplier}</span>
        </div>
      )}
      {breakdown.addons !== undefined && breakdown.addons > 0 && (
        <div className="flex justify-between py-1">
          <span>Add‑ons</span>
          <span>{breakdown.addons.toFixed(2)} {currency}</span>
        </div>
      )}
      <hr className="my-2 border-gray-700" />
      <div className="flex justify-between font-bold text-lg">
        <span>Total{isEstimated ? ' (estimated)' : ''}</span>
        <span>{price.toFixed(2)} {currency}</span>
      </div>
    </div>
  );
}
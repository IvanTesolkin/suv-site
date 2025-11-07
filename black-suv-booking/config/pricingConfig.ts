/**
 * Pricing configuration.
 *
 * This file defines all of the variables used by the pricing engine.
 * The owner can adjust any value here via the admin panel. When
 * calculating trip prices the `lib/pricing.ts` module reads from
 * this configuration and applies the appropriate multipliers,
 * minimums and rounding.
 */
const pricingConfig = {
  baseFee: 20,               // base fee charged for any trip
  ratePerMile: 3,            // cost per mile for point‑to‑point bookings
  ratePerMinute: 1,          // cost per minute for point‑to‑point bookings
  hourlyRateDefault: 80,     // default hourly rate if duration specific rate is not defined
  hourlyRatesByDuration: {
    2: 150,
    3: 210,
    4: 260,
    6: 360,
    8: 480,
    12: 700,
    24: 1200
  },
  minFare: 50,               // minimum fare applied to all bookings
  roundingStep: 5,           // round price up to nearest 5 dollars
  useDistanceApi: true,      // whether to call the Google Distance Matrix API
  showPriceAsFixed: false,   // if true display price as fixed, otherwise as estimate
  enablePointToPoint: true,  // toggle for point‑to‑point bookings
  enableHourly: true,        // toggle for hourly bookings
  enablePackages: true,      // toggle for packages
  applyMultipliersToPackages: true, // apply time multipliers to packages
  // Time of day multipliers expressed as ranges with inclusive start and end times.
  timeMultipliers: [
    { from: '06:00', to: '08:59', multiplier: 1.2 },
    { from: '16:00', to: '19:59', multiplier: 1.3 },
    { from: '20:00', to: '05:59', multiplier: 1.4 },
    { from: '09:00', to: '15:59', multiplier: 1.0 }
  ],
  currency: 'USD',           // currency code used throughout the site
  paymentsEnabled: false,    // whether Stripe payments are enabled
  depositPercentage: 0.3     // deposit percentage when payments are enabled
};

export default pricingConfig;
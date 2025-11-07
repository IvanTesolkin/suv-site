import { getTimeMultiplier } from '@/lib/time';
import { getConfig } from '@/lib/configService';

/**
 * Calculate the cost of selected add‑ons. The input is a map of
 * add‑on ids to their value (for example a quantity for a number
 * input or a boolean for a checkbox). Prices are read from the
 * configuration using `getConfig('addons')`. Hours is used when
 * calculating per‑hour add‑ons.
 */
async function calculateAddonsCost(addonInput: Record<string, any>, hours: number): Promise<number> {
  const addons = await getConfig('addons') as any[];
  let total = 0;
  for (const addon of addons) {
    if (!addon.active) continue;
    const value = addonInput?.[addon.id];
    if (!value) continue;
    // determine quantity: for number inputs use the provided number, for
    // checkboxes a boolean indicates 1, for selects the value is used
    const quantity = addon.type === 'number' ? Number(value) : 1;
    if (addon.priceType === 'flat' || addon.priceType === 'per_trip') {
      total += quantity * addon.priceValue;
    } else if (addon.priceType === 'per_hour') {
      total += quantity * addon.priceValue * hours;
    }
  }
  return total;
}

/**
 * Calculate the price for a point‑to‑point booking. Distance (miles)
 * and duration (minutes) must be provided. The datetime is used to
 * determine which time multiplier applies.
 */
async function calculatePointToPoint(args: {
  distanceMiles: number;
  durationMinutes: number;
  datetime: Date;
  addons: Record<string, any>;
}) {
  const config = await getConfig('pricing') as any;
  const { baseFee, ratePerMile, ratePerMinute, minFare, roundingStep, currency, showPriceAsFixed } = config;
  const multiplier = getTimeMultiplier(args.datetime);
  const distanceComponent = args.distanceMiles * config.ratePerMile;
  const timeComponent = args.durationMinutes * config.ratePerMinute;
  let base = baseFee + distanceComponent + timeComponent;
  base *= multiplier;
  const addonsCost = await calculateAddonsCost(args.addons, args.durationMinutes / 60);
  let price = base + addonsCost;
  if (price < minFare) price = minFare;
  // round up to nearest rounding step
  price = Math.ceil(price / roundingStep) * roundingStep;
  return {
    price,
    currency,
    breakdown: {
      base: baseFee,
      distanceComponent,
      timeComponent,
      multiplier,
      addons: addonsCost
    },
    isEstimated: !showPriceAsFixed
  };
}

/**
 * Calculate the price for an hourly booking. The number of hours must
 * be provided. A custom hourly rate is used when defined for the
 * specific duration otherwise the default hourly rate applies.
 */
async function calculateHourly(args: {
  hours: number;
  datetime: Date;
  addons: Record<string, any>;
}) {
  const config = await getConfig('pricing') as any;
  const { hourlyRateDefault, hourlyRatesByDuration, minFare, roundingStep, currency, showPriceAsFixed } = config;
  const hoursRounded = Math.ceil(args.hours);
  const rate = hourlyRatesByDuration[hoursRounded] ?? hourlyRateDefault;
  let base = rate * args.hours;
  const multiplier = getTimeMultiplier(args.datetime);
  base *= multiplier;
  const addonsCost = await calculateAddonsCost(args.addons, args.hours);
  let price = base + addonsCost;
  if (price < minFare) price = minFare;
  price = Math.ceil(price / roundingStep) * roundingStep;
  return {
    price,
    currency,
    breakdown: {
      base: rate * args.hours,
      multiplier,
      addons: addonsCost
    },
    isEstimated: !showPriceAsFixed
  };
}

/**
 * Calculate the price for a package booking. A valid package id
 * referencing an entry in `packagesConfig` must be provided. The
 * package defines the base price and included hours/miles. When
 * configured, the time multiplier will be applied to the base price.
 */
async function calculatePackage(args: {
  packageId: string;
  datetime: Date;
  addons: Record<string, any>;
}) {
  const config = await getConfig('pricing') as any;
  const packages = await getConfig('packages') as any[];
  const pkg = packages.find((p) => p.id === args.packageId && p.active);
  if (!pkg) {
    throw new Error('Invalid package');
  }
  let base = pkg.basePrice;
  let multiplier = 1;
  if (config.applyMultipliersToPackages && pkg.applyTimeMultiplier) {
    multiplier = getTimeMultiplier(args.datetime);
    base *= multiplier;
  }
  const addonsCost = await calculateAddonsCost(args.addons, pkg.includedHours);
  const price = Math.ceil((base + addonsCost) / config.roundingStep) * config.roundingStep;
  return {
    price,
    currency: config.currency,
    breakdown: {
      base: pkg.basePrice,
      multiplier,
      addons: addonsCost
    },
    isEstimated: !config.showPriceAsFixed
  };
}

/**
 * Main entry point for the pricing engine. Dispatches to the
 * appropriate calculation function based on the selected mode.
 */
export async function calculatePrice(mode: string, args: any) {
  switch (mode) {
    case 'point_to_point':
      return calculatePointToPoint(args);
    case 'hourly':
      return calculateHourly(args);
    case 'package':
      return calculatePackage(args);
    default:
      throw new Error(`Unknown booking mode: ${mode}`);
  }
}
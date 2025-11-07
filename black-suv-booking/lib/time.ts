import pricingConfig from '@/config/pricingConfig';

/**
 * Parse a HH:MM string into total minutes.
 */
function parseTimeString(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Determine which time of day multiplier applies for the provided
 * pickup datetime. Multipliers are defined in the pricing config as
 * ranges of times in 24 hour format. Ranges that wrap past
 * midnight (e.g. 20:00 to 05:59) are handled correctly.
 *
 * @param dt Date object representing the requested pickup
 * @returns the multiplier to apply (defaults to 1)
 */
export function getTimeMultiplier(dt: Date): number {
  const { timeMultipliers } = pricingConfig;
  const minutes = dt.getHours() * 60 + dt.getMinutes();
  for (const rule of timeMultipliers) {
    const from = parseTimeString(rule.from);
    const to = parseTimeString(rule.to);
    // wrap‑around range
    if (to < from) {
      if (minutes >= from || minutes <= to) {
        return rule.multiplier;
      }
    } else {
      if (minutes >= from && minutes <= to) {
        return rule.multiplier;
      }
    }
  }
  return 1;
}
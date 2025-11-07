/**
 * Predefined packages offered by the driver.
 *
 * Each package defines a base price, included hours and miles and
 * optional overtime rates. The `applyTimeMultiplier` flag controls
 * whether the time of day multiplier should be applied to the
 * package price. The `active` flag determines whether the package is
 * presented to customers.
 */
const packagesConfig = [
  {
    id: '3h',
    name: '3 Hours',
    basePrice: 240,
    includedHours: 3,
    includedMiles: 50,
    overtimePerHour: 80,
    overtimePerMile: 3,
    applyTimeMultiplier: true,
    active: true
  },
  {
    id: '6h',
    name: '6 Hours',
    basePrice: 450,
    includedHours: 6,
    includedMiles: 100,
    overtimePerHour: 70,
    overtimePerMile: 3,
    applyTimeMultiplier: true,
    active: true
  },
  {
    id: '12h',
    name: '12 Hours',
    basePrice: 850,
    includedHours: 12,
    includedMiles: 200,
    overtimePerHour: 60,
    overtimePerMile: 2.5,
    applyTimeMultiplier: true,
    active: true
  },
  {
    id: '24h',
    name: '24 Hours',
    basePrice: 1600,
    includedHours: 24,
    includedMiles: 400,
    overtimePerHour: 50,
    overtimePerMile: 2.0,
    applyTimeMultiplier: false,
    active: true
  }
];

export default packagesConfig;
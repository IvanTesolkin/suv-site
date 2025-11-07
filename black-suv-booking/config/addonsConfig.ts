/**
 * Optional add‑ons available to customers. Each add‑on can be priced
 * as a flat fee or per hour. The `type` determines whether the UI
 * presents a checkbox, number input or select box. The `active`
 * property controls whether the add‑on is visible to customers.
 */
const addonsConfig = [
  {
    id: 'extra-stop',
    label: 'Extra Stop',
    type: 'number',
    priceType: 'flat',
    priceValue: 20,
    active: true
  },
  {
    id: 'child-seat',
    label: 'Child Seat',
    type: 'checkbox',
    priceType: 'flat',
    priceValue: 15,
    active: true
  },
  {
    id: 'airport-greeting',
    label: 'Airport Greeting Service',
    type: 'checkbox',
    priceType: 'flat',
    priceValue: 25,
    active: true
  },
  {
    id: 'premium-water',
    label: 'Premium Water',
    type: 'checkbox',
    priceType: 'flat',
    priceValue: 5,
    active: false
  }
];

export default addonsConfig;
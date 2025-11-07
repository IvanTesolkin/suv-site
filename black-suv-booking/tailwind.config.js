/**
 * Tailwind CSS configuration for the Black SUV booking site.
 *
 * This configuration specifies the files to scan for class names and
 * defines a simple dark theme with gold accents. If you wish to
 * customise the colour palette further you can do so here. The
 * colour keys defined under `extend` are used throughout the
 * components for a consistent look and feel.
 */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#D4AF37' // gold accent colour
        },
        background: '#000000',
        foreground: '#ffffff'
      }
    }
  },
  plugins: []
};
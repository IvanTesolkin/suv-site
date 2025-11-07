import { getConfig } from '@/lib/configService';
import BookingForm from '@/components/BookingForm';

/**
 * Home page server component. It loads the site and pricing
 * configuration from the database (or defaults) and passes them to
 * the client side booking form. The hero section uses the copy
 * defined in the site config.
 */
export default async function Home() {
  const siteConfig: any = await getConfig('site');
  const pricingConfig: any = await getConfig('pricing');
  const packages = await getConfig('packages');
  const addons = await getConfig('addons');
  return (
    <div>
      {/* Hero section */}
      <section className="text-center py-12 bg-gradient-to-b from-black via-gray-900 to-black">
        <h1 className="text-3xl md:text-5xl font-bold mb-4 text-primary">{siteConfig.heroHeadline}</h1>
        <p className="text-lg md:text-2xl mb-6">{siteConfig.subHeadline}</p>
        <a
          href="#booking"
          className="inline-block bg-primary text-black px-6 py-3 rounded-md font-semibold hover:opacity-90"
        >
          {siteConfig.ctaText}
        </a>
      </section>
      {/* Benefits */}
      <section className="py-8 px-4 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        {siteConfig.benefits?.map((benefit: string, idx: number) => (
          <div key={idx} className="flex items-start space-x-3">
            <span className="text-primary">✔</span>
            <span>{benefit}</span>
          </div>
        ))}
      </section>
      {/* Booking form */}
      <section id="booking" className="py-8 px-4">
        <h2 className="text-2xl font-semibold mb-4 text-center">Book your ride</h2>
        <BookingForm pricingConfig={pricingConfig} packages={packages} addons={addons} />
      </section>
      {/* Contact and footer */}
      <footer className="py-8 text-center text-sm border-t border-gray-800">
        <div>
          <p>{siteConfig.contactTextHint}: <a href={`tel:${siteConfig.contactPhone}`} className="text-primary">{siteConfig.contactPhone}</a></p>
        </div>
        <p className="mt-2 text-gray-500">{siteConfig.footerText}</p>
      </footer>
    </div>
  );
}
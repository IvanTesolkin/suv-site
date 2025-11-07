import prisma from '@/lib/prisma';
import defaultPricingConfig from '@/config/pricingConfig';
import defaultSiteConfig from '@/config/siteConfig';
import defaultPackagesConfig from '@/config/packagesConfig';
import defaultAddonsConfig from '@/config/addonsConfig';

/**
 * Fetch a configuration object from the database, falling back to the
 * default exported values when no override exists. Config values are
 * stored in the `Setting` table as JSON blobs keyed by name (e.g.
 * 'pricing', 'site', 'packages', 'addons').
 */
export async function getConfig(key: 'pricing' | 'site' | 'packages' | 'addons') {
  const record = await prisma.setting.findUnique({ where: { key } });
  switch (key) {
    case 'pricing':
      return record ? { ...defaultPricingConfig, ...record.value } : defaultPricingConfig;
    case 'site':
      return record ? { ...defaultSiteConfig, ...record.value } : defaultSiteConfig;
    case 'packages':
      return record ? (record.value as any[]) : defaultPackagesConfig;
    case 'addons':
      return record ? (record.value as any[]) : defaultAddonsConfig;
    default:
      return {};
  }
}

/**
 * Update a configuration object in the database. The provided `updates`
 * object is shallow merged with the current configuration before
 * persisting. When a record does not exist it is created. This
 * function returns the new configuration object.
 */
export async function updateConfig(key: 'pricing' | 'site' | 'packages' | 'addons', updates: any) {
  const current = await getConfig(key);
  // For array configs (packages and addons), completely replace with provided updates
  let newValue: any;
  if (Array.isArray(current)) {
    newValue = updates;
  } else {
    newValue = { ...current, ...updates };
  }
  await prisma.setting.upsert({
    where: { key },
    update: { value: newValue },
    create: { key, value: newValue }
  });
  return newValue;
}
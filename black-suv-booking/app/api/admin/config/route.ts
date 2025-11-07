import { NextResponse } from 'next/server';
import { getConfig } from '@/lib/configService';

/**
 * Returns the current configuration values for pricing, site,
 * packages and add‑ons. The response is protected by the
 * ADMIN_TOKEN header. The admin panel uses this endpoint to
 * populate the edit forms.
 */
export async function GET(request: Request) {
  const adminToken = process.env.ADMIN_TOKEN;
  const incomingToken = request.headers.get('x-admin-token');
  if (!adminToken || incomingToken !== adminToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const pricing = await getConfig('pricing');
  const site = await getConfig('site');
  const packages = await getConfig('packages');
  const addons = await getConfig('addons');
  return NextResponse.json({ pricing, site, packages, addons });
}
import { NextResponse } from 'next/server';
import { updateConfig } from '@/lib/configService';

/**
 * API route used by the admin panel to update configuration values
 * stored in the database. The request body must include a `key`
 * identifying which configuration to update (pricing, site, packages,
 * addons) and an `updates` object or array with the new values.
 *
 * This endpoint is protected by an environment variable based token
 * supplied via the `x-admin-token` header. Requests without a
 * matching token are rejected.
 */
export async function POST(request: Request) {
  const adminToken = process.env.ADMIN_TOKEN;
  const incomingToken = request.headers.get('x-admin-token');
  if (!adminToken || incomingToken !== adminToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { key, updates } = body;
    if (!key || updates === undefined) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    // Only accept known keys
    if (!['pricing', 'site', 'packages', 'addons'].includes(key)) {
      return NextResponse.json({ error: 'Unknown config key' }, { status: 400 });
    }
    const newConfig = await updateConfig(key as any, updates);
    return NextResponse.json({ success: true, config: newConfig });
  } catch (error: any) {
    console.error('Error updating config:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
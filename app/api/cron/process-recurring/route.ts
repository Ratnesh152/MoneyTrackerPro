import { NextResponse } from 'next/server';
import { recurringEngineService } from '@/services/recurring-engine.service';
import { env } from '@/config/env';

// This is a secure endpoint that should only be called by a trusted cron service (like Vercel Cron)
// In a real application, you'd use a secret token to verify the caller.
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    // Simple basic auth or bearer token check (example using a CRON_SECRET env var)
    // If you don't have CRON_SECRET set, we'll allow it for development, but warn.
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Usually, cron jobs run system-wide, so you might need to fetch ALL users and process them.
    // For this prototype, we'll assume we need to process it for a specific owner, or we'd need
    // an admin API to fetch all distinct ownerEntraObjectIds.
    // Since we don't have a way to fetch ALL users natively yet, we expect the caller 
    // to pass the owner ID in the query string for now, or we can build an admin endpoint later.

    const url = new URL(request.url);
    const ownerId = url.searchParams.get('ownerId');

    if (!ownerId) {
      return NextResponse.json({ 
        error: 'ownerId is required in the query string for this prototype.' 
      }, { status: 400 });
    }

    await recurringEngineService.processDueTransactions(ownerId);

    return NextResponse.json({ success: true, message: `Processed recurring transactions for ${ownerId}` });
  } catch (error: any) {
    console.error('Error processing recurring transactions:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

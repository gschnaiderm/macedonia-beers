import { verifyWebhook } from '@clerk/nextjs/webhooks';
import { NextRequest } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  // ALWAYS verify - never skip, even for notification-only handlers
  let evt;
  try {
    evt = await verifyWebhook(req); // uses CLERK_WEBHOOK_SIGNING_SECRET automatically
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return new Response('Verification failed', { status: 400 });
  }

  if (evt.type === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data;
    const email = email_addresses[0]?.email_address || '';
    const firstName = first_name ?? null;
    const lastName = last_name ?? null;
    
    await db.insert(users).values({ 
      clerkId: id, 
      email, 
      firstName, 
      lastName 
    });
  }

  if (evt.type === 'user.updated') {
    const { id, email_addresses, first_name, last_name } = evt.data;
    const email = email_addresses[0]?.email_address || '';
    const firstName = first_name ?? null;
    const lastName = last_name ?? null;
    
    await db.update(users)
      .set({ email, firstName, lastName })
      .where(eq(users.clerkId, id));
  }

  if (evt.type === 'user.deleted') {
    const { id } = evt.data;
    if (id) {
      await db.delete(users).where(eq(users.clerkId, id));
    }
  }

  return new Response('OK', { status: 200 });
}

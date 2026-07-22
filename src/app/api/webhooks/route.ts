import { verifyWebhook } from '@clerk/nextjs/webhooks';
import { NextRequest } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
	let evt;
	try {
		evt = await verifyWebhook(req); // uses CLERK_WEBHOOK_SIGNING_SECRET automatically
	} catch (err) {
		console.error('Webhook verification failed:', err);
		return new Response('Verification failed', { status: 400 });
	}

	try {
		switch (evt.type) {
			case 'user.created':
				await handleUserCreated(evt.data);
				break;
			case 'user.updated':
				await handleUserUpdated(evt.data);
				break;
			case 'user.deleted':
				await handleUserDeleted(evt.data);
				break;
			default:
				console.log(`Ignored unhandled event: ${evt.type}`);
		}
	} catch (error) {
		console.error(`Error processing event ${evt.type}:`, error);
		return new Response('Error processing event', { status: 500 });
	}

	return new Response('OK', { status: 200 });
}

async function handleUserCreated(data: any) {
	const { id, email_addresses, first_name, last_name, public_metadata } = data;
	const email = email_addresses[0]?.email_address || '';
	const firstName = first_name ?? null;
	const lastName = last_name ?? null;

	const role = (public_metadata?.role as string) || 'customer';

	if (!public_metadata?.role) {
		await setDefaultRole(id);
	}

	await db.insert(users).values({
		clerkId: id,
		email,
		firstName,
		lastName,
		role
	});
}

async function handleUserUpdated(data: any) {
	const { id, email_addresses, first_name, last_name, public_metadata } = data;
	const email = email_addresses[0]?.email_address || '';
	const firstName = first_name ?? null;
	const lastName = last_name ?? null;
	const role = (public_metadata?.role as string) || 'customer';

	await db.update(users)
		.set({ email, firstName, lastName, role })
		.where(eq(users.clerkId, id));
}

async function handleUserDeleted(data: any) {
	const { id } = data;
	if (id) {
		await db.delete(users).where(eq(users.clerkId, id));
	}
}

async function setDefaultRole(id: string) {
	try {
		const client = await clerkClient();
		await client.users.updateUserMetadata(id, {
			publicMetadata: {
				role: 'customer'
			}
		});
	} catch (error) {
		console.error('Error assigning default role in Clerk:', error);
	}
}



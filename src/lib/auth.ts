import { auth } from "@clerk/nextjs/server";

// Uses JWT to not check on DB
export async function checkIsAdmin(): Promise<boolean> {
	const { userId, sessionClaims } = await auth();

	if (!userId) {
		return false;
	}

	const role =
		(sessionClaims?.publicMetadata as any)?.role ||
		(sessionClaims?.metadata as any)?.role ||
		(sessionClaims as any)?.role;

	return role === "admin";
}

import { db } from './index.ts';
import { profiles } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function getOrCreateUser(uid: string, email: string, fullName?: string, role = 'student') {
  try {
    const existing = await db.select().from(profiles).where(eq(profiles.id, uid));
    if (existing.length > 0) {
      return existing[0];
    }

    const inserted = await db
      .insert(profiles)
      .values({
        id: uid,
        email,
        fullName: fullName || email.split('@')[0],
        role,
      })
      .returning();

    return inserted[0];
  } catch (error) {
    console.error('Error in getOrCreateUser:', error);
    throw new Error('Database operation failed', { cause: error });
  }
}

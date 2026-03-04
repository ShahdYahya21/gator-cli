import { db } from "..";
import { users } from "../schema";
import { eq } from "drizzle-orm";

export async function createUser(name: string) {
  const [result] = await db.insert(users).values({ name: name }).returning();
  return result;
}

//Write another query to get a user by name.
export async function getUserByName(name: string) {
  const [result] = await db.select().from(users).where(eq(users.name, name)).limit(1);
  return result;
}



export async function deleteAllUsers() {
  await db.delete(users).execute();
}

export async function getUsers() {
   const result = await db.select().from(users);
   return result;
}

export async function getUserById(id: string) {
  const [result] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result;
}


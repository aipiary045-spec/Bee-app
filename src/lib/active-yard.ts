import { cookies } from "next/headers";
import { ACTIVE_YARD_COOKIE } from "@/lib/yards";

export async function readActiveYardId(): Promise<string | null> {
  const store = await cookies();
  return store.get(ACTIVE_YARD_COOKIE)?.value ?? null;
}

export async function writeActiveYardId(yardId: string): Promise<void> {
  const store = await cookies();
  store.set(ACTIVE_YARD_COOKIE, yardId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}

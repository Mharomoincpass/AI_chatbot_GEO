import { NextResponse } from "next/server";
import { createGuestUser } from "@/lib/db/queries.mongo";

const GUEST_USER_ID_COOKIE = "guest_user_id";

export async function POST() {
  try {
    const guest = await createGuestUser();
    const response = NextResponse.json({ id: guest.id });

    response.cookies.set(GUEST_USER_ID_COOKIE, guest.id, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    return response;
  } catch (error) {
    console.error("❌ Guest creation failed:", error);
    return NextResponse.json({ error: "Failed to create guest user" }, { status: 500 });
  }
}

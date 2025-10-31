import { cookies } from "next/headers";
import { Chat } from "@/components/chat";
import { nanoid } from "@/lib/utils";
import { auth } from "@/app/(auth)/auth";
import { getUser } from "@/lib/db/queries.mongo";

export const metadata = {
  title: "Next.js AI Chatbot",
};

const GUEST_USER_ID_COOKIE = "guest_user_id";

export default async function Page() {
  const id = nanoid();
  const session = await auth();
  const cookieStore = cookies();

  let userId = session?.user?.id;

  if (!userId) {
    let guestId = cookieStore.get(GUEST_USER_ID_COOKIE)?.value;
    if (guestId) {
      const guest = await getUser(guestId);
      if (!guest) guestId = undefined;
    }

    // ✅ Compute absolute URL safely for both local and deployed environments
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

    if (!guestId) {
      const res = await fetch(`${baseUrl}/api/guest`, {
        method: "POST",
        cache: "no-store",
      });

      const data = await res.json();
      guestId = data.id;
    }

    userId = guestId;
  }

  return (
    <Chat
      id={id}
      initialMessages={[]}
      initialChatModel="chat-model"
      initialVisibilityType="private"
      isReadonly={false}
      autoResume={false}
    />
  );
}

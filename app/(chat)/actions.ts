"use server";

import { revalidatePath } from "next/cache";
import redirect from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { type Chat } from "@/lib/db/queries.mongo";

import {
  deleteChat,
  getChats,
} from "@/lib/db/queries.mongo";

export async function getChatsAction() {
  const session = await auth();

  if (!session?.user?.id) {
    return [];
  }

  const chats = await getChats(session.user.id);

  return chats.map((chat) => ({ ...chat, _id: (chat._id as any).toString() })) as Chat[];
}

export async function removeChat({ id, path }: { id: string; path: string }) {
  const session = await auth();

  if (!session) {
    return {
      error: "Unauthorized",
    };
  }

  await deleteChat(id);

  revalidatePath("/");
  return revalidatePath(path);
}

// app/(chat)/api/history/route.ts
import type { NextRequest } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { getChatsByUserId, deleteAllChatsByUserId } from "@/lib/db/queries";
import { ChatSDKError } from "@/lib/errors";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const limit = Number.parseInt(searchParams.get("limit") || "10", 10);
  const startingAfter = searchParams.get("starting_after");
  const endingBefore = searchParams.get("ending_before");

  if (startingAfter && endingBefore) {
    return new ChatSDKError(
      "bad_request:api",
      "Only one of starting_after or ending_before can be provided."
    ).toResponse();
  }

  const session = await auth();
  if (!session?.user) {
    return new ChatSDKError(
      "unauthorized:chat",
      "You must be signed in to access chat history."
    ).toResponse();
  }

  const chats = await getChatsByUserId({
    id: session.user.id,
    limit,
    startingAfter,
    endingBefore,
  });

  return Response.json(chats, { status: 200 });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return new ChatSDKError(
      "unauthorized:chat",
      "You must be signed in to delete chats."
    ).toResponse();
  }

  const result = await deleteAllChatsByUserId({
    userId: session.user.id,
  });

  return Response.json(result, { status: 200 });
}

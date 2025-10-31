import { NextResponse } from "next/server";
import { streamText, convertToCoreMessages } from "ai";  
import { myProvider } from "@/lib/ai/providers";
import {
  saveMessages,
  saveChat,
  updateChatTitle,
} from "@/lib/db/queries.mongo";
import { nanoid } from "nanoid";
import { auth } from "@/app/(auth)/auth";

// POST /api/chat
export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { messages, id } = body;

    if (!Array.isArray(messages)) {
      if (body.message) messages = [body.message];
      else if (body.text)
        messages = [{ role: "user", content: body.text }];
      else throw new Error("Invalid message payload");
    }

    const session = await auth();
    const userId = session?.user?.id || "guest";
    const chatId = id || nanoid();

    const stream = await streamText({
      model: myProvider.languageModel("chat-model"),
      messages: convertToCoreMessages(messages),
      onFinish: async (completion) => {
        try {
          await saveChat({
            id: chatId,
            userId,
            title: messages[0]?.content?.slice(0, 60) || "New chat",
            visibility: "private",
            lastContext: completion.text,
          });
          await saveMessages({
            chatId,
            messages: [
              ...messages,
              {
                role: "assistant",
                content: completion.text,
                createdAt: new Date(),
              },
            ],
          });
          await updateChatTitle({
            id: chatId,
            title: messages[0]?.content?.slice(0, 60) || "New chat",
          });
        } catch (err) {
          console.error("💾 DB save error:", err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  } catch (error) {
    console.error("❌ Chat Route Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

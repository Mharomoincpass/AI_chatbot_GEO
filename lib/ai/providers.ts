import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { customProvider, wrapLanguageModel } from "ai";

// ✅ Create Google Provider using new v2 spec API
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
});

export const myProvider = customProvider({
  languageModels: {
    "chat-model": google.languageModel("gemini-1.5-flash"),
    "chat-model-reasoning": wrapLanguageModel({
      model: google.languageModel("gemini-1.5-pro"),
      middleware: async (input, next) => {
        const result = await next(input);
        if (result?.reasoning) {
          console.log("🧠 Gemini reasoning trace:", result.reasoning);
        }
        return result;
      },
    }),
    "title-model": google.languageModel("gemini-1.5-flash"),
    "artifact-model": google.languageModel("gemini-1.5-flash"),
  },
});

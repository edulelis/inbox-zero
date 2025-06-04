import { z } from "zod";
import { chatCompletionObject } from "@/utils/llms";
import type { EmailAccountWithAI } from "@/utils/llms/types";
import { createScopedLogger } from "@/utils/logger";
import type { EmailForLLM } from "@/utils/types";
import { stringifyEmailSimple } from "@/utils/stringify-email";

const logger = createScopedLogger("summarize-email");

const schema = z.object({
  summary: z.string().nullish().describe("The summary of the email."),
});
export type AICheckResult = z.infer<typeof schema>;

export async function aiSummarizeEmail({
  emailAccount,
  messageToSummarize,
}: {
  emailAccount: EmailAccountWithAI;
  messageToSummarize: EmailForLLM;
}): Promise<AICheckResult> {
  // If messageToSummarize somehow is null/undefined, default to null.
  if (!messageToSummarize) return { summary: null };

  const userMessageForPrompt = messageToSummarize;

  const system = "You are an AI assistant that summarizes emails for a digest.";

  const prompt = `

Summarize the following email into a daily digest format. 
Include key points or action items, and any important dates.
Keep summaries concise (2 - 4 sentences per email).
The tone should be professional and easy to scan quickly

<message>
${stringifyEmailSimple(userMessageForPrompt)}
</message>
`.trim();

  logger.trace("Input", { system, prompt });

  const aiResponse = await chatCompletionObject({
    userAi: emailAccount.user,
    system,
    prompt,
    schema,
    userEmail: emailAccount.email,
    usageLabel: "Summarize email",
  });

  logger.trace("Result", { response: aiResponse.object });

  return aiResponse.object as AICheckResult;
}

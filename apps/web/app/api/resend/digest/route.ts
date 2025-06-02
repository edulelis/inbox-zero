import { z } from "zod";
import { NextResponse } from "next/server";
import { sendDigestEmail } from "@inboxzero/resend";
import { withEmailAccount, withError } from "@/utils/middleware";
import { env } from "@/env";
import { hasCronSecret } from "@/utils/cron";
import { captureException } from "@/utils/error";
import prisma from "@/utils/prisma";
import { createScopedLogger } from "@/utils/logger";
import { createUnsubscribeToken } from "@/utils/unsubscribe";
import { camelCase } from "lodash";

export const maxDuration = 60;

const logger = createScopedLogger("resend/digest");

const sendDigestEmailBody = z.object({ emailAccountId: z.string() });

async function sendEmail({
  emailAccountId,
  force,
}: {
  emailAccountId: string;
  force?: boolean;
}) {
  const loggerOptions = { emailAccountId, force };

  logger.info("Sending digest email", loggerOptions);

  const emailAccount = await prisma.emailAccount.findUnique({
    where: { id: emailAccountId },
  });

  if (!emailAccount) {
    throw new Error("Email account not found");
  }

  // Get executed actions grouped by rules
  const executedRules = await prisma.executedRule.findMany({
    where: {
      emailAccountId,
      status: "APPLIED",
      actionItems: {
        some: {
          type: "DIGEST",
        },
      },
    },
    include: {
      rule: {
        select: {
          name: true,
        },
      },
      actionItems: {
        where: {
          type: "DIGEST",
        },
        select: {
          content: true,
          type: true,
        },
      },
    },
  });

  // Group actions by rule name
  const executedRulesByRule = executedRules.reduce(
    (acc, executedRule) => {
      const ruleName = camelCase(executedRule.rule?.name || "Unknown Rule");
      if (!acc[ruleName]) {
        acc[ruleName] = [];
      }
      acc[ruleName].push(...executedRule.actionItems);
      return acc;
    },
    {} as Record<string, { content: string | null; type: string }[]>,
  );

  const token = await createUnsubscribeToken({ emailAccountId });

  console.log(executedRulesByRule);

  await Promise.all([
    sendDigestEmail({
      to: emailAccount.email,
      emailProps: {
        newsletters: [{ from: "", subject: "", content: "" }],
        receipts: [{ from: "", subject: "", content: "" }],
        marketing: [{ from: "", subject: "", content: "" }],
        calendar: [{ from: "", subject: "", content: "" }],
        coldEmails: [{ from: "", subject: "", content: "" }],
        notifications: [{ from: "", subject: "", content: "" }],
        toReply: [{ from: "", subject: "", content: "" }],
        ...executedRulesByRule,
        baseUrl: env.NEXT_PUBLIC_BASE_URL,
        unsubscribeToken: token,
        date: new Date(),
      },
    }),
    prisma.emailAccount.update({
      where: { id: emailAccountId },
      data: { lastDigestEmailAt: new Date() },
    }),
  ]);

  return { success: true };
}

export const GET = withEmailAccount(async (request) => {
  // send to self
  const emailAccountId = request.auth.emailAccountId;

  logger.info("Sending digest email to user GET", { emailAccountId });

  const result = await sendEmail({ emailAccountId, force: true });

  return NextResponse.json(result);
});

export const POST = withError(async (request) => {
  if (!hasCronSecret(request)) {
    logger.error("Unauthorized cron request");
    captureException(new Error("Unauthorized cron request: resend"));
    return new Response("Unauthorized", { status: 401 });
  }

  const json = await request.json();
  const { success, data, error } = sendDigestEmailBody.safeParse(json);

  if (!success) {
    logger.error("Invalid request body", { error });
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
  const { emailAccountId } = data;

  logger.info("Sending digest email to user POST", { emailAccountId });

  try {
    await sendEmail({ emailAccountId });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(error);
    logger.error("Error sending digest email", { error });
    captureException(error);
    return NextResponse.json(
      { success: false, error: "Error sending digest email" },
      { status: 500 },
    );
  }
});

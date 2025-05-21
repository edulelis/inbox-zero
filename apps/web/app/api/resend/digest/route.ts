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
import { getMessage } from "@/utils/gmail/message";
import { parseMessage } from "@/utils/mail";
import { getGmailClientWithRefresh } from "@/utils/gmail/client";

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
    include: {
      account: {
        select: {
          access_token: true,
          refresh_token: true,
          expires_at: true,
        },
      },
      rules: {
        where: {
          actions: {
            some: {
              type: "DIGEST",
            },
          },
        },
        include: {
          actions: true,
        },
      },
    },
  });

  if (!emailAccount) {
    logger.error("Email account not found", loggerOptions);
    return { success: false };
  }

  // Get all executed rules that should be included in the digest
  const executedRules = await prisma.executedRule.findMany({
    where: {
      emailAccountId: emailAccount.id,
      rule: {
        actions: {
          some: {
            type: "DIGEST",
          },
        },
      },
      // Only include rules executed since the last digest
      createdAt: {
        gt: emailAccount.lastDigestEmailAt || new Date(0),
      },
    },
    include: {
      rule: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Get all email messages for these executed rules
  const emailMessages = await prisma.emailMessage.findMany({
    where: {
      emailAccountId: emailAccount.id,
      OR: executedRules.map((er) => ({
        threadId: er.threadId,
        messageId: er.messageId,
      })),
    },
  });

  // Get Gmail client
  const gmail = await getGmailClientWithRefresh({
    accessToken: emailAccount.account.access_token,
    refreshToken: emailAccount.account.refresh_token || "",
    expiresAt: emailAccount.account.expires_at ?? null,
    emailAccountId: emailAccount.id,
  });

  // Get full message details from Gmail API
  const messageDetails = await Promise.all(
    emailMessages.map(async (email) => {
      const message = await getMessage(email.messageId, gmail);
      const parsedMessage = parseMessage(message);
      return {
        ...email,
        subject: parsedMessage.headers.subject || "",
      };
    }),
  );

  // Group emails by category
  const emailsByCategory = messageDetails.reduce(
    (acc, email) => {
      const executedRule = executedRules.find(
        (er) =>
          er.threadId === email.threadId && er.messageId === email.messageId,
      );
      const category = executedRule?.rule?.name || "Other";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push({
        from: email.from,
        subject: email.subject,
        sentAt: email.date,
        category,
        messageId: email.messageId,
        threadId: email.threadId,
      });
      return acc;
    },
    {} as Record<
      string,
      Array<{
        from: string;
        subject: string;
        sentAt: Date;
        category: string;
        messageId: string;
        threadId: string;
      }>
    >,
  );

  const shouldSendEmail = Object.values(emailsByCategory).some(
    (emails) => emails.length > 0,
  );

  logger.info("Sending digest email to user", {
    ...loggerOptions,
    shouldSendEmail,
    categories: Object.keys(emailsByCategory),
  });

  if (!shouldSendEmail) {
    return { success: true };
  }

  const token = await createUnsubscribeToken({ emailAccountId });

  await Promise.all([
    sendDigestEmail({
      to: emailAccount.email,
      emailProps: {
        baseUrl: env.NEXT_PUBLIC_BASE_URL,
        frequency:
          emailAccount.digestEmailFrequency === "DAILY" ? "DAILY" : "WEEKLY",
        digestItems: Object.values(emailsByCategory).flat(),
        unsubscribeToken: token,
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
    logger.error("Error sending digest email", { error });
    captureException(error);
    return NextResponse.json(
      { success: false, error: "Error sending digest email" },
      { status: 500 },
    );
  }
});

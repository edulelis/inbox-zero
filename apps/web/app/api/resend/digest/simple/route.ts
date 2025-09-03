import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { handleSendDigest } from "@/app/api/resend/digest/route";
import { isValidInternalApiKey } from "@/utils/internal-api";
import { createScopedLogger } from "@/utils/logger";
import { withAuth, withError } from "@/utils/middleware";

const logger = createScopedLogger("resend/digest/simple");

export const POST = withError(
  withAuth(async (request) => {
    if (!isValidInternalApiKey(await headers(), logger)) {
      logger.error("Invalid API key for simple digest");
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    return handleSendDigest(request);
  }),
);

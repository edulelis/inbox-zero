import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { handleProcessDigest } from "@/app/api/ai/digest/route";
import { isValidInternalApiKey } from "@/utils/internal-api";
import { createScopedLogger } from "@/utils/logger";
import { withError } from "@/utils/middleware";

const logger = createScopedLogger("ai/digest/simple");

async function handleSimpleDigest(request: Request) {
  if (!isValidInternalApiKey(await headers(), logger)) {
    logger.error("Invalid API key for simple digest");
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  return handleProcessDigest(request);
}

export const POST = withError(handleSimpleDigest);

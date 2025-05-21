-- AlterEnum
ALTER TYPE "ActionType" ADD VALUE 'DIGEST';

-- AlterEnum
ALTER TYPE "Frequency" ADD VALUE 'DAILY';

-- AlterTable
ALTER TABLE "EmailAccount" ADD COLUMN     "digestEmailDayOfWeek" INTEGER,
ADD COLUMN     "digestEmailFrequency" "Frequency" NOT NULL DEFAULT 'NEVER',
ADD COLUMN     "lastDigestEmailAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Digest" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "messageId" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "emailAccountId" TEXT NOT NULL,

    CONSTRAINT "Digest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Digest_emailAccountId_idx" ON "Digest"("emailAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Digest_messageId_threadId_emailAccountId_key" ON "Digest"("messageId", "threadId", "emailAccountId");

-- CreateIndex
CREATE INDEX "EmailAccount_lastDigestEmailAt_idx" ON "EmailAccount"("lastDigestEmailAt");

-- AddForeignKey
ALTER TABLE "Digest" ADD CONSTRAINT "Digest_emailAccountId_fkey" FOREIGN KEY ("emailAccountId") REFERENCES "EmailAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

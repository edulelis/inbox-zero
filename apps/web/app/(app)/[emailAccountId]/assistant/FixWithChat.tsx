import { HammerIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SetInputFunction } from "@/components/assistant-chat/types";
import type { ParsedMessage } from "@/utils/types";
import type { RunRulesResult } from "@/utils/ai/choose-rule/run-rules";
import { truncate } from "@/utils/string";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LoadingContent } from "@/components/LoadingContent";
import { RuleMismatch } from "./ReportMistake";
import { useRules } from "@/hooks/useRules";
import { useAccount } from "@/providers/EmailAccountProvider";
import { useModal } from "@/hooks/useModal";
import { NEW_RULE_ID } from "@/app/(app)/[emailAccountId]/assistant/consts";

export function FixWithChat({
  setInput,
  message,
  result,
}: {
  setInput: NonNullable<SetInputFunction>;
  message: ParsedMessage;
  result: RunRulesResult | null;
}) {
  const { data, isLoading, error } = useRules();
  const { emailAccountId } = useAccount();
  const { isModalOpen, setIsModalOpen } = useModal();

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <HammerIcon className="mr-2 size-4" />
          Fix in chat
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Improve Rules</DialogTitle>
        </DialogHeader>

        <LoadingContent loading={isLoading} error={error}>
          {data && (
            <RuleMismatch
              emailAccountId={emailAccountId}
              result={result}
              rules={data}
              onSelectExpectedRuleId={(expectedRuleId) => {
                if (expectedRuleId === NEW_RULE_ID) {
                  setInput(
                    getFixMessage({
                      message,
                      result,
                      expectedRuleName: NEW_RULE_ID,
                    }),
                  );
                } else {
                  const expectedRule = data.find(
                    (rule) => rule.id === expectedRuleId,
                  );

                  setInput(
                    getFixMessage({
                      message,
                      result,
                      expectedRuleName: expectedRule?.name ?? null,
                    }),
                  );
                }

                setIsModalOpen(false);
              }}
            />
          )}
        </LoadingContent>
      </DialogContent>
    </Dialog>
  );
}

function getFixMessage({
  message,
  result,
  expectedRuleName,
}: {
  message: ParsedMessage;
  result: RunRulesResult | null;
  expectedRuleName: string | null;
}) {
  // Truncate content if it's too long
  // TODO: HTML text / text plain
  const getMessageContent = () => {
    const content = message.snippet || message.textPlain || "";
    return truncate(content, 500).trim();
  };

  return `You applied the wrong rule to this email.
Fix our rules so this type of email is handled correctly in the future.

Email details:
*From*: ${message.headers.from}
*Subject*: ${message.headers.subject}
*Content*: ${getMessageContent()}

Current rule applied: ${result?.rule?.name || "No rule"}

Reason the rule was chosen:
${result?.reason || "-"}

${
  expectedRuleName === NEW_RULE_ID
    ? "I'd like to create a new rule to handle this type of email."
    : expectedRuleName
      ? `The rule that should have been applied was: "${expectedRuleName}"`
      : "Instead, no rule should have been applied."
}
`.trim();
}

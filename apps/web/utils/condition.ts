import { LogicalOperator, type Rule } from "@prisma/client";
import { ConditionType, type CoreConditionType } from "@/utils/config";
import type {
  CreateRuleBody,
  ZodCondition,
} from "@/utils/actions/rule.validation";
import { createScopedLogger } from "@/utils/logger";

const logger = createScopedLogger("condition");

export type RuleConditions = Partial<
  Pick<
    Rule,
    | "groupId"
    | "instructions"
    | "from"
    | "to"
    | "subject"
    | "body"
    | "conditionalOperator"
  > & {
    group?: { name: string } | null;
  }
>;

export function isAIRule<T extends RuleConditions>(
  rule: T,
): rule is T & { instructions: string } {
  return !!rule.instructions;
}

export function isGroupRule<T extends RuleConditions>(
  rule: T,
): rule is T & { groupId: string } {
  return !!rule.groupId;
}

export function isStaticRule(rule: RuleConditions) {
  return !!rule.from || !!rule.to || !!rule.subject || !!rule.body;
}

export function getConditions(rule: RuleConditions) {
  const conditions: CreateRuleBody["conditions"] = [];

  if (isAIRule(rule)) {
    conditions.push({
      type: ConditionType.AI,
      instructions: rule.instructions,
    });
  }

  if (isStaticRule(rule)) {
    conditions.push({
      type: ConditionType.STATIC,
      from: rule.from,
      to: rule.to,
      subject: rule.subject,
      body: rule.body,
    });
  }

  return conditions;
}

export function getConditionTypes(
  rule: RuleConditions,
): Record<CoreConditionType, boolean> {
  return getConditions(rule).reduce(
    (acc, condition) => {
      acc[condition.type] = true;
      return acc;
    },
    {} as Record<CoreConditionType, boolean>,
  );
}

export function getEmptyCondition(type: CoreConditionType): ZodCondition {
  switch (type) {
    case ConditionType.AI:
      return {
        type: ConditionType.AI,
        instructions: "",
      };
    case ConditionType.STATIC:
      return {
        type: ConditionType.STATIC,
        from: null,
        to: null,
        subject: null,
        body: null,
      };
    default:
      // biome-ignore lint/correctness/noSwitchDeclarations: intentional exhaustive check
      const exhaustiveCheck: never = type;
      return exhaustiveCheck;
  }
}

type FlattenedConditions = {
  instructions?: string | null;
  from?: string | null;
  to?: string | null;
  subject?: string | null;
  body?: string | null;
};

export const flattenConditions = (
  conditions: ZodCondition[],
): FlattenedConditions => {
  return conditions.reduce((acc, condition) => {
    switch (condition.type) {
      case ConditionType.AI:
        acc.instructions = condition.instructions;
        break;
      case ConditionType.STATIC:
        acc.to = condition.to;
        acc.from = condition.from;
        acc.subject = condition.subject;
        acc.body = condition.body;
        break;
      default:
        logger.warn("Unknown condition type", { condition });
        // biome-ignore lint/correctness/noSwitchDeclarations: intentional exhaustive check
        const exhaustiveCheck: never = condition.type;
        return exhaustiveCheck;
    }
    return acc;
  }, {} as FlattenedConditions);
};

//========================================
// toString utils
//========================================

export function conditionTypesToString(rule: RuleConditions) {
  return getConditions(rule)
    .map((condition) => conditionTypeToString(condition.type))
    .join(", ");
}

function conditionTypeToString(conditionType: ConditionType): string {
  switch (conditionType) {
    case ConditionType.AI:
      return "AI";
    case ConditionType.STATIC:
      return "Static";
    case ConditionType.LEARNED_PATTERN:
      return "Group";
    case ConditionType.PRESET:
      return "Preset";
    default:
      // biome-ignore lint/correctness/noSwitchDeclarations: intentional exhaustive check
      const exhaustiveCheck: never = conditionType;
      return exhaustiveCheck;
  }
}

export function conditionsToString(rule: RuleConditions) {
  const conditions: string[] = [];
  const connector =
    rule.conditionalOperator === LogicalOperator.AND ? " AND " : " OR ";

  // Static conditions - grouped with commas
  const staticConditions: string[] = [];
  if (rule.from) staticConditions.push(`From: ${rule.from}`);
  if (rule.subject) staticConditions.push(`Subject: "${rule.subject}"`);
  if (rule.to) staticConditions.push(`To: ${rule.to}`);
  if (rule.body) staticConditions.push(`Body: "${rule.body}"`);
  if (staticConditions.length) conditions.push(staticConditions.join(", "));

  // AI condition
  if (rule.instructions) conditions.push(rule.instructions);

  return conditions.join(connector);
}

import { describe, expect, test, vi } from "vitest";
import { aiChooseRule } from "@/utils/ai/choose-rule/ai-choose-rule";
import { ActionType } from "@prisma/client";
import { getEmail, getEmailAccount, getRule } from "@/__tests__/helpers";

// pnpm test-ai ai-choose-rule

const isAiTest = process.env.RUN_AI_TESTS === "true";

vi.mock("server-only", () => ({}));

describe.runIf(isAiTest)("aiChooseRule", () => {
  test("Should return no rule when no rules passed", async () => {
    const result = await aiChooseRule({
      rules: [],
      email: getEmail(),
      emailAccount: getEmailAccount(),
    });

    expect(result).toEqual({ rules: [], reason: "" });
  });

  test("Should return correct rule when only one rule passed", async () => {
    const rule = getRule(
      "Match emails that have the word 'test' in the subject line",
    );

    const result = await aiChooseRule({
      email: getEmail({ subject: "test" }),
      rules: [rule],
      emailAccount: getEmailAccount(),
    });

    expect(result.rules).toHaveLength(1);
    expect(result.rules[0].rule).toEqual(rule);
    expect(result.rules[0].isPrimary).toBe(true);
    expect(result.reason).toBeTruthy();
  });

  test("Should return correct rule when multiple rules passed", async () => {
    const rule1 = getRule(
      "Match emails that have the word 'test' in the subject line",
      [],
      "Test emails",
    );
    const rule2 = getRule(
      "Match emails that have the word 'remember' in the subject line",
      [],
      "Remember emails",
    );

    const result = await aiChooseRule({
      rules: [rule1, rule2],
      email: getEmail({ subject: "remember that call" }),
      emailAccount: getEmailAccount(),
    });

    expect(result.rules).toHaveLength(1);
    expect(result.rules[0].rule).toEqual(rule2);
    expect(result.reason).toBeTruthy();
  });

  test("Should select the correct rule and provide a reason", async () => {
    const rule1 = getRule(
      "Match emails that have the word 'question' in the subject line",
      [],
      "Question emails",
    );
    const rule2 = getRule(
      "Match emails asking for a joke",
      [
        {
          id: "id",
          createdAt: new Date(),
          updatedAt: new Date(),
          type: ActionType.REPLY,
          ruleId: "ruleId",
          label: null,
          labelId: null,
          subject: null,
          content: "{{Write a joke}}",
          to: null,
          cc: null,
          bcc: null,
          url: null,
          folderName: null,
          delayInMinutes: null,
          folderId: null,
        },
      ],
      "Joke requests",
    );

    const result = await aiChooseRule({
      rules: [rule1, rule2],
      email: getEmail({
        subject: "Joke",
        content: "Tell me a joke about sheep",
      }),
      emailAccount: getEmailAccount(),
    });

    expect(result.rules).toHaveLength(1);
    expect(result.rules[0].rule).toEqual(rule2);
    expect(result.reason).toBeTruthy();
  });

  describe("Complex real-world rule scenarios", () => {
    const recruiters = getRule(
      "Match emails from recruiters or about job opportunities",
      [],
      "Recruiters",
    );
    const legal = getRule(
      "Match emails containing legal documents or contracts",
      [],
      "Legal",
    );
    const requiresResponse = getRule(
      "Match emails requiring a response",
      [],
      "Requires Response",
    );
    const productUpdates = getRule(
      "Match emails about product updates or feature announcements",
      [],
      "Product Updates",
    );
    const financial = getRule(
      "Match emails containing financial information or invoices",
      [],
      "Financial",
    );
    const technicalIssues = getRule(
      "Match emails about technical issues like server downtime or bug reports",
      [],
      "Technical Issues",
    );
    const marketing = getRule(
      "Match emails containing marketing or promotional content",
      [],
      "Marketing",
    );
    const teamUpdates = getRule(
      "Match emails about team updates or internal communications",
      [],
      "Team Updates",
    );
    const customerFeedback = getRule(
      "Match emails about customer feedback or support requests",
      [],
      "Customer Feedback",
    );
    const events = getRule(
      "Match emails containing event invitations or RSVPs",
      [],
      "Events",
    );
    const projectDeadlines = getRule(
      "Match emails about project deadlines or milestones",
      [],
      "Project Deadlines",
    );
    const urgent = getRule(
      "Match urgent emails requiring immediate attention",
      [],
      "Urgent",
    );
    const catchAll = getRule(
      "Match emails that don't fit any other category",
      [],
      "Catch All",
    );

    const rules = [
      recruiters,
      legal,
      requiresResponse,
      productUpdates,
      financial,
      technicalIssues,
      marketing,
      teamUpdates,
      customerFeedback,
      events,
      projectDeadlines,
      urgent,
      catchAll,
    ];

    test("Should match simple response required", async () => {
      const result = await aiChooseRule({
        rules,
        email: getEmail({
          from: "alicesmith@gmail.com",
          subject: "Can we meet for lunch tomorrow?",
          content: "LMK\n\n--\nAlice Smith,\nCEO, The Boring Fund",
        }),
        emailAccount: getEmailAccount(),
      });

      expect(result.rules).toHaveLength(1);
      expect(result.rules[0].rule).toEqual(requiresResponse);
      expect(result.reason).toBeTruthy();
    });

    test("Should match technical issues", async () => {
      const result = await aiChooseRule({
        rules,
        email: getEmail({
          subject: "Server downtime reported",
          content:
            "We're experiencing critical server issues affecting production.",
        }),
        emailAccount: getEmailAccount(),
      });

      // Log if multiple rules were matched
      if (result.rules.length > 1) {
        console.log("⚠️  Technical Issues test matched multiple rules:");
        console.log(
          result.rules.map((r) => ({
            name: r.rule.name,
            isPrimary: r.isPrimary,
          })),
        );
        console.log("Reasoning:", result.reason);
      }

      // AI may match multiple rules (e.g., Technical Issues + Urgent)
      // Verify the primary match is Technical Issues
      const primaryRule = result.rules.find((r) => r.isPrimary);
      expect(primaryRule).toBeDefined();
      expect(primaryRule?.rule).toEqual(technicalIssues);
      expect(result.reason).toBeTruthy();
    });

    test("Should match financial emails", async () => {
      const result = await aiChooseRule({
        rules,
        email: getEmail({
          subject: "Your invoice for March 2024",
          content: "Please find attached your invoice for services rendered.",
        }),
        emailAccount: getEmailAccount(),
      });

      expect(result.rules).toHaveLength(1);
      expect(result.rules[0].rule).toEqual(financial);
      expect(result.reason).toBeTruthy();
    });

    test("Should match recruiter emails", async () => {
      const result = await aiChooseRule({
        rules,
        email: getEmail({
          subject: "New job opportunity at Tech Corp",
          content:
            "I came across your profile and think you'd be perfect for...",
        }),
        emailAccount: getEmailAccount(),
      });

      expect(result.rules).toHaveLength(1);
      expect(result.rules[0].rule).toEqual(recruiters);
      expect(result.reason).toBeTruthy();
    });

    test("Should match legal documents", async () => {
      const result = await aiChooseRule({
        rules,
        email: getEmail({
          subject: "Please review: Contract for new project",
          content: "Attached is the contract for your review and signature.",
        }),
        emailAccount: getEmailAccount(),
      });

      // Log if multiple rules were matched
      if (result.rules.length > 1) {
        console.log("⚠️  Legal Documents test matched multiple rules:");
        console.log(
          result.rules.map((r) => ({
            name: r.rule.name,
            isPrimary: r.isPrimary,
          })),
        );
        console.log("Reasoning:", result.reason);
      }

      // AI may match multiple rules (e.g., Legal + Requires Response)
      // Verify the primary match is Legal
      const primaryRule = result.rules.find((r) => r.isPrimary);
      expect(primaryRule).toBeDefined();
      expect(primaryRule?.rule).toEqual(legal);
      expect(result.reason).toBeTruthy();
    });

    test("Should match emails requiring response", async () => {
      const result = await aiChooseRule({
        rules,
        email: getEmail({
          subject: "Team lunch tomorrow?",
          content: "Would you like to join us for team lunch tomorrow at 12pm?",
        }),
        emailAccount: getEmailAccount(),
      });

      // Log if multiple rules were matched
      if (result.rules.length > 1) {
        console.log(
          "⚠️  Emails Requiring Response test matched multiple rules:",
        );
        console.log(
          result.rules.map((r) => ({
            name: r.rule.name,
            isPrimary: r.isPrimary,
          })),
        );
        console.log("Reasoning:", result.reason);
      }

      // AI may match multiple rules (e.g., Requires Response + Team Updates)
      // Verify the primary match is Requires Response
      const primaryRule = result.rules.find((r) => r.isPrimary);
      expect(primaryRule).toBeDefined();
      expect(primaryRule?.rule).toEqual(requiresResponse);
      expect(result.reason).toBeTruthy();
    });

    test("Should match product updates", async () => {
      const result = await aiChooseRule({
        rules,
        email: getEmail({
          subject: "New Feature Release: AI Integration",
          content: "We're excited to announce our new AI features...",
        }),
        emailAccount: getEmailAccount(),
      });

      expect(result.rules).toHaveLength(1);
      expect(result.rules[0].rule).toEqual(productUpdates);
      expect(result.reason).toBeTruthy();
    });

    test("Should match marketing emails", async () => {
      const result = await aiChooseRule({
        rules,
        email: getEmail({
          subject: "50% off Spring Sale!",
          content: "Don't miss out on our biggest sale of the season!",
        }),
        emailAccount: getEmailAccount(),
      });

      expect(result.rules).toHaveLength(1);
      expect(result.rules[0].rule).toEqual(marketing);
      expect(result.reason).toBeTruthy();
    });

    test("Should match team updates", async () => {
      const result = await aiChooseRule({
        rules,
        email: getEmail({
          subject: "Weekly Team Update",
          content: "Here's what the team accomplished this week...",
        }),
        emailAccount: getEmailAccount(),
      });

      expect(result.rules).toHaveLength(1);
      expect(result.rules[0].rule).toEqual(teamUpdates);
      expect(result.reason).toBeTruthy();
    });

    test("Should match customer feedback", async () => {
      const result = await aiChooseRule({
        rules,
        email: getEmail({
          subject: "Customer Feedback: App Performance",
          content: "I've been experiencing slow loading times...",
        }),
        emailAccount: getEmailAccount(),
      });

      // Log if multiple rules were matched
      if (result.rules.length > 1) {
        console.log("⚠️  Customer Feedback test matched multiple rules:");
        console.log(
          result.rules.map((r) => ({
            name: r.rule.name,
            isPrimary: r.isPrimary,
          })),
        );
        console.log("Reasoning:", result.reason);
      }

      // AI may match multiple rules (e.g., Customer Feedback + Technical Issues + Requires Response)
      // Verify the primary match is Customer Feedback
      const primaryRule = result.rules.find((r) => r.isPrimary);
      expect(primaryRule).toBeDefined();
      expect(primaryRule?.rule).toEqual(customerFeedback);
      expect(result.reason).toBeTruthy();
    });

    test("Should match event invitations", async () => {
      const result = await aiChooseRule({
        rules,
        email: getEmail({
          subject: "Invitation: Annual Tech Conference",
          content: "You're invited to speak at our annual conference...",
        }),
        emailAccount: getEmailAccount(),
      });

      // Log if multiple rules were matched
      if (result.rules.length > 1) {
        console.log("⚠️  Event Invitations test matched multiple rules:");
        console.log(
          result.rules.map((r) => ({
            name: r.rule.name,
            isPrimary: r.isPrimary,
          })),
        );
        console.log("Reasoning:", result.reason);
      }

      // AI may match multiple rules (e.g., Events + Requires Response)
      // Verify the primary match is Events
      const primaryRule = result.rules.find((r) => r.isPrimary);
      expect(primaryRule).toBeDefined();
      expect(primaryRule?.rule).toEqual(events);
      expect(result.reason).toBeTruthy();
    });

    test("Should return no match when email doesn't fit any rule", async () => {
      // Use a subset of rules WITHOUT the catch-all rule to test true no-match scenario
      const rulesWithoutCatchAll = [
        recruiters,
        legal,
        productUpdates,
        financial,
        technicalIssues,
        marketing,
        teamUpdates,
        customerFeedback,
        events,
        projectDeadlines,
      ];

      const result = await aiChooseRule({
        rules: rulesWithoutCatchAll,
        email: getEmail({
          subject: "Weather Update: Sunny skies ahead",
          content:
            "Today's forecast: Clear skies with temperatures reaching 75°F. Perfect day for outdoor activities!\n\nUV Index: Moderate\nWind: 5-10 mph",
        }),
        emailAccount: getEmailAccount(),
      });

      // This is a weather notification that doesn't match any of our business rules
      // Should return empty array with no reason
      expect(result.rules).toEqual([]);
      expect(result.reason).toBe("");
    });
  });
});

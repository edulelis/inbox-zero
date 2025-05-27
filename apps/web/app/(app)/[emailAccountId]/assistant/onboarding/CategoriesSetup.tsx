"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ControllerRenderProps } from "react-hook-form";
import {
  Mail,
  Newspaper,
  Megaphone,
  Calendar,
  Receipt,
  Bell,
  Users,
} from "lucide-react";
import { TypographyH3, TypographyP } from "@/components/Typography";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CategoryAction,
  createRulesOnboardingAction,
} from "@/utils/actions/rule";
import {
  createRulesOnboardingBody,
  type CreateRulesOnboardingBody,
} from "@/utils/actions/rule.validation";
import { TooltipExplanation } from "@/components/TooltipExplanation";
import {
  ASSISTANT_ONBOARDING_COOKIE,
  markOnboardingAsCompleted,
} from "@/utils/cookies";
import { prefixPath } from "@/utils/path";
import { Checkbox } from "@/components/Checkbox";

const NEXT_URL = "/assistant/onboarding/draft-replies";

function DigestCheckbox({
  value,
  onChange,
}: {
  value: CategoryAction;
  onChange: (value: CategoryAction) => void;
}) {
  const isDigest = value === "label_digest" || value === "label_archive_digest";
  const baseValue =
    value === "label_digest"
      ? "label"
      : value === "label_archive_digest"
        ? "label_archive"
        : value;

  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        checked={isDigest}
        onChange={(e) => {
          if (e.target.checked) {
            onChange(
              baseValue === "label"
                ? "label_digest"
                : baseValue === "label_archive"
                  ? "label_archive_digest"
                  : baseValue,
            );
          } else {
            onChange(baseValue);
          }
        }}
      />
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        Digest
      </label>
    </div>
  );
}

function CategorySelect({
  value,
  onChange,
}: {
  value: CategoryAction;
  onChange: (value: CategoryAction) => void;
}) {
  const isDigest = value === "label_digest" || value === "label_archive_digest";
  const baseValue =
    value === "label_digest"
      ? "label"
      : value === "label_archive_digest"
        ? "label_archive"
        : value;

  return (
    <Select
      value={baseValue}
      onValueChange={(newValue: string) => {
        if (isDigest) {
          onChange(
            newValue === "label"
              ? "label_digest"
              : newValue === "label_archive"
                ? "label_archive_digest"
                : (newValue as CategoryAction),
          );
        } else {
          onChange(newValue as CategoryAction);
        }
      }}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="label">Label</SelectItem>
        <SelectItem value="label_archive">Label + Skip Inbox</SelectItem>
        <SelectItem value="none">None</SelectItem>
      </SelectContent>
    </Select>
  );
}

function CategoryCard({
  id,
  label,
  icon,
  form,
  tooltipText,
}: {
  id: keyof CreateRulesOnboardingBody;
  label: string;
  icon: React.ReactNode;
  form: ReturnType<typeof useForm<CreateRulesOnboardingBody>>;
  tooltipText?: string;
}) {
  const value = form.watch(id) as CategoryAction;

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        {icon}
        <div className="flex flex-1 items-center gap-2">
          {label}
          {tooltipText && (
            <TooltipExplanation
              text={tooltipText}
              className="text-muted-foreground"
            />
          )}
        </div>
        <div className="ml-auto flex items-center gap-4">
          <DigestCheckbox
            value={value}
            onChange={(newValue) => {
              if (newValue === "digest") {
                form.setValue(id, "label_digest");
              } else {
                form.setValue(id, newValue);
              }
            }}
          />
          <FormField
            control={form.control}
            name={id}
            render={({ field }) => (
              <FormItem>
                <CategorySelect
                  value={field.value as CategoryAction}
                  onChange={field.onChange}
                />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function CategoriesSetup({
  emailAccountId,
  defaultValues,
}: {
  emailAccountId: string;
  defaultValues?: Partial<CreateRulesOnboardingBody>;
}) {
  const router = useRouter();

  const form = useForm<CreateRulesOnboardingBody>({
    resolver: zodResolver(createRulesOnboardingBody),
    defaultValues: {
      toReply: defaultValues?.toReply || "label",
      newsletter: defaultValues?.newsletter || "label",
      marketing: defaultValues?.marketing || "label_archive",
      calendar: defaultValues?.calendar || "label",
      receipt: defaultValues?.receipt || "label",
      notification: defaultValues?.notification || "label",
      coldEmail: defaultValues?.coldEmail || "label_archive",
    },
  });

  const onSubmit = useCallback(
    async (data: CreateRulesOnboardingBody) => {
      // runs in background so we can move on to next step faster
      createRulesOnboardingAction(emailAccountId, data);
      router.push(prefixPath(emailAccountId, NEXT_URL));
    },
    [emailAccountId, router],
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <TypographyH3 className="mt-2">
          How do you want your emails organized?
        </TypographyH3>

        <TypographyP className="mt-2">
          We'll automatically categorize your emails to help you focus on what
          matters.
          <br />
          You can add custom categories and rules later.
        </TypographyP>

        <div className="mt-4 grid grid-cols-1 gap-4">
          <CategoryCard
            id="toReply"
            label="To Reply"
            tooltipText="Emails you need to reply to and those where you're awaiting a reply. The label will update automatically as the conversation progresses"
            icon={<Mail className="h-5 w-5 text-blue-500" />}
            form={form}
          />
          <CategoryCard
            id="newsletter"
            label="Newsletter"
            tooltipText="Newsletters, blogs, and publications"
            icon={<Newspaper className="h-5 w-5 text-purple-500" />}
            form={form}
          />
          <CategoryCard
            id="marketing"
            label="Marketing"
            tooltipText="Promotional emails about sales and offers"
            icon={<Megaphone className="h-5 w-5 text-green-500" />}
            form={form}
          />
          <CategoryCard
            id="calendar"
            label="Calendar"
            tooltipText="Events, appointments, and reminders"
            icon={<Calendar className="h-5 w-5 text-yellow-500" />}
            form={form}
          />
          <CategoryCard
            id="receipt"
            label="Receipt"
            tooltipText="Invoices, receipts, and payments"
            icon={<Receipt className="h-5 w-5 text-orange-500" />}
            form={form}
          />
          <CategoryCard
            id="notification"
            label="Notification"
            tooltipText="Alerts, status updates, and system messages"
            icon={<Bell className="h-5 w-5 text-red-500" />}
            form={form}
          />
          <CategoryCard
            id="coldEmail"
            label="Cold Email"
            tooltipText="Unsolicited sales pitches and cold emails. We'll never block someone that's emailed you before"
            icon={<Users className="h-5 w-5 text-indigo-500" />}
            form={form}
          />
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <Button type="submit" className="w-full" size="lg">
            Next
          </Button>

          <Button
            className="w-full"
            size="lg"
            variant="outline"
            onClick={() => {
              markOnboardingAsCompleted(ASSISTANT_ONBOARDING_COOKIE);
              router.push(prefixPath(emailAccountId, "/assistant"));
            }}
          >
            Skip
          </Button>
        </div>
      </form>
    </Form>
  );
}

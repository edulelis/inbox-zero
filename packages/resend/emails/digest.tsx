import {
  Button,
  Text,
  Html,
  Head,
  Preview,
  Tailwind,
  Body,
  Container,
  Link,
  Section,
  Img,
  Heading,
  Row,
  Column,
} from "@react-email/components";

type DigestItem = {
  from: string;
  subject: string;
  sentAt: Date;
  category: string;
  summary?: string;
  messageId: string;
  threadId: string;
};

export interface DigestEmailProps {
  baseUrl: string;
  digestItems: DigestItem[];
  unsubscribeToken: string;
  frequency: "DAILY" | "WEEKLY";
}

export default function DigestEmail(props: DigestEmailProps) {
  const {
    baseUrl = "https://www.getinboxzero.com",
    digestItems,
    unsubscribeToken,
    frequency,
  } = props;

  // Group items by category
  const itemsByCategory = digestItems.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, DigestItem[]>,
  );

  return (
    <Html>
      <Head />
      <Preview>
        Your {frequency.toLowerCase()} digest of important emails
      </Preview>
      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto w-full max-w-[600px] p-0">
            <Section className="p-8 text-center">
              <Link href={baseUrl} className="text-[15px]">
                <Img
                  src={"https://www.getinboxzero.com/icon.png"}
                  width="40"
                  height="40"
                  alt="Inbox Zero"
                  className="mx-auto my-0"
                />
              </Link>

              <Text className="mx-0 mb-8 mt-4 p-0 text-center text-2xl font-normal">
                <span className="font-semibold tracking-tighter">
                  Inbox Zero
                </span>
              </Text>

              <Heading className="my-4 text-4xl font-medium leading-tight">
                Your {frequency === "DAILY" ? "Daily" : "Weekly"} Digest
              </Heading>
              <Text className="mb-8 text-lg leading-8">
                Here's a summary of important emails that were auto-archived.
              </Text>
            </Section>

            {Object.entries(itemsByCategory).map(([category, items]) => (
              <CategorySection
                key={category}
                category={category}
                items={items}
                baseUrl={baseUrl}
              />
            ))}

            <Footer baseUrl={baseUrl} unsubscribeToken={unsubscribeToken} />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

DigestEmail.PreviewProps = {
  baseUrl: "https://www.getinboxzero.com",
  frequency: "DAILY",
  digestItems: [
    {
      from: "Newsletter <news@example.com>",
      subject: "Weekly Tech Updates",
      sentAt: new Date("2024-03-15"),
      category: "Newsletters",
      summary: "Latest updates in AI and machine learning",
      messageId: "123",
      threadId: "456",
    },
    {
      from: "Receipt <receipts@store.com>",
      subject: "Your Order #12345",
      sentAt: new Date("2024-03-15"),
      category: "Receipts",
      summary: "Order confirmation for $99.99",
      messageId: "789",
      threadId: "012",
    },
    {
      from: "Marketing <marketing@company.com>",
      subject: "Special Offer Inside!",
      sentAt: new Date("2024-03-15"),
      category: "Marketing",
      summary: "50% off on all products",
      messageId: "345",
      threadId: "678",
    },
  ],
  unsubscribeToken: "123",
} satisfies DigestEmailProps;

function CategorySection({
  category,
  items,
  baseUrl,
}: {
  category: string;
  items: DigestItem[];
  baseUrl: string;
}) {
  return (
    <Section className="rounded-2xl bg-[#ffb366]/10 bg-[radial-gradient(circle_at_bottom_right,#ffb366_0%,transparent_60%)] p-8 text-center mb-8">
      <Heading className="m-0 text-3xl font-medium text-[#a63b00]">
        {category}
      </Heading>

      <EmailList items={items} baseUrl={baseUrl} />
    </Section>
  );
}

function EmailList({
  items,
  baseUrl,
}: {
  items: DigestItem[];
  baseUrl: string;
}) {
  if (items.length === 0) return null;

  return (
    <div className="mt-8">
      {items.map((item) => (
        <EmailCard key={item.messageId} item={item} baseUrl={baseUrl} />
      ))}
    </div>
  );
}

function EmailCard({ item, baseUrl }: { item: DigestItem; baseUrl: string }) {
  return (
    <Section className="my-3 rounded-lg bg-white/50 p-4 text-left shadow-sm border border-[#ffb366]/20">
      <Row>
        <Column>
          <Text className="m-0 font-semibold">{item.from}</Text>
          <Text className="m-0 text-gray-600">{item.subject}</Text>
          {item.summary && (
            <Text className="m-0 mt-2 text-sm text-gray-500">
              {item.summary}
            </Text>
          )}
        </Column>
        <Column align="right">
          <Text className="m-0 text-sm text-gray-500">
            {item.sentAt.toLocaleDateString()}
          </Text>
          <Button
            href={`${baseUrl}/email/${item.messageId}`}
            style={{
              background: "#000",
              color: "#fff",
              padding: "8px 16px",
              borderRadius: "5px",
              marginTop: "8px",
            }}
          >
            View Email
          </Button>
        </Column>
      </Row>
    </Section>
  );
}

function Footer({
  baseUrl,
  unsubscribeToken,
}: {
  baseUrl: string;
  unsubscribeToken: string;
}) {
  return (
    <Section className="mt-8 text-center text-sm text-gray-500">
      <Text className="m-0">
        You're receiving this email because you enabled digest emails in your
        Inbox Zero settings.
      </Text>
      <Text className="m-0">
        <Link
          href={`${baseUrl}/api/unsubscribe?token=${unsubscribeToken}`}
          className="text-gray-500 underline"
        >
          Unsubscribe
        </Link>
      </Text>
    </Section>
  );
}

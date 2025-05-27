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
  Hr,
} from "@react-email/components";

export interface DigestEmailProps {
  baseUrl: string;
  unsubscribeToken: string;
  newsletters: [
    {
      sender: string;
      subject: string;
      preview: string;
    },
  ];
  receipts: [
    {
      merchant: string;
      description: string;
      amount: string;
      time: string;
    },
  ];
  marketing: [
    {
      sender: string;
      subject: string;
      preview: string;
    },
  ];
  calendar: [
    {
      title: string;
      time: string;
      location: string;
      organizer: string;
    },
  ];
  coldEmails: [
    {
      sender: string;
      subject: string;
      company: string;
    },
  ];
  notifications: [
    {
      app: string;
      message: string;
      time: string;
    },
  ];
  toReply: [
    {
      sender: string;
      subject: string;
      received: string;
      dueBy: string;
    },
  ];
}

export default function DigestEmail(props: DigestEmailProps) {
  const {
    baseUrl = "https://www.getinboxzero.com",
    newsletters,
    receipts,
    marketing,
    calendar,
    coldEmails,
    notifications,
    toReply,
    unsubscribeToken,
  } = props;
  const formattedDate = new Date(props.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto w-full max-w-[600px] p-0">
            <Section className="p-4 text-center">
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
                Your Digest
              </Heading>
              <Text className="mb-8 text-lg leading-8">
                Here's a summary of important emails that were auto-archived.
              </Text>
            </Section>

            {/* {Object.entries(itemsByCategory).map(([category, items]) => (
              <CategorySection
                key={category}
                category={category}
                items={items}
                baseUrl={baseUrl}
              />
            ))} */}

            {/* Category Countdown - Colored Background Rows with Hyperlinks */}
            <Section className="mb-[32px]">
              <Heading className="text-[18px] font-bold text-gray-800 mt-[0px] mb-[16px]">
                Email Categories
              </Heading>
              <div className="bg-blue-50 p-[12px] rounded-[4px] mb-[8px] flex justify-between items-center">
                <Text className="text-[14px] font-medium text-blue-800 m-0">
                  📰 Newsletters
                </Text>
                <div className="bg-blue-100 px-[12px] py-[4px] rounded-[16px]">
                  <Text className="text-[14px] font-bold text-blue-800 m-0">
                    {newsletters.length}
                  </Text>
                </div>
              </div>

              <div className="bg-green-50 p-[12px] rounded-[4px] mb-[8px] flex justify-between items-center">
                <Text className="text-[14px] font-medium text-green-800 m-0">
                  🧾 Receipts
                </Text>
                <div className="bg-green-100 px-[12px] py-[4px] rounded-[16px]">
                  <Text className="text-[14px] font-bold text-green-800 m-0">
                    {receipts.length}
                  </Text>
                </div>
              </div>

              <div className="bg-purple-50 p-[12px] rounded-[4px] mb-[8px] flex justify-between items-center">
                <Text className="text-[14px] font-medium text-purple-800 m-0">
                  🔊 Marketing
                </Text>
                <div className="bg-purple-100 px-[12px] py-[4px] rounded-[16px]">
                  <Text className="text-[14px] font-bold text-purple-800 m-0">
                    {marketing.length}
                  </Text>
                </div>
              </div>

              <div className="bg-amber-50 p-[12px] rounded-[4px] mb-[8px] flex justify-between items-center">
                <Text className="text-[14px] font-medium text-amber-800 m-0">
                  📅 Calendar
                </Text>
                <div className="bg-amber-100 px-[12px] py-[4px] rounded-[16px]">
                  <Text className="text-[14px] font-bold text-amber-800 m-0">
                    {calendar.length}
                  </Text>
                </div>
              </div>

              <div className="bg-gray-50 p-[12px] rounded-[4px] mb-[8px] flex justify-between items-center">
                <Text className="text-[14px] font-medium text-gray-800 m-0">
                  🧊 Cold E-mails
                </Text>
                <div className="bg-gray-200 px-[12px] py-[4px] rounded-[16px]">
                  <Text className="text-[14px] font-bold text-gray-800 m-0">
                    {coldEmails.length}
                  </Text>
                </div>
              </div>

              <div className="bg-pink-50 p-[12px] rounded-[4px] mb-[8px] flex justify-between items-center">
                <Text className="text-[14px] font-medium text-pink-800 m-0">
                  🔔 Notifications
                </Text>
                <div className="bg-pink-100 px-[12px] py-[4px] rounded-[16px]">
                  <Text className="text-[14px] font-bold text-pink-800 m-0">
                    {notifications.length}
                  </Text>
                </div>
              </div>

              <div className="bg-red-50 p-[12px] rounded-[4px] mb-[0px] flex justify-between items-center">
                <Text className="text-[14px] font-medium text-red-800 m-0">
                  ⏰ To Reply
                </Text>
                <div className="bg-red-100 px-[12px] py-[4px] rounded-[16px]">
                  <Text className="text-[14px] font-bold text-red-800 m-0">
                    {toReply.length}
                  </Text>
                </div>
              </div>
            </Section>

            {/* Newsletters Section */}
            <Section className="mb-[24px]" id="newsletters">
              <div className="bg-blue-50 rounded-[8px] p-[16px]">
                <Heading className="text-[18px] font-bold text-blue-800 mt-[0px] mb-[16px]">
                  📰 Newsletters ({newsletters.length})
                </Heading>

                {newsletters.map((email, index) => (
                  <div
                    key={index}
                    className="mb-[12px] bg-white rounded-[8px] p-[12px] border-solid border-[1px] border-blue-200"
                  >
                    <Text className="text-[16px] font-bold text-gray-800 m-0">
                      {email.sender}
                    </Text>
                    <Text className="text-[14px] text-gray-700 mt-[4px] mb-[4px]">
                      {email.subject}
                    </Text>
                    <Text className="text-[13px] text-gray-500 m-0">
                      {email.preview}
                    </Text>
                  </div>
                ))}
              </div>
            </Section>

            {/* Receipts Section */}
            <Section className="mb-[24px]" id="receipts">
              <div className="bg-green-50 rounded-[8px] p-[16px]">
                <Heading className="text-[18px] font-bold text-green-800 mt-[0px] mb-[16px]">
                  🧾 Receipts ({receipts.length})
                </Heading>

                {receipts.map((receipt, index) => (
                  <div
                    key={index}
                    className="mb-[12px] bg-white rounded-[8px] p-[12px] border-solid border-[1px] border-green-200"
                  >
                    <Row>
                      <Column className="w-[70%]">
                        <Text className="text-[16px] font-bold text-gray-800 m-0">
                          {receipt.merchant}
                        </Text>
                        <Text className="text-[14px] text-gray-600 m-0">
                          {receipt.description}
                        </Text>
                      </Column>
                      <Column className="w-[30%] text-right">
                        <Text className="text-[14px] font-bold text-gray-800 m-0">
                          {receipt.amount}
                        </Text>
                        <Text className="text-[13px] text-gray-500 m-0">
                          {receipt.time}
                        </Text>
                      </Column>
                    </Row>
                  </div>
                ))}
              </div>
            </Section>

            {/* Marketing Section */}
            <Section className="mb-[24px]" id="marketing">
              <div className="bg-purple-50 rounded-[8px] p-[16px]">
                <Heading className="text-[18px] font-bold text-purple-800 mt-[0px] mb-[16px]">
                  🔊 Marketing ({marketing.length})
                </Heading>

                {marketing.map((email, index) => (
                  <div
                    key={index}
                    className="mb-[12px] bg-white rounded-[8px] p-[12px] border-solid border-[1px] border-purple-200"
                  >
                    <Text className="text-[16px] font-bold text-gray-800 m-0">
                      {email.sender}
                    </Text>
                    <Text className="text-[14px] text-gray-700 mt-[4px] mb-[4px]">
                      {email.subject}
                    </Text>
                    <Text className="text-[13px] text-gray-500 m-0">
                      {email.preview}
                    </Text>
                  </div>
                ))}
              </div>
            </Section>

            {/* Calendar Section */}
            <Section className="mb-[24px]" id="calendar">
              <div className="bg-amber-50 rounded-[8px] p-[16px]">
                <Heading className="text-[18px] font-bold text-amber-800 mt-[0px] mb-[16px]">
                  📅 Calendar ({calendar.length})
                </Heading>

                {calendar.map((event, index) => (
                  <div
                    key={index}
                    className="mb-[12px] bg-white rounded-[8px] p-[12px] border-solid border-[1px] border-amber-200"
                  >
                    <Text className="text-[16px] font-bold text-gray-800 m-0">
                      {event.title}
                    </Text>
                    <Text className="text-[14px] text-gray-700 mt-[4px] mb-[0px]">
                      {event.time} • {event.location}
                    </Text>
                    <Text className="text-[13px] text-gray-500 mt-[4px] m-0">
                      {event.organizer}
                    </Text>
                  </div>
                ))}
              </div>
            </Section>

            {/* Cold Emails Section */}
            <Section className="mb-[24px]" id="cold-emails">
              <div className="bg-gray-50 rounded-[8px] p-[16px]">
                <Heading className="text-[18px] font-bold text-gray-800 mt-[0px] mb-[16px]">
                  🧊 Cold E-mails ({coldEmails.length})
                </Heading>

                {coldEmails.map((email, index) => (
                  <div
                    key={index}
                    className="mb-[12px] bg-white rounded-[8px] p-[12px] border-solid border-[1px] border-gray-200"
                  >
                    <Text className="text-[16px] font-bold text-gray-800 m-0">
                      {email.sender}
                    </Text>
                    <Text className="text-[14px] text-gray-700 mt-[4px] mb-[4px]">
                      {email.subject}
                    </Text>
                    <Text className="text-[13px] text-gray-500 m-0">
                      {email.company}
                    </Text>
                  </div>
                ))}
              </div>
            </Section>

            {/* Notifications Section */}
            <Section className="mb-[24px]" id="notifications">
              <div className="bg-pink-50 rounded-[8px] p-[16px]">
                <Heading className="text-[18px] font-bold text-pink-800 mt-[0px] mb-[16px]">
                  🔔 Notifications ({notifications.length})
                </Heading>

                {notifications.map((notification, index) => (
                  <div
                    key={index}
                    className="mb-[12px] bg-white rounded-[8px] p-[12px] border-solid border-[1px] border-pink-200"
                  >
                    <Text className="text-[16px] font-bold text-gray-800 m-0">
                      {notification.app}
                    </Text>
                    <Text className="text-[14px] text-gray-700 mt-[4px] mb-[0px]">
                      {notification.message}
                    </Text>
                    <Text className="text-[13px] text-gray-500 mt-[4px] m-0">
                      {notification.time}
                    </Text>
                  </div>
                ))}
              </div>
            </Section>

            {/* To Reply Section */}
            <Section className="mb-[24px]" id="to-reply">
              <div className="bg-red-50 rounded-[8px] p-[16px]">
                <Heading className="text-[18px] font-bold text-red-800 mt-[0px] mb-[16px]">
                  ⏰ To Reply ({toReply.length})
                </Heading>

                {toReply.map((email, index) => (
                  <div
                    key={index}
                    className="mb-[12px] bg-white rounded-[8px] p-[12px] border-solid border-[1px] border-red-200"
                  >
                    <Text className="text-[16px] font-bold text-gray-800 m-0">
                      {email.sender}
                    </Text>
                    <Text className="text-[14px] text-gray-700 mt-[4px] mb-[4px]">
                      {email.subject}
                    </Text>
                    <Text className="text-[13px] text-gray-500 m-0">
                      Received: {email.received} • Due: {email.dueBy}
                    </Text>
                  </div>
                ))}
              </div>
            </Section>

            {/* Action Button */}
            <Section className="text-center mb-[24px]">
              <Button
                href="https://example.com/inbox"
                className="bg-blue-600 text-white px-[24px] py-[12px] rounded-[4px] text-[16px] font-medium no-underline inline-block box-border"
              >
                View Complete Inbox
              </Button>
            </Section>

            <Hr className="border-solid border-gray-200 my-[24px]" />

            <Footer baseUrl={baseUrl} unsubscribeToken={unsubscribeToken} />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

DigestEmail.PreviewProps = {
  baseUrl: "https://www.getinboxzero.com",
  unsubscribeToken: "123",
  newsletters: [
    {
      sender: "Morning Brew",
      subject: "🔥 Today's top business stories",
      preview:
        "The latest on tech layoffs, market trends, and startup funding rounds...",
    },
    {
      sender: "The New York Times",
      subject: "Breaking News: Latest developments",
      preview:
        "Stay informed with the latest headlines and analysis from around the world...",
    },
    {
      sender: "Product Hunt Daily",
      subject: "🚀 Today's hottest tech products",
      preview:
        "Discover the newest apps, websites, and tech products that launched today...",
    },
  ],
  receipts: [
    {
      merchant: "Amazon",
      description: "Order #112-3456789-0123456",
      amount: "$42.99",
      time: "9:15 AM",
    },
    {
      merchant: "Uber Eats",
      description: "Order #EAT-123456789",
      amount: "$23.45",
      time: "1:20 PM",
    },
    {
      merchant: "Netflix",
      description: "Monthly subscription",
      amount: "$15.99",
      time: "4:30 AM",
    },
  ],
  marketing: [
    {
      sender: "Spotify",
      subject: "Limited offer: 3 months premium for $0.99",
      preview: "Upgrade your music experience with this exclusive deal",
    },
    {
      sender: "Nike",
      subject: "JUST IN: New Summer Collection 🔥",
      preview: "Be the first to shop our latest styles before they sell out",
    },
    {
      sender: "Airbnb",
      subject: "Weekend getaway ideas near you",
      preview: "Discover unique stays within a 2-hour drive from your location",
    },
  ],
  calendar: [
    {
      title: "Team Weekly Sync",
      time: "Tomorrow, 10:00 AM - 11:00 AM",
      location: "Meeting Room 3 / Zoom",
      organizer: "Sarah Johnson",
    },
    {
      title: "Quarterly Review",
      time: "Friday, May 26, 2:00 PM - 4:00 PM",
      location: "Conference Room A",
      organizer: "Michael Chen",
    },
    {
      title: "Dentist Appointment",
      time: "Monday, May 29, 9:30 AM",
      location: "Downtown Dental Clinic",
      organizer: "Personal Calendar",
    },
  ],
  coldEmails: [
    {
      sender: "David Williams",
      subject: "Partnership opportunity for your business",
      company: "Growth Solutions Inc.",
    },
    {
      sender: "Jennifer Lee",
      subject: "Request for a quick call this week",
      company: "Venture Capital Partners",
    },
    {
      sender: "Robert Taylor",
      subject: "Introducing our new B2B solution",
      company: "Enterprise Tech Solutions",
    },
  ],
  notifications: [
    {
      app: "LinkedIn",
      message: "5 people viewed your profile this week",
      time: "11:00 AM",
    },
    {
      app: "Slack",
      message: "3 unread messages in #general channel",
      time: "2:45 PM",
    },
    {
      app: "GitHub",
      message: "Pull request #123 was approved",
      time: "5:30 PM",
    },
    {
      app: "Twitter",
      message: "You have 7 new followers",
      time: "6:15 PM",
    },
  ],
  toReply: [
    {
      sender: "John Smith",
      subject: "Re: Project proposal feedback",
      received: "Yesterday, 4:30 PM",
      dueBy: "Today",
    },
    {
      sender: "Client XYZ",
      subject: "Questions about the latest deliverable",
      received: "Monday, 10:15 AM",
      dueBy: "Tomorrow",
    },
    {
      sender: "HR Department",
      subject: "Annual review scheduling",
      received: "Tuesday, 9:00 AM",
      dueBy: "Friday",
    },
  ],
};

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

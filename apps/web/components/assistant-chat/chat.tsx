"use client";

import type React from "react";
import { useState } from "react";
import { type ScopedMutator, SWRConfig, useSWRConfig } from "swr";
import type { UIMessage } from "ai";
import { useChat } from "@ai-sdk/react";
import { toast } from "sonner";
import { HistoryIcon, Loader2 } from "lucide-react";
import { useQueryState } from "nuqs";
import { MultimodalInput } from "@/components/assistant-chat/multimodal-input";
import { Messages } from "./messages";
import { EMAIL_ACCOUNT_HEADER } from "@/utils/config";
import { ResizableHandle } from "@/components/ui/resizable";
import { ResizablePanelGroup } from "@/components/ui/resizable";
import { ResizablePanel } from "@/components/ui/resizable";
import { AssistantTabs } from "@/app/(app)/[emailAccountId]/automation/AssistantTabs";
import { ChatProvider } from "./ChatContext";
import { SWRProvider } from "@/providers/SWRProvider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useChats } from "@/hooks/useChats";
import { LoadingContent } from "@/components/LoadingContent";
import { useChatMessages } from "@/hooks/useChatMessages";
import type { GetChatResponse } from "@/app/api/chats/[chatId]/route";
import { useIsMobile } from "@/hooks/use-mobile";

// Some mega hacky code used here to workaround AI SDK's use of SWR
// AI SDK uses SWR too and this messes with the global SWR config
// Wrapping in SWRConfig to disable global fetcher for this component
// https://github.com/vercel/ai/issues/3214#issuecomment-2675872030
// We then re-enable the regular SWRProvider in the AssistantTabs component
// AI SDK v5 won't use SWR anymore so we can remove this workaround

type ChatProps = {
  emailAccountId: string;
};

export function Chat(props: ChatProps) {
  // Use parent SWR config for mutate
  const { mutate } = useSWRConfig();

  const [chatId] = useQueryState("chatId");
  const { data } = useChatMessages(chatId ?? undefined);

  return (
    <SWRConfig
      value={{
        fetcher: undefined, // Disable global fetcher for this component
      }}
    >
      <ChatInner
        {...props}
        mutate={mutate}
        initialMessages={data ? convertToUIMessages(data) : []}
        chatId={chatId || undefined}
      />
    </SWRConfig>
  );
}

function ChatInner({
  chatId,
  initialMessages,
  emailAccountId,
  mutate,
}: ChatProps & {
  chatId?: string;
  mutate: ScopedMutator;
  initialMessages: Array<UIMessage>;
}) {
  const chat = useChat({
    id: chatId,
    api: "/api/chat",
    experimental_prepareRequestBody: (body) => ({
      id: chatId,
      message: body.messages.at(-1),
    }),
    initialMessages,
    experimental_throttle: 100,
    sendExtraMessageFields: true,
    generateId: generateUUID,
    headers: {
      [EMAIL_ACCOUNT_HEADER]: emailAccountId,
    },
    onFinish: () => {
      mutate("/api/user/rules");
    },
    onError: (error) => {
      console.error(error);
      toast.error(`An error occured! ${error.message || ""}`);
    },
  });

  const isMobile = useIsMobile();

  return (
    <ChatProvider setInput={chat.setInput}>
      <ResizablePanelGroup
        direction={isMobile ? "vertical" : "horizontal"}
        className="flex-grow"
      >
        <ResizablePanel className="overflow-y-auto">
          <ChatUI chat={chat} chatId={chatId} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel className="overflow-hidden">
          {/* re-enable the regular SWRProvider */}
          <SWRProvider>
            <AssistantTabs />
          </SWRProvider>
        </ResizablePanel>
      </ResizablePanelGroup>
    </ChatProvider>
  );
}

function ChatUI({
  chat,
  chatId,
}: {
  chat: ReturnType<typeof useChat>;
  chatId?: string;
}) {
  const {
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    status,
    stop,
    reload,
  } = chat;

  return (
    <div className="flex h-full min-w-0 flex-col bg-background">
      <div className="flex items-center justify-end px-2 pt-2">
        <SWRProvider>
          <ChatHistoryDropdown />
        </SWRProvider>
      </div>
      <Messages
        status={status}
        messages={messages}
        setMessages={setMessages}
        setInput={setInput}
        reload={reload}
        isArtifactVisible={false}
      />

      <form className="mx-auto flex w-full gap-2 bg-background px-4 pb-4 md:max-w-3xl md:pb-6">
        <MultimodalInput
          chatId={chatId}
          input={input}
          setInput={setInput}
          handleSubmit={handleSubmit}
          status={status}
          stop={stop}
          // attachments={attachments}
          // setAttachments={setAttachments}
          // messages={messages}
          setMessages={setMessages}
          // append={append}
        />
      </form>

      {/* <Artifact
        chatId={id}
        input={input}
        setInput={setInput}
        handleSubmit={handleSubmit}
        status={status}
        stop={stop}
        attachments={attachments}
        setAttachments={setAttachments}
        append={append}
        messages={messages}
        setMessages={setMessages}
        reload={reload}
      /> */}
    </div>
  );
}

function ChatHistoryDropdown() {
  const [_chatId, setChatId] = useQueryState("chatId");
  const [shouldLoadChats, setShouldLoadChats] = useState(false);
  const { data, error, isLoading, mutate } = useChats(shouldLoadChats);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onMouseEnter={() => setShouldLoadChats(true)}
          onClick={() => mutate()}
        >
          <HistoryIcon className="size-5" />
          <span className="sr-only">Chat History</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <LoadingContent
          loading={isLoading}
          error={error}
          loadingComponent={
            <DropdownMenuItem
              disabled
              className="flex items-center justify-center"
            >
              <Loader2 className="mr-2 size-4 animate-spin" />
              Loading chats...
            </DropdownMenuItem>
          }
          errorComponent={
            <DropdownMenuItem disabled>Error loading chats</DropdownMenuItem>
          }
        >
          {data && data.chats.length > 0 ? (
            data.chats.map((chatItem) => (
              <DropdownMenuItem
                key={chatItem.id}
                onSelect={() => {
                  setChatId(chatItem.id);
                }}
              >
                {`Chat from ${new Date(chatItem.createdAt).toLocaleString()}`}
              </DropdownMenuItem>
            ))
          ) : (
            <DropdownMenuItem disabled>
              No previous chats found
            </DropdownMenuItem>
          )}
        </LoadingContent>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// NOTE: not sure why we don't just use the default from AI SDK
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function convertToUIMessages(chat: GetChatResponse): Array<UIMessage> {
  return (
    chat?.messages.map((message) => ({
      id: message.id,
      parts: message.parts as UIMessage["parts"],
      role: message.role as UIMessage["role"],
      // Note: content will soon be deprecated in @ai-sdk/react
      content: "",
      createdAt: message.createdAt,
      // experimental_attachments: (message.attachments as Array<Attachment>) ?? [],
    })) || []
  );
}

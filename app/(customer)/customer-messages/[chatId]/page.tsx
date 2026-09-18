"use client";
import { use } from "react";
import { ChatScreen } from "@/components/chat/ChatScreen";

export default function CustomerChatPage({ params }: { params: Promise<{ chatId: string }> }) {
  const { chatId } = use(params);
  return <ChatScreen chatId={chatId} role="customer" />;
}

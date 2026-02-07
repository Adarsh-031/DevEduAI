"use client";

import { MessageThreadPanel } from "@/components/ui/message-thread-panel";
import { CanvasSpace } from "@/components/ui/canvas-space";
import { useMcpServers } from "@/components/tambo/mcp-config-modal";
import { components, tools } from "@/lib/tambo";
import { TamboProvider, useTamboThread, useTamboThreadInput } from "@tambo-ai/react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

function ChatAutoStarter() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q");
  const { thread } = useTamboThread();
  const messages = thread?.messages || [];
  const { setValue, submit } = useTamboThreadInput();
  const hasStarted = useRef(false);

  useEffect(() => {
    // Only auto-start if there's a query and the chat history is completely empty
    if (query && messages.length === 0 && !hasStarted.current) {
      hasStarted.current = true;
      setValue(query);
      
      // Brief timeout to ensure setValue state is processed by the input context
      setTimeout(async () => {
        try {
          await submit({ streamResponse: true });
          // Clear the URL parameters after sending to prevent re-sending on reload
          router.replace("/chat");
        } catch (e) {
          console.error("Failed to auto-submit query:", e);
        }
      }, 50);
    }
  }, [query, messages.length, setValue, submit, router]);

  return null;
}

function ChatInterface() {
  const mcpServers = useMcpServers();

  return (
    <TamboProvider
      apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY!}
      components={components}
      tools={tools}
      tamboUrl={process.env.NEXT_PUBLIC_TAMBO_URL}
      mcpServers={mcpServers}
    >
      <div className="h-screen flex relative overflow-hidden">
        <ChatAutoStarter />
        <MessageThreadPanel className="max-w-4xl mx-auto z-0"/>
        <CanvasSpace/>
      </div>
    </TamboProvider>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center font-mono text-zinc-400">Initializng Tambo...</div>}>
      <ChatInterface />
    </Suspense>
  );
}

"use client";
import Title from "@/components/title";
import BulbIcon from "@/icons/bulb";
import PotIcon from "@/icons/pot";
import { useAssistant } from "@/stores/assistant";
import { useHistory } from "@/stores/history";
import clsx from "clsx";
import { useEffect, useRef } from "react";
import { AssistantMessage, ErrorMessage, UserMessage } from "./message";
import Textbox from "./textbox";
import ThinkingDisplay from "./thinking-display";

export default function Chat() {
  const history = useHistory((s) => s.history);
  const assistantStatus = useAssistant((s) => s.status);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatRef.current) return;
    chatRef.current.scrollIntoView({ behavior: "smooth" });
  }, [history, assistantStatus]);

  return (
    <div
      className={clsx(
        "relative flex flex-1 flex-col items-center overflow-hidden pb-14",
        history.length === 0 && "justify-center gap-6",
      )}
    >
      {history.length === 0 ? (
        <Title>No pienses más que comer.</Title>
      ) : (
        <div className="w-full flex-1 overflow-y-auto px-5">
          <div className="mx-auto flex w-full max-w-3xl translate-y-13 flex-col gap-5 pb-10 max-2xl:pt-4 max-xl:max-w-2xl">
            {history.map((message, i) =>
              message.role === "user" ? (
                <UserMessage key={i}>{message.content}</UserMessage>
              ) : message.role === "assistant" ? (
                <AssistantMessage key={i} blocks={message.content} />
              ) : (
                <ErrorMessage key={i}>{message.content}</ErrorMessage>
              ),
            )}
            {assistantStatus && assistantStatus !== "streaming" && (
              <ThinkingDisplay
                icon={
                  assistantStatus === "thinking" ? (
                    <BulbIcon className="size-5 animate-pulse" />
                  ) : (
                    <PotIcon className="size-5 animate-pulse" />
                  )
                }
              >
                {assistantStatus === "thinking" ? "Pensando" : "Cocinando"}
              </ThinkingDisplay>
            )}
            <div ref={chatRef} />
          </div>
        </div>
      )}
      <Textbox />
    </div>
  );
}

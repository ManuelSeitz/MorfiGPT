"use client";

import Textbox from "@/components/textbox";
import { useTextboxKeydown } from "@/hooks/useTextboxKeydown";
import ArrowUpIcon from "@/icons/arrow-up";
import StopIcon from "@/icons/stop";
import { useAssistant } from "@/stores/assistant";
import { Block, useHistory } from "@/stores/history";
import { zodResolver } from "@hookform/resolvers/zod";
import { PERSONAL_URL } from "@repo/constants";
import clsx from "clsx";
import { useEffect, useRef } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import z from "zod";

const FormSchema = z.object({
  message: z.string().refine((data) => data.trim()),
});

export default function TextboxSection() {
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useTextboxKeydown(textareaRef);

  const { handleSubmit, watch, reset, control } = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: { message: "" },
  });

  const {
    history,
    chatId,
    addUserMessage,
    initAssistantMessage,
    updateAssistantMessage,
    addErrorMessage,
  } = useHistory();

  const { status, setStatus } = useAssistant();

  const onSubmit: SubmitHandler<z.infer<typeof FormSchema>> = ({ message }) => {
    reset();
    addUserMessage(message);

    const url = new URL("/api/chats/chat", window.location.origin);
    url.searchParams.append("message", message);
    url.searchParams.append("chatId", chatId);

    setStatus("thinking");

    const eventSource = new EventSource(url, { withCredentials: true });
    eventSourceRef.current = eventSource;

    initAssistantMessage();

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data as string) as Block;

      if (data.type === "start") {
        setStatus("cooking");
        return;
      }

      if (data.type !== "start") {
        setStatus("streaming");
      }

      if (data.type === "done") {
        eventSource.close();
        setStatus(null);
        return;
      }

      updateAssistantMessage(data);
    };

    eventSource.onerror = () => {
      setStatus(null);

      if (eventSource.readyState === EventSource.CLOSED) {
        eventSource.close();
        addErrorMessage(
          "Límite diario alcanzado o error del servidor. Refresca la página o inicia sesión",
        );
      } else {
        addErrorMessage("Error durante la conexión");
      }
    };
  };

  const message = watch("message");
  const isMultiline = message.includes("\n");

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    if (message === "") {
      textarea.style.height = "auto";
    } else {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight.toString()}px`;
    }
  }, [message]);

  return (
    <div
      className={clsx(
        "bottom-2 mx-auto flex w-full max-w-3xl flex-col items-center gap-2 max-xl:px-5",
        history.length === 0 ? "static max-[480px]:absolute" : "absolute",
      )}
    >
      <form
        ref={formRef}
        onSubmit={void handleSubmit(onSubmit)}
        className="w-full"
      >
        <Textbox
          ref={textareaRef}
          actions={[
            {
              show: !!message && !status,
              type: "submit",
              variant: "primary",
              "aria-label": "Enviar mensaje",
              className: "p-2 rounded-full",
              children: <ArrowUpIcon className="size-5" />,
            },
            {
              show: status === "streaming",
              type: "button",
              variant: "secondary",
              "aria-label": "Detener respuesta",
              className: "p-2 rounded-full",
              onClick: () => {
                eventSourceRef.current?.close();
                setStatus(null);
              },
              children: <StopIcon className="size-5" />,
            },
          ]}
        >
          <Controller
            control={control}
            name="message"
            render={({ field: { name, value, onChange } }) => (
              <textarea
                ref={textareaRef}
                name={name}
                rows={isMultiline ? undefined : 1}
                placeholder="Pedime una receta"
                className="my-auto ml-2 max-h-48 w-full resize-none overflow-y-auto leading-6"
                value={value}
                onChange={onChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    formRef.current?.requestSubmit();
                  }
                }}
              />
            )}
          />
        </Textbox>
      </form>
      {history.length === 0 ? (
        <p className="text-primary-800 absolute right-0 bottom-2 left-0 text-center text-xs max-[480px]:static">
          Recetas reales, con precios reales. Creada por{" "}
          <a
            href={PERSONAL_URL.href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold hover:underline"
          >
            Manuel Seitz
          </a>{" "}
          🇦🇷
        </p>
      ) : (
        <p className="text-primary-800 w-fit text-xs">
          MorfiGPT puede cometer errores. Creada por{" "}
          <a
            href={PERSONAL_URL.href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold hover:underline"
          >
            Manuel Seitz
          </a>{" "}
          🇦🇷
        </p>
      )}
    </div>
  );
}

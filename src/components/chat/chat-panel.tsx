"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { Textarea } from "@/components/ui/textarea";
import {
  QUESTION_MAX,
  validateQuestion,
  type Source,
  type Turn,
} from "@/lib/rag";
import { DAILY_QUESTION_LIMIT } from "@/lib/chat-usage";
import { askAssistant } from "@/services/rag-actions";

type ChatMessage =
  | { id: number; role: "user"; content: string }
  | {
      id: number;
      role: "assistant";
      content: string;
      sources: Source[];
      grounded: boolean;
      question: string;
    };

type Failure = {
  message: string;
  question: string;
};

function TicketLink({ question }: { question?: string }) {
  return (
    <Link
      className="w-fit font-medium text-ink underline underline-offset-[3px]"
      href={
        question
          ? `/chamados/novo?pergunta=${encodeURIComponent(question)}`
          : "/chamados/novo"
      }
    >
      Abrir chamado
    </Link>
  );
}

function Answer({
  message,
}: {
  message: Extract<ChatMessage, { role: "assistant" }>;
}) {
  const documents = [...new Set(message.sources.map((source) => source.document))];

  return (
    <article className="max-w-[85%]">
      <p className="text-xs text-muted">Assistente</p>
      <p className="mt-1 whitespace-pre-line">{message.content}</p>
      {message.grounded && documents.length > 0 ? (
        <p className="mt-2 text-xs text-muted">
          Fontes: {documents.join(", ")}
        </p>
      ) : null}
      {message.grounded ? null : (
        <div className="mt-3">
          <TicketLink question={message.question} />
        </div>
      )}
    </article>
  );
}

export function ChatPanel({
  initialRemaining = null,
}: {
  initialRemaining?: number | null;
}) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [failure, setFailure] = useState<Failure | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(initialRemaining);
  const [pending, startTransition] = useTransition();
  const nextId = useRef(0);
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const transcript = transcriptRef.current;

    if (transcript) {
      transcript.scrollTop = transcript.scrollHeight;
    }
  }, [messages.length, pending, failure]);

  function send(raw: string) {
    const parsed = validateQuestion(raw);

    if (!parsed.ok) {
      setFieldError(parsed.message);
      return;
    }

    const history: Turn[] = messages
      .slice(-6)
      .map((message) => ({ role: message.role, content: message.content }));

    nextId.current += 1;
    const userMessage: ChatMessage = {
      id: nextId.current,
      role: "user",
      content: parsed.value,
    };

    setFieldError(null);
    setFailure(null);
    setQuestion("");
    setMessages((previous) => [...previous, userMessage]);

    startTransition(async () => {
      const result = await askAssistant({
        question: parsed.value,
        history,
      });

      if (!result.ok) {
        setMessages((previous) =>
          previous.filter((message) => message.id !== userMessage.id),
        );
        setFailure({ message: result.error, question: parsed.value });
        setRemaining(result.remaining);
        return;
      }

      setRemaining(result.remaining);
      nextId.current += 1;
      setMessages((previous) => [
        ...previous,
        {
          id: nextId.current,
          role: "assistant",
          content: result.answer,
          sources: result.sources,
          grounded: result.grounded,
          question: parsed.value,
        },
      ]);
    });
  }

  const isEmpty = messages.length === 0 && !pending && !failure;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <div
        aria-live="polite"
        className={`flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto pr-1 ${isEmpty ? "justify-center" : ""}`}
        ref={transcriptRef}
      >
        {isEmpty ? (
          <EmptyState message="Pergunte sobre acessos, benefícios, férias ou onboarding." />
        ) : null}

        {messages.map((message) =>
          message.role === "user" ? (
            <p
              key={message.id}
              className="ml-auto max-w-[85%] rounded-control bg-active px-4 py-3 whitespace-pre-line"
            >
              {message.content}
            </p>
          ) : (
            <Answer key={message.id} message={message} />
          ),
        )}

        {pending ? (
          <p className="flex items-center gap-2 text-muted">
            <Spinner />
            Consultando os documentos…
          </p>
        ) : null}

        {failure ? (
          <ErrorState
            action={
              <div className="flex flex-col items-center gap-3">
                <Button onClick={() => send(failure.question)}>
                  Tentar de novo
                </Button>
                <TicketLink question={failure.question} />
              </div>
            }
            message={failure.message}
          />
        ) : null}
      </div>

      <form
        className="grid shrink-0 gap-3 border-t border-border pt-4"
        onSubmit={(event) => {
          event.preventDefault();
          send(question);
        }}
      >
        <Field
          error={fieldError ?? undefined}
          hint={`${question.length}/${QUESTION_MAX} caracteres`}
          id="question"
          label="Pergunta"
        >
          <Textarea
            name="question"
            onChange={(event) => {
              setQuestion(event.target.value);
              if (fieldError) {
                setFieldError(null);
              }
            }}
            rows={3}
            value={question}
          />
        </Field>

        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-xs text-muted">
              Histórico desta conversa fica só nesta aba.
            </p>
            {remaining === null ? null : remaining === 0 ? (
              <p className="text-xs text-negative">
                Limite diário atingido. <TicketLink />
              </p>
            ) : (
              <p className="text-xs text-muted">
                Restam {remaining} de {DAILY_QUESTION_LIMIT} perguntas hoje.
              </p>
            )}
          </div>
          <Button
            disabled={
              remaining === 0 ||
              question.trim().length === 0 ||
              question.length > QUESTION_MAX
            }
            loading={pending}
            type="submit"
            variant="primary"
          >
            Perguntar
          </Button>
        </div>
      </form>
    </div>
  );
}

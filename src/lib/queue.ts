import type { TicketStatus, TicketSummary } from "@/types/ticket";

export type QueueItem = TicketSummary & {
  requesterName: string;
};

function statusRank(status: TicketStatus): number {
  return status === "aberto" ? 0 : 1;
}

export function sortQueue<T extends { status: TicketStatus; createdAt: string }>(
  tickets: T[],
): T[] {
  return [...tickets].sort((a, b) => {
    const rank = statusRank(a.status) - statusRank(b.status);

    if (rank !== 0) {
      return rank;
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function formatAge(createdAt: string, now: Date): string {
  const diffMs = now.getTime() - new Date(createdAt).getTime();

  if (diffMs < 60_000) {
    return "agora";
  }

  const minutes = Math.floor(diffMs / 60_000);

  if (minutes < 60) {
    return `há ${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `há ${hours} h`;
  }

  const days = Math.floor(hours / 24);

  return days === 1 ? "há 1 dia" : `há ${days} dias`;
}

export const DAILY_QUESTION_LIMIT = 10;

const dayFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Sao_Paulo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/**
 * Dia corrente em America/Sao_Paulo, no formato YYYY-MM-DD. A meia-noite local
 * vira o dia mesmo quando em UTC ainda é o dia anterior.
 */
export function saoPauloDay(instant: Date): string {
  return dayFormatter.format(instant);
}

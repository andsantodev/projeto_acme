export default function TicketDetailLoading() {
  return (
    <div aria-busy="true" className="flex flex-col gap-6">
      <div className="h-3 w-40 rounded bg-raised" />
      <div className="flex flex-col gap-2">
        <div className="h-7 w-2/3 rounded bg-raised" />
        <div className="h-4 w-1/3 rounded bg-raised" />
      </div>
      <div className="h-32 rounded-card border border-border bg-surface" />
    </div>
  );
}

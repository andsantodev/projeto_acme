export default function QueueLoading() {
  return (
    <div aria-busy="true" className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="h-7 w-64 rounded bg-raised" />
        <div className="h-4 w-96 max-w-full rounded bg-raised" />
      </div>
      <div className="overflow-hidden rounded-card border border-border bg-surface">
        {[0, 1, 2].map((row) => (
          <div
            key={row}
            className="border-b border-rule px-5 py-4 last:border-b-0"
          >
            <div className="h-4 w-1/2 rounded bg-raised" />
            <div className="mt-2 h-3 w-1/3 rounded bg-raised" />
          </div>
        ))}
      </div>
    </div>
  );
}

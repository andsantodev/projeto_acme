export function Spinner({ label = "Carregando" }: { label?: string }) {
  return (
    <span className="inline-flex items-center" role="status">
      <svg
        aria-hidden="true"
        className="size-3.5 animate-spin motion-reduce:animate-none"
        fill="none"
        viewBox="0 0 16 16"
      >
        <circle
          cx="8"
          cy="8"
          r="6"
          stroke="currentColor"
          strokeOpacity="0.25"
          strokeWidth="2"
        />
        <path
          d="M14 8a6 6 0 0 0-6-6"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="2"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </span>
  );
}

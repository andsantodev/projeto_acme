export function PageIntro({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-6">
      <h1 className="text-[22px] leading-[1.2] font-semibold tracking-[-0.01em]">
        {title}
      </h1>
      {description ? (
        <p className="mt-1 text-muted">{description}</p>
      ) : null}
    </div>
  );
}

export function PageIntro({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-6">
      <h1 className="text-title font-semibold">{title}</h1>
      {description ? (
        <p className="mt-1 text-muted">{description}</p>
      ) : null}
    </div>
  );
}

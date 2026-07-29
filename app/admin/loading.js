export default function Loading() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container-prose py-10">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 rounded bg-surface-2" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-28 rounded-2xl border border-border bg-surface" />
            ))}
          </div>
          <div className="h-96 rounded-2xl border border-border bg-surface" />
        </div>
      </div>
    </main>
  );
}

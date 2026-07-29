export default function Loading() {
  return (
    <main className="flex-1 bg-background text-foreground">
      <section className="container-prose py-16">
        <div className="animate-pulse space-y-6">
          <div className="mx-auto h-4 w-32 rounded bg-surface-2" />
          <div className="mx-auto h-12 w-3/4 rounded bg-surface-2" />
          <div className="mx-auto h-4 w-2/3 rounded bg-surface-2" />
          <div className="grid gap-6 pt-8 lg:grid-cols-2">
            <div className="h-96 rounded-2xl border border-border bg-surface" />
            <div className="space-y-4">
              <div className="h-44 rounded-2xl border border-border bg-surface" />
              <div className="h-44 rounded-2xl border border-border bg-surface" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

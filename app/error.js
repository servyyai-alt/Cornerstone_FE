"use client";

export default function Error({ error, reset }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <div className="text-center space-y-4">
        <h2 className="font-display text-2xl">Something went wrong!</h2>
        <p className="text-muted-foreground">{error.message}</p>
        <button
          onClick={() => reset()}
          className="inline-flex items-center justify-center rounded-md bg-primary text-white px-4 py-2 text-sm font-medium"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
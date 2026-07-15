export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <div className="text-center space-y-4">
        <h2 className="font-display text-2xl">Page Not Found</h2>
        <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
        <a
          href="/"
          className="inline-flex items-center justify-center rounded-md bg-primary text-white px-4 py-2 text-sm font-medium"
        >
          Return Home
        </a>
      </div>
    </div>
  );
}
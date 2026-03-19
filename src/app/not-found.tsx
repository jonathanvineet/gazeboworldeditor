export default function NotFound() {
  return (
    <div className="flex h-screen items-center justify-center bg-zinc-900 text-zinc-300">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">404 – Page Not Found</h2>
        <a href="/" className="text-blue-400 hover:underline text-sm">
          ← Back to editor
        </a>
      </div>
    </div>
  );
}

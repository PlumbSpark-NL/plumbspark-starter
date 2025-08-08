export default function HomePage(){
  return (
    <div className="grid gap-6">
      <section className="card p-6">
        <h1 className="text-2xl font-semibold">Welcome to PlumbSpark 🚰</h1>
        <p className="mt-2 text-gray-600">
          Your AI-powered quoting app. Create itemised quotes, auto-generate proposals, and export PDFs.
        </p>
      </section>
      <section className="card p-6">
        <h2 className="text-lg font-semibold">Get started</h2>
        <ol className="mt-3 list-decimal list-inside text-gray-700 space-y-1">
          <li>Go to <strong>New Quote</strong> to draft your first quote.</li>
          <li>Click <strong>Generate with AI</strong> to prefill items from a brief.</li>
          <li>Save (local only for now) and review on the Dashboard.</li>
        </ol>
        <p className="mt-3 text-sm text-gray-500">
          Authentication and database wiring are coming next.
        </p>
      </section>
    </div>
  );
}

export default function SectionLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-40 rounded bg-gray-200" />
      <div className="h-4 w-64 rounded bg-gray-100" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border bg-white p-4">
            <div className="h-5 w-3/4 rounded bg-gray-200 mb-2" />
            <div className="h-4 w-full rounded bg-gray-100 mb-2" />
            <div className="flex gap-4">
              <div className="h-4 w-20 rounded bg-gray-100" />
              <div className="h-4 w-16 rounded bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

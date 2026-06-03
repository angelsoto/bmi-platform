export default function SurfacesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-3 w-36 rounded bg-gray-200" />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="h-8 w-48 rounded bg-gray-200" />
          <div className="mt-1 h-4 w-72 rounded bg-gray-100" />
        </div>
        <div className="h-9 w-40 rounded-md bg-gray-200" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border bg-white p-4">
            <div className="h-5 w-3/4 rounded bg-gray-200" />
            <div className="mt-2 h-3 w-1/2 rounded bg-gray-100" />
            <div className="mt-3 flex items-center justify-between">
              <div className="h-5 w-16 rounded-full bg-gray-100" />
              <div className="h-3 w-12 rounded bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

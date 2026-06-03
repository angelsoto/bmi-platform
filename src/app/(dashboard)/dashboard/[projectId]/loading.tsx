export default function ProjectDetailLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 rounded bg-gray-200" />
      <div className="h-4 w-96 rounded bg-gray-100" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 h-48 rounded-lg border bg-white p-4">
          <div className="h-5 w-40 rounded bg-gray-200 mb-3" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 rounded-md bg-gray-50 p-2">
                <div className="h-4 w-3/4 rounded bg-gray-200" />
                <div className="mt-1 h-3 w-1/2 rounded bg-gray-100" />
              </div>
            ))}
          </div>
        </div>
        <div className="h-48 rounded-lg border bg-white p-4">
          <div className="h-5 w-28 rounded bg-gray-200 mb-3" />
          <div className="flex items-center justify-center h-24">
            <div className="h-24 w-24 rounded-full bg-gray-100" />
          </div>
        </div>
      </div>
    </div>
  );
}

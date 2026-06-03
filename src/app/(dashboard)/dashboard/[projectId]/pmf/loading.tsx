export default function PMFLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-3 w-36 rounded bg-gray-200" />
      <div>
        <div className="h-8 w-48 rounded bg-gray-200" />
        <div className="mt-1 h-4 w-80 rounded bg-gray-100" />
      </div>
      <div className="rounded-lg border bg-white p-6">
        <div className="flex items-center justify-center gap-8">
          <div className="h-36 w-36 rounded-full bg-gray-100" />
          <div className="space-y-3">
            <div className="h-8 w-36 rounded bg-gray-200" />
            <div className="h-4 w-28 rounded bg-gray-100" />
            <div className="h-4 w-24 rounded bg-gray-100" />
          </div>
        </div>
      </div>
      <div className="h-24 rounded-lg bg-gray-100" />
    </div>
  );
}

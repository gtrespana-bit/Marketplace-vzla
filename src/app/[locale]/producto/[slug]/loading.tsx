export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Image skeleton */}
        <div className="aspect-square bg-gray-200 rounded-xl animate-pulse" />

        {/* Details skeleton */}
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-48 animate-pulse" />
          <div className="h-24 bg-gray-200 rounded animate-pulse" />
          <div className="flex gap-3">
            <div className="h-12 bg-gray-200 rounded-lg flex-1 animate-pulse" />
            <div className="h-12 bg-gray-200 rounded-lg flex-1 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Description skeleton */}
      <div className="mt-8 space-y-3">
        <div className="h-6 bg-gray-200 rounded w-32 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse" />
      </div>
    </div>
  )
}

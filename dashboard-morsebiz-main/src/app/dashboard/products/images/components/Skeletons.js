// Skeleton Components for Product Images Page

export const FolderSkeleton = () => (
  <div className="border rounded-lg p-4 animate-pulse">
    <div className="flex items-center gap-3 mb-3">
      <div className="h-8 w-8 bg-gray-200 rounded" />
      <div className="flex-1 min-w-0">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
      </div>
    </div>
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="h-3 bg-gray-200 rounded w-12" />
        <div className="h-5 bg-gray-200 rounded w-8" />
      </div>
      <div className="flex items-center justify-between">
        <div className="h-3 bg-gray-200 rounded w-8" />
        <div className="h-3 bg-gray-200 rounded w-16" />
      </div>
      <div className="h-3 bg-gray-200 rounded w-24" />
    </div>
  </div>
);

export const FileSkeleton = () => (
  <div className="border rounded-lg p-4 animate-pulse">
    <div className="flex items-start justify-between">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-4 w-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded w-48" />
        </div>
        <div className="flex items-center gap-4">
          <div className="h-3 bg-gray-200 rounded w-24" />
          <div className="h-3 bg-gray-200 rounded w-16" />
          <div className="h-5 bg-gray-200 rounded w-20" />
        </div>
      </div>
      <div className="flex items-center gap-2 ml-4">
        <div className="h-8 w-16 bg-gray-200 rounded" />
        <div className="h-8 w-20 bg-gray-200 rounded" />
      </div>
    </div>
  </div>
);

export const BrandDropdownSkeleton = () => (
  <div className="space-y-2 p-2">
    {Array.from({ length: 5 }).map((_, index) => (
      <div key={index} className="animate-pulse">
        <div className="flex items-center gap-2 p-3">
          <div className="w-4 h-4 bg-gray-200 rounded-full" />
          <div className="h-4 bg-gray-200 rounded w-32" />
        </div>
      </div>
    ))}
  </div>
);

export const FolderGridSkeleton = ({ count = 8 }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <FolderSkeleton key={index} />
      ))}
    </div>
  </div>
);

export const FileListSkeleton = ({ count = 6 }) => (
  <div className="space-y-4">
    <div className="grid gap-3">
      {Array.from({ length: count }).map((_, index) => (
        <FileSkeleton key={index} />
      ))}
    </div>
  </div>
);
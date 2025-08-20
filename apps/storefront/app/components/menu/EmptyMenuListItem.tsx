export const EmptyMenuListItem = () => {
  return (
    <div className="group relative animate-pulse">
      <div className="aspect-h-1 aspect-w-1 lg:aspect-none w-full overflow-hidden rounded-md bg-gray-200 group-hover:opacity-75 lg:h-80" />
      <div className="mt-4 flex justify-between">
        <div className="w-2/3">
          <div className="h-4 w-full rounded bg-gray-200" />
          <div className="mt-1 h-4 w-1/2 rounded bg-gray-200" />
        </div>
        <div className="h-4 w-1/4 rounded bg-gray-200" />
      </div>
    </div>
  );
}; 
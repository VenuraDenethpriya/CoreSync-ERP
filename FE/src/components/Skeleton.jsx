export const SkeletonDetailRow = () => (
  <div className="flex justify-between items-center py-2">
    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
    <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
  </div>
);

export const SkeletonUsageRow = () => (
  <div className="grid sm:grid-cols-5 grid-cols-1 gap-2 text-xs text-gray-500 font-semibold border-b pb-1 py-2">
    <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
    <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
    <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
    <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
    <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
  </div>
);

export const SkeletonUsageRow3 = () => (
  <div className="grid sm:grid-cols-3 grid-cols-1 gap-2 text-xs text-gray-500 font-semibold border-b pb-1 py-2">
    <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
    <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
    <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
  </div>
);

export const SkeletonTableRow = () => (
  <tr className="bg-white divide-y divide-gray-200">
    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
      <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700">
      <div className="h-4 w-20 bg-gray-200 rounded animate-pulse float-right"></div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700">
      <div className="h-4 w-12 bg-gray-200 rounded animate-pulse float-right"></div>
    </td>   
    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700">
      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse float-right"></div>
    </td>
  </tr>
);

export const SkeletonSummaryRow = () => (
  <div className="flex flex-wrap justify-between items-center py-1">
    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
  </div>
);


export function ErrorState({ errorMessage, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-red-600 p-8">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-12 h-12 mb-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
        />
      </svg>
      <p className="text-xl font-semibold mb-2">Oops! Something went wrong.</p>
      {errorMessage && <p className="text-sm text-gray-500 mb-6 text-center">{errorMessage}</p>}
      {/* <button
        onClick={onRetry}
        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
      >
        Try Again
      </button> */}
    </div>
  );
}

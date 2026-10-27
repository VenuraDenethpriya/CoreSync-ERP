import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

/**
 * 1. Simple Key-Value Detail Row (For sidebar profiles or summary cards)
 */
export const SkeletonDetailRow = () => (
  <div className="flex justify-between items-center py-3 border-b border-slate-100 last:border-0">
    <div className="h-4 w-28 bg-slate-200 rounded-lg animate-pulse"></div>
    <div className="h-4 w-44 bg-slate-100 rounded-lg animate-pulse"></div>
  </div>
);

/**
 * 2. Multi-column Grid Row (For inventory/item lists)
 */
export const SkeletonUsageRow = () => (
  <div className="grid sm:grid-cols-5 grid-cols-1 gap-4 items-center py-3 border-b border-slate-100">
    <div className="h-4 w-24 bg-slate-200 rounded-lg animate-pulse"></div>
    <div className="h-4 w-16 bg-slate-100 rounded-lg animate-pulse"></div>
    <div className="h-4 w-28 bg-slate-100 rounded-lg animate-pulse"></div>
    <div className="h-4 w-36 bg-slate-100 rounded-lg animate-pulse"></div>
    <div className="h-4 w-16 bg-slate-100 rounded-lg animate-pulse"></div>
  </div>
);

/**
 * 3. 3-Column Grid Row
 */
export const SkeletonUsageRow3 = () => (
  <div className="grid sm:grid-cols-3 grid-cols-1 gap-4 items-center py-3 border-b border-slate-100">
    <div className="h-4 w-28 bg-slate-200 rounded-lg animate-pulse"></div>
    <div className="h-4 w-20 bg-slate-100 rounded-lg animate-pulse"></div>
    <div className="h-4 w-32 bg-slate-100 rounded-lg animate-pulse"></div>
  </div>
);

/**
 * 4. Professional Table Row (Matches your TanStack/Shadcn tables)
 */
export const SkeletonTableRow = ({ columns = 4 }) => (
  <TableRow className="hover:bg-transparent">
    {Array.from({ length: columns }).map((_, index) => (
      <TableCell key={`skeleton-cell-${index}`} className="py-4">
        <div className={`h-5 bg-slate-200/80 rounded-lg animate-pulse ${index === 0 ? 'w-36' : index === 1 ? 'w-48' : 'w-20'}`}></div>
      </TableCell>
    ))}
  </TableRow>
);

/**
 * 5. Summary / Totals Row
 */
export const SkeletonSummaryRow = () => (
  <div className="flex justify-between items-center py-2.5">
    <div className="h-4 w-36 bg-slate-200 rounded-lg animate-pulse"></div>
    <div className="h-5 w-28 bg-slate-100 rounded-lg animate-pulse"></div>
  </div>
);

/**
 * 6. Form Card Skeleton (For Add/Edit Pages like AddOrderForm)
 */
export const SkeletonFormCard = () => (
  <div className="p-6 border border-slate-200/70 rounded-2xl shadow-sm bg-slate-50/50 space-y-6">
    <div className="h-6 w-40 bg-slate-200 rounded-lg animate-pulse"></div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="h-3 w-20 bg-slate-200 rounded animate-pulse"></div>
          <div className="h-11 w-full bg-slate-100 rounded-xl animate-pulse"></div>
        </div>
        <div className="space-y-2">
          <div className="h-3 w-24 bg-slate-200 rounded animate-pulse"></div>
          <div className="h-11 w-full bg-slate-100 rounded-xl animate-pulse"></div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="h-3 w-20 bg-slate-200 rounded animate-pulse"></div>
          <div className="h-11 w-full bg-slate-100 rounded-xl animate-pulse"></div>
        </div>
        <div className="space-y-2">
          <div className="h-3 w-28 bg-slate-200 rounded animate-pulse"></div>
          <div className="h-11 w-full bg-slate-100 rounded-xl animate-pulse"></div>
        </div>
      </div>
    </div>
  </div>
);

/**
 * 7. Full Page Skeleton (Header + Search bar + Table)
 */
export const SkeletonPage = () => (
  <div className="w-full bg-slate-50 px-4 py-6 rounded-md space-y-6">
    {/* Search & Actions Bar */}
    <div className="flex items-center justify-between py-2">
      <div className="h-10 w-72 bg-slate-200 rounded-xl animate-pulse"></div>
      <div className="h-10 w-32 bg-slate-200 rounded-xl animate-pulse"></div>
    </div>

    {/* Table Container */}
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead><div className="h-3 w-20 bg-slate-200 rounded animate-pulse"></div></TableHead>
            <TableHead><div className="h-3 w-32 bg-slate-200 rounded animate-pulse"></div></TableHead>
            <TableHead><div className="h-3 w-24 bg-slate-200 rounded animate-pulse"></div></TableHead>
            <TableHead><div className="h-3 w-28 bg-slate-200 rounded animate-pulse"></div></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonTableRow key={`page-skeleton-${index}`} columns={4} />
          ))}
        </TableBody>
      </Table>
    </div>
  </div>
);

/**
 * 8. Polished Error State Component
 */
export function ErrorState({ errorMessage, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-rose-600 p-8 bg-slate-50/50 rounded-2xl border border-slate-200/70 my-6">
      <div className="p-4 bg-rose-50 rounded-full mb-3 shadow-inner">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-8 h-8 text-rose-600"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
          />
        </svg>
      </div>
      <p className="text-lg font-bold text-slate-800 mb-1">Error Loading Data</p>
      {errorMessage && <p className="text-sm text-slate-500 mb-6 text-center max-w-md">{errorMessage}</p>}
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
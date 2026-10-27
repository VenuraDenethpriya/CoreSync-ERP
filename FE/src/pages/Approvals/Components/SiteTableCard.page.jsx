"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PaginationComponent } from "@/components/Pagination"
import { EditTask } from "./EditTask"
import { useAuth } from "@clerk/clerk-react"

import { AnimatePresence, motion } from "framer-motion";
import { BsRecordCircle } from "react-icons/bs"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Search } from "lucide-react"
import { format } from "date-fns";
import { useNavigate } from "react-router-dom"
import { fechSitesList } from "@/api/siteApi"
import { SiteStatusChage } from "./SiteStatusChange"



export function SiteTable({ setExportData, handleSiteCards, isAnimating }) {
  const { getToken } = useAuth();

  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState("")
  const [limit, setLimit] = useState(10)
  const [offset, setOffset] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const [openRowId, setOpenRowId] = useState(null)
  const [activeDialog, setActiveDialog] = useState({ type: null, task: null });

  const [employees, setEmployees] = useState([])
  const [selectedAssignee, setSelectedAssignee] = useState("")
  const navigate = useNavigate()

  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: new Date(),
  })


  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = await getToken();

      const response = await fechSitesList(token, search, limit, offset);
      const apiData = response?.data?.site || [];

      const total = response?.data?.total_sites || 0;
      setTotal(total);

      const mappedData = apiData.map((site) => ({
        id: site.id,
        orderId: site.order_id,
        orderNo: site.order_no, 
        location: site.location,

        assignees: site.assginee && site.assginee.length > 0
          ? site.assginee.join(", ")
          : "Unassigned",

        date: site.date,
        startTime: site.start_time,
        endTime: site.end_time,

        timeFormatted: site.start_time && site.end_time
          ? `${site.start_time} - ${site.end_time}`
          : (site.start_time || "N/A"),

        status: site.status || "N/A",
        description: site.description,
        createdAt: site.created_at,
      })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setData(mappedData);
      setExportData(mappedData);
    } catch (error) {
      setIsError(true);
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [getToken, search, limit, offset, setExportData]);

  const columns = [
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => {
        const siteId = row.original.id;
        return (
          <div
            className="capitalize cursor-pointer hover:text-blue-600 transition-colors"
            onClick={() => navigate(`/approvals/sites/${siteId}`)}
          >
            {row.getValue("location")}
          </div>
        );
      },
    },
    {
      accessorKey: "assignees",
      header: "Assingees",
      cell: ({ row }) => {
        const siteId = row.original.id;
        return (
          <div
            className="capitalize cursor-pointer hover:text-blue-600 transition-colors"
            onClick={() => navigate(`/approvals/sites/${siteId}`)}
          >
            {row.getValue("assignees")}
          </div>
        );
      },
    },
    {
      accessorKey: "date",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const rawDate = row.original.date;
        const siteId = row.original.id;
        const endTime = row.original.endTime; 

        if (!rawDate) return <span className="text-gray-400">N/A</span>;

        const taskDate = new Date(rawDate);
        taskDate.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let isOverdue = false;

        if (taskDate.getTime() < today.getTime()) {
          isOverdue = true;
        } else if (taskDate.getTime() === today.getTime() && endTime) {
          const now = new Date();
          const [endHours, endMinutes] = endTime.split(":").map(Number);

          if (
            now.getHours() > endHours ||
            (now.getHours() === endHours && now.getMinutes() > endMinutes)
          ) {
            isOverdue = true;
          }
        }

        return (
          <div className="flex flex-col items-start space-y-1">
            <div
              onClick={() => navigate(`/approvals/sites/${siteId}`)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all duration-200 ${isOverdue
                  ? "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100" 
                  : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
                }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-3.5 w-3.5 ${isOverdue ? "text-red-500" : "text-gray-500"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>{taskDate.toLocaleDateString("en-GB")}</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-blue-800 bg-blue-50 border border-blue-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{row.original.timeFormatted || "N/A"}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "orderNo",
      header: "Order No",
      cell: ({ row }) => {
        const siteId = row.original.id;
        return (
          <div
            className="capitalize cursor-pointer hover:text-blue-600 transition-colors"
            onClick={() => navigate(`/approvals/sites/${siteId}`)}
          >
            {row.getValue("orderNo")}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header:<div className="pl-4">Status</div>,
      cell: ({ row }) => {
        const siteId = row.original.id;
        const status = row.original.status;
        const orderNo = row.original.orderNo;
        return (
              <SiteStatusChage status={status} siteId={siteId} orderNo={orderNo}  />
            )
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const siteId = row.original.id;
        return (
          <div
            className="capitalize cursor-pointer hover:text-blue-600 transition-colors"
            onClick={() => navigate(`/approvals/sites/${siteId}`)}
          >
            {row.getValue("description")}
          </div>
        );
      },
    },
  ];
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const [sorting, setSorting] = useState([])
  const [columnFilters, setColumnFilters] = useState([])
  const [columnVisibility, setColumnVisibility] = useState({})
  const [rowSelection, setRowSelection] = useState({})
  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  if (isLoading) {
    return (
      <div className="w-full bg-slate-50 px-4 rounded-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 py-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <Input
                placeholder="Search sites..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 w-64 bg-slate-50 border-slate-200 focus:bg-white transition-all h-10"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              onClick={handleSiteCards}
              className="p-2.5 cursor-pointer hover:bg-slate-100 rounded-full transition-all border border-slate-200 active:scale-90"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isAnimating ? "active" : "inactive"}
                  initial={{ scale: 0.8, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className={isAnimating ? "text-blue-600" : "text-slate-400"}
                >
                  <BsRecordCircle size="22px" />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
        <div className="rounded-md border overflow-visible">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading && !table.getRowModel().rows.length ? (
                Array.from({ length: limit }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    {table.getAllColumns().map((column) => (
                      <TableCell key={`skeleton-${column.id}`}>
                        <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="cursor-pointer"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between sm:space-x-2 py-4">
          <div className="text-sm text-muted-foreground mb-2 sm:mb-0">
            Total: {total} sites.
          </div>
          <div className="flex justify-center">
            <PaginationComponent total={total} limit={limit} offset={offset} setOffset={setOffset} />
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="w-full bg-slate-50 px-4 rounded-md">
        <div className="flex items-center py-4">
          <Input
            placeholder="Search sites…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isError && (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center h-full text-red-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-8 h-8 mb-2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                        />
                      </svg>
                      <p className="font-semibold mb-2">Error loading data!</p>
                      {errorMessage && <p className="text-sm text-gray-500 mb-4">{errorMessage}</p>}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between sm:space-x-2 py-4">
          <div className="text-sm text-muted-foreground mb-2 sm:mb-0">
            Total: {total} sites.
          </div>
          <div className="flex justify-center">
            <PaginationComponent total={total} limit={limit} offset={offset} setOffset={setOffset} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-slate-50 px-4 rounded-md">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 py-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <Input
              placeholder="Search sites..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-64 bg-slate-50 border-slate-200 focus:bg-white transition-all h-10"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            onClick={handleSiteCards}
            className="p-2.5 cursor-pointer hover:bg-slate-100 rounded-full transition-all border border-slate-200 active:scale-90"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isAnimating ? "active" : "inactive"}
                initial={{ scale: 0.8, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                className={isAnimating ? "text-blue-600" : "text-slate-400"}
              >
                <BsRecordCircle size="22px" />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between sm:space-x-2 py-4">
        <div className="text-sm text-muted-foreground mb-2 sm:mb-0">
          Total: {total} sites.
        </div>
        <div className="flex justify-center">
          <PaginationComponent total={total} limit={limit} offset={offset} setOffset={setOffset} />
        </div>
      </div>
    </div>
  )
}
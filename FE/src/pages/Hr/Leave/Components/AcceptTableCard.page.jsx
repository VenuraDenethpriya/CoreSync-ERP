"use client"

import React, { useEffect, useRef, useState } from "react"
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
import { useNavigate } from "react-router-dom"
import { PaginationComponent } from "@/components/Pagination"
import { useAuth } from "@clerk/clerk-react"
import { useDebounce } from "@/hooks/useDebounce"
import { fetchLeaveRequests } from "@/api/hrApi"
import { ChangeStatusDropdownMenu } from "./ChangeStatusMenu"
import { AddComment } from "./AddComment"



export function AcceptTable({ setExportData }) {
  const { getToken } = useAuth();
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 500)
  const [limit, setLimit] = useState(10)
  const [offset, setOffset] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const [openRowId, setOpenRowId] = useState(null)
  const [activeDialog, setActiveDialog] = useState({ type: null, item: null });
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pageParam = parseInt(params.get("page") || "1", 10);
    setOffset((pageParam - 1) * limit);
  }, [location.search, limit]);


  useEffect(() => {
    const handleClickOutside = (event) => {
      const isInsideDialog = event.target.closest('[role="dialog"]') ||
        event.target.closest('[data-radix-dialog-overlay]') ||
        event.target.closest('[data-radix-dialog-content]') ||
        event.target.closest('[data-radix-portal]') ||
        event.target.closest('[data-radix-alert-dialog-content]') ||
        event.target.closest('[data-radix-alert-dialog-overlay]');

      const isInsideActionMenu = event.target.closest('.action-menu-wrapper');


      if (!isInsideDialog && !isInsideActionMenu) {
        setOpenRowId(null);
      }
    }


    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside, true)
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside, true)
    }
  }, [])

  const handleInventoryUpdate = (updatedFields, id = null) => {
    const targetId = id || activeDialog.item?.id;

    if (!targetId) return;

    setData((prevData) =>
      prevData.map((item) =>
        item.id === targetId
          ? { ...item, ...updatedFields }
          : item
      )
    );
  };

  const columns = [
    {
      accessorKey: "empName",
      header: "Employee Name",
      cell: ({ row }) => {
        const { empName } = row.original
        return (
          <div className="capitalize font-medium text-slate-800">
            {empName || "-"}
          </div>
        )
      },
    },
    {
      accessorKey: "date",
      header: "Requested Dates",
      cell: ({ row }) => {
        const dates = row.getValue("date") || [];
        if (dates.length === 0) return <div>-</div>;
        
        const formattedDates = dates.map(d => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })).join(", ");
        
        return (
          <div className="flex flex-col">
            <span className="font-semibold text-slate-700">{dates.length} Day{dates.length > 1 ? 's' : ''}</span>
            <span className="text-xs text-slate-500">{formattedDates}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        return (
          <div className="capitalize pl-5 font-medium">{row.getValue("type")}</div>
        )
      },
    },
    {
      accessorKey: "reason",
      header: "Reason",
      cell: ({ row }) => {
        return (
          <div className="pl-5 text-slate-600 max-w-[200px] truncate" title={row.getValue("reason")}>
            {row.getValue("reason") || "-"}
          </div>
        )
      },
    },
    {
      accessorKey: "proof",
      header: "Proof",
      cell: ({ row }) => {
        const proofUrl = row.getValue("proof");

        if (!proofUrl || proofUrl.toLowerCase() === "none" || proofUrl.trim() === "") {
          return <div className="pl-5 text-slate-400 italic text-sm">No Document</div>;
        }

        return (
          <div className="pl-5">
            <a
              href={proofUrl}
              target="_blank"             
              rel="noopener noreferrer"  
              className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 hover:underline font-medium text-sm transition-colors"
              onClick={(e) => e.stopPropagation()} 
            >
              View File
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            </a>
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: () => <div className="pl-8">Status</div>,
      cell: ({ row }) => {
        const leave = row.original
        return (
          <ChangeStatusDropdownMenu leave={leave} />
        )
      },
    },
    {
      accessorKey: "comment",
      header: "Comment",
      cell: ({ row }) => (
        <AddComment 
          row={row} 
          getToken={getToken} 
          handleInventoryUpdate={handleInventoryUpdate} 
        />
      ),
    },
    {
      accessorKey: "acceptedBy",
      header: "Accepted By",
      cell: ({ row }) => {
        return (
          <div className="capitalize pl-5 text-slate-600">
            {row.getValue("acceptedBy") || "-"}
          </div>
        )
      },
    },
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const token = await getToken();
        const response = await fetchLeaveRequests(token, debouncedSearch, limit, offset)
        const apiData = response?.data?.leaves || []
        const total = response.data.total_leaves;
        setTotal(total)

        const mappedData = apiData
          .map((item) => ({
            id: item.id,
            empId: item.emp_id,
            empName: item.emp_name,
            type: item.type,
            date: item.date,
            reason: item.reason,
            proof: item.proof,
            status: item.status,
            comment: item.comment,
            acceptedBy: item.accepted_by,
            createdAt: item.created_at,
          }))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

        setData(mappedData)
        setExportData(mappedData)
      } catch (error) {
        setIsError(true)
        console.error("Error fetching inventory items:", error)
        setErrorMessage(error.message)
      } finally {
        setIsLoading(false)
        setIsError(false)
      }

    }

    fetchData()
  }, [getToken, debouncedSearch, limit, offset, setExportData]);

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
        <div className="flex items-center py-4">
          <Input
            placeholder="Search employees…"
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
              {isLoading && !table.getRowModel().rows.length ? (
                // Render multiple skeleton rows
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
            Total: {total} employees.
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
            placeholder="Search employees…"
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
            Total: {total} employees.
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
      <div className="flex items-center py-4">
        <Input
          placeholder="Search employees…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
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
          Total: {total} employees.
        </div>
        <div className="flex justify-center">
          <PaginationComponent total={total} limit={limit} offset={offset} setOffset={setOffset} />
        </div>
      </div>
    </div>
  )
}
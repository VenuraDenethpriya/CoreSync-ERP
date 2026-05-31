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
import { fetchInventoryItemsList } from "@/api/inventoryApi"
import { PaginationComponent } from "@/components/Pagination"
import { useAuth } from "@clerk/clerk-react"
import { useDebounce } from "@/hooks/useDebounce"
import { ChangeStatusDropdownMenu } from "./ChangeStatusMenu"



export function InterviewTrackerTable({ setExportData }) {
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
      accessorKey: "ID",
      header: "ID",
      cell: ({ row }) => {
        const { ID, id } = row.original
        return (
          <div
            className="capitalize cursor-pointer"
            onClick={() => navigate(`/hr/interviews-tracker/${id}`)}
          >
            {ID}
          </div>
        )
      },
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const { name, id } = row.original
        return (
          <div
            className="capitalize cursor-pointer"
            onClick={() => navigate(`/hr/interviews-tracker/${id}`)}
          >
            {name}
          </div>
        )
      },
    },
    {
      accessorKey: "phoneNumber",
      header: "Phone Number",
      cell: ({ row }) => {
        const { phoneNumber, id } = row.original
        return (
          <div
            className="capitalize cursor-pointer"
            onClick={() => navigate(`/hr/interviews-tracker/${id}`)}
          >
            {phoneNumber}
          </div>
        )
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => {
        const { email, id } = row.original
        return (
          <div
            className="capitalize cursor-pointer"
            onClick={() => navigate(`/hr/interviews-tracker/${id}`)}
          >
            {email}
          </div>
        )
      },
    },
    {
      accessorKey: "positionApplied",
      header: "Position Applied",
      cell: ({ row }) => {
        const { positionApplied, id } = row.original
        return (
          <div
            className="capitalize cursor-pointer"
            onClick={() => navigate(`/hr/interviews-tracker/${id}`)}
          >
            {positionApplied}
          </div>
        )
      },
    },
    {
      accessorKey: "dateOfInterview",
      header: "Date of Interview",
      cell: ({ row }) => {
        const { dateOfInterview, id } = row.original
        return (
          <div
            onClick={() => navigate(`/hr/interviews-tracker/${id}`)}
            className="capitalize pl-5" >{row.getValue("dateOfInterview")}</div>
        )
      },
    },
    {
      accessorKey: "score",
      header: "Interview Score",
      cell: ({ row }) => {
        const { score , id } = row.original
        return (
          <div
            onClick={() => navigate(`/hr/interviews-tracker/${id}`)}
            className="capitalize pl-5" >{row.getValue("score")}</div>
        )
      },
    },
    {
      accessorKey: "status",
      header: () => <div className="pl-8">Status</div>,
      cell: ({ row }) => {
        const item = row.original
        return (
          <ChangeStatusDropdownMenu
            item={item}
          />
        )
      },
    },
    {
      accessorKey: "comments",
      header: () => <div className="pl-8">Comments</div>,
      cell: ({ row }) => {
        const { comments, id } = row.original
        return (
          <div
            onClick={() => navigate(`/hr/interviews-tracker/${id}`)}
            className="capitalize pl-5" >{comments}</div>
        )
      },
    },

  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const token = await getToken();
        console.log(token)
        const response = await fetchInventoryItemsList(token, debouncedSearch, limit, offset)
        const apiData = response?.data?.items || []
        const total = response.data.total_inventory;
        setTotal(total)

        const mappedData = apiData
          .map((item) => ({
            id: item.id,
            name: item.item_name,
            dateOfApplication: item.date_of_application,
            positionApplied: item.position_applied,
            department: item.department,
            evaluationScore: item.evaluation_score,
            comments: item.comments,
            status: item.status,
            // allocated: item.allocated,
            updatedAt: item.updated_at,
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
            placeholder="Search members…"
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
            Total: {total} members.
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
            placeholder="Search members…"
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
            Total: {total} members.
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
          placeholder="Search members…"
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
          Total: {total} members.
        </div>
        <div className="flex justify-center">
          <PaginationComponent total={total} limit={limit} offset={offset} setOffset={setOffset} />
        </div>
      </div>
    </div>
  )
}
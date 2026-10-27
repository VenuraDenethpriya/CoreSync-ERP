import React, { useEffect, useState } from "react"
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
import { useNavigate, useLocation } from "react-router-dom"
import { PaginationComponent } from "@/components/Pagination"
import { useAuth } from "@clerk/clerk-react"
import { useDebounce } from "@/hooks/useDebounce"
import { fetchBirthdays } from "@/api/hrApi"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export function EmployeeBirthdayTable({ setExportData }) {
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
  const navigate = useNavigate()
  const location = useLocation()

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

  const columns = [
    {
      accessorKey: "empID",
      header: "EMP. ID",
      cell: ({ row }) => {
        const { empID, id } = row.original
        return (
          <div
            className="capitalize cursor-pointer font-medium text-slate-700"
            onClick={() => navigate(`/hr/employees/${id}`)}
          >
            {empID}
          </div>
        )
      },
    },
    {
      accessorKey: "empName",
      header: "Employee Name",
      cell: ({ row }) => {
        const { empName, id } = row.original
        return (
          <div
            className="capitalize cursor-pointer font-bold text-slate-800"
            onClick={() => navigate(`/hr/employees/${id}`)}
          >
            {empName}
          </div>
        )
      },
    },
    {
      accessorKey: "dob",
      header: "Birthday",
      cell: ({ row }) => {
        const rawDate = row.getValue("dob");
        // Format the date nicely to "October 31" instead of the raw ISO string
        const formattedDate = rawDate ? format(new Date(rawDate), "MMMM do") : "N/A";
        return (
          <div className="capitalize pl-5 text-slate-600 font-medium">
            {formattedDate}
          </div>
        )
      },
    },
    {
      accessorKey: "daysRemaining",
      header: "Days Remaining",
      cell: ({ row }) => {
        const days = row.getValue("daysRemaining");
        
        if (days === undefined || days === null) return <div className="pl-5">N/A</div>;

        let badgeClass = "";
        let label = "";

        // Dynamic Color Logic based on proximity to birthday
        if (days === 0) {
          badgeClass = "bg-emerald-100 text-emerald-800 border-emerald-200 shadow-sm";
          label = "Today! 🎉";
        } else if (days === 1) {
          badgeClass = "bg-rose-100 text-rose-800 border-rose-200 shadow-sm";
          label = "Tomorrow";
        } else if (days > 1 && days <= 7) {
          badgeClass = "bg-amber-100 text-amber-800 border-amber-200 shadow-sm";
          label = `In ${days} Days`;
        } else {
          badgeClass = "bg-slate-100 text-slate-600 border-slate-200";
          label = `${days} Days`;
        }

        return (
          <div className="pl-5">
            <span className={cn("px-3 py-1 rounded-full text-xs font-bold border", badgeClass)}>
              {label}
            </span>
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
        const response = await fetchBirthdays(token, debouncedSearch, limit, offset)
        const apiData = response?.data?.employee || []
        const total = response.data.total_employee;
        setTotal(total)

        const mappedData = apiData.map((emp) => ({
          id: emp.id,
          empID: emp.emp_id,
          empName: emp.emp_name,
          dob: emp.dob, // Fixed typo from 'bod' to 'dob' to match accessorKey
          daysRemaining: emp.days_remaining
        }))

        setData(mappedData)
        if (setExportData) {
          setExportData(mappedData)
        }
      } catch (error) {
        setIsError(true)
        console.error("Error fetching employee list:", error)
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

  // ---------------- RENDERING ----------------

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
              {Array.from({ length: limit }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  {table.getAllColumns().map((column) => (
                    <TableCell key={`skeleton-${column.id}`}>
                      <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between sm:space-x-2 py-4">
          <div className="text-sm text-muted-foreground mb-2 sm:mb-0">
            Loading birthdays...
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
            </TableBody>
          </Table>
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
      <div className="rounded-md border overflow-visible bg-white">
        <Table>
          <TableHeader className="bg-slate-50/70">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-xs font-bold text-slate-500 uppercase tracking-wider">
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
                  className="cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-slate-400">
                  No birthdays found.
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
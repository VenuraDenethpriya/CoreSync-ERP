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
import { fetchPayments } from "@/api/orderApi"
import { StatusChange } from "./StatusChange"



export function PaymentsTable({ setExportData }) {
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState("")
  const [limit, setLimit] = useState(10)
  const [offset, setOffset] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [status, setStatus] = useState("")

  const columns = [
    {
      accessorKey: "orderNo",
      header: "Order No",
      cell: ({ row }) => (
        <div className="">{row.getValue("orderNo")}</div>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount (LKR)",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("amount")}</div>
      ),
    },
    {
      accessorKey: "mode",
      header: "Mode",
      cell: ({ row }) => (
        <div className="">{row.getValue("mode")}</div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <div className="">{row.getValue("type")}</div>
      ),
    },
    {
      accessorKey: "createdBy",
      header: "Created By",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("createdBy")}</div>
      ),
    },
    {
      accessorKey: "status",
      header: () => <div className="text-center">Status</div>,
      cell: ({ row }) => {
        const paymentId = row.original.id;
        const status = row.getValue("status");
        const orderNo = row.original.orderNo;
        const amount = row.original.amount;
        return (
          <div className="text-center">
            <StatusChange status={status} paymentId={paymentId} orderNo={orderNo} amount={amount} type="order" />
          </div>
        )
      },
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => (
        <div className="">{row.getValue("date")}</div>
      ),
    }

  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const token = await getToken();
        const response = await fetchPayments(token, search, limit, offset)
        const apiData = response?.data?.payments || []
        const total = response.data.total_payments;
        setTotal(total)

        const mappedData = apiData
          .map((payment) => ({
            id: payment.id,
            orderNo: payment.order_no,
            type: payment.payment_type,
            mode: payment.payment_mode,
            amount: payment.amount,
            status: payment.status,
            date: new Date(payment.paid_date).toLocaleString("en-GB", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
            createdBy: payment.created_by,
          }))

        setData(mappedData)
        setExportData(mappedData)
      } catch (error) {
        setIsError(true)
        setErrorMessage(error.message)
        console.error("Error fetching sales:", error)
      } finally {
        setIsLoading(false)
        setIsError(false)
      }
    }

    fetchData()
  }, [getToken, search, status, limit, offset, setExportData]);

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
        <div className="flex items-center gap-4 py-4">
          <Input
            placeholder="Search payments…"
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
            Total: {total} payments.
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
        <div className="flex items-center gap-4 py-4">
          <Input
            placeholder="Search payments…"
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
            Total: {total} payments.
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
      <div className="flex items-center gap-4 py-4">
        <Input
          placeholder="Search payments…"
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
          Total: {total} payments.
        </div>
        <div className="flex justify-center">
          <PaginationComponent total={total} limit={limit} offset={offset} setOffset={setOffset} />
        </div>
      </div>
    </div>
  )
}
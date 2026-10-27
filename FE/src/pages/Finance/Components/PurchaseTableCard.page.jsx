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
import { useAuth, useUser } from "@clerk/clerk-react"
import { MdOutlineRefresh } from "react-icons/md"
import { fechPurchaseOrdersList } from "@/api/finance"
import { StatusChange } from "./StatusChange"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Roles } from "@/const/const"



export function PurchasesTable({ setExportData }) {
  const { getToken } = useAuth();
  const { user } = useUser();
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
      accessorKey: "purchaseNo",
      header: "Purchase No",
      cell: ({ row }) => (
        <div
          onClick={() => navigate(`/finance/purchases/${row.original.id}`)}
          className="font-medium">{row.getValue("purchaseNo")}</div>
      ),
    },
    {
      accessorKey: "items",
      header: "Items",
      cell: ({ row }) => {
        const itemsText = row.getValue("items");
        return (
          <div
            onClick={() => navigate(`/finance/purchases/${row.original.id}`)}
            className="max-w-[250px] truncate" title={itemsText}>
            {itemsText}
          </div>
        )
      },
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <div
          onClick={() => navigate(`/finance/purchases/${row.original.id}`)}
          className="font-semibold text-gray-700">{row.getValue("amount")}</div>
      ),
    },
    {
      accessorKey: "status",
      header: () => (
        <div className="pl-4">Status</div>
      ),
      cell: ({ row }) => {
        const status = row.getValue("status");
        const id = row.original.id;
        const purchaseNo = row.original.purchaseNo;


         if (user?.publicMetadata?.role === Roles.SUPER_ADMIN || user?.publicMetadata?.role === Roles.FINANCE_HEAD) {
          return (
            <StatusChange status={status} orderId={id} purchaseNo={purchaseNo} type="status" />
          );
        }

        return (
          <Button variant="ghost" className="pointer-events-none">
            {status === "Pending" ? (
              <Badge className="bg-amber-500 rounded-full w-24 justify-center">
                {status}
              </Badge>
            ) : status === "Confirmed" ? (
              <Badge className="bg-blue-600 rounded-full w-24 justify-center">
                {status}
              </Badge>
            ) : status === "Rejected" ? (
              <Badge className="bg-red-500 rounded-full w-24 justify-center">
                {status}
              </Badge>
            ) : (
              <Badge className="bg-gray-500 rounded-full w-24 justify-center">
                {status || "Unknown"}
              </Badge>
            )}
          </Button>
        )
      }
    },
    {
      accessorKey: "moneyTransaction",
      header: () => (
        <div className="pl-4">Payment</div>
      ),
      cell: ({ row }) => {
        const isPaid = row.getValue("moneyTransaction");
        const paymentStatus = isPaid ? "Done" : "Pending";

        const id = row.original.id;
        const purchaseNo = row.original.purchaseNo;


        if (user?.publicMetadata?.role === Roles.SUPER_ADMIN || user?.publicMetadata?.role === Roles.FINANCE_HEAD) {
          return (
            <StatusChange
              payment={paymentStatus}
              orderId={id}
              purchaseNo={purchaseNo}
              type="payment"
            />
          );
        }

        return (
          <Button variant="ghost" className="pointer-events-none">
            {paymentStatus === "Done" ? (
              <Badge className="bg-green-500 rounded-full w-24 justify-center">
                Done
              </Badge>
            ) : (
              <Badge className="bg-amber-500 rounded-full w-24 justify-center">
                Pending
              </Badge>
            )}
          </Button>
        );
      }
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => (
        <div onClick={() => navigate(`/finance/purchases/${row.original.id}`)}
          className="text-gray-500">{row.getValue("date")}</div>
      ),
    }
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const token = await getToken();
        const response = await fechPurchaseOrdersList(token, search, limit, offset)

        const apiData = response?.data?.purchase_orders || []
        const totalCount = response?.data?.total_purchase_orders || 0;
        setTotal(totalCount)

        const mappedData = apiData
          .map((purchase) => {
            const totalAmount = purchase.items?.reduce((sum, item) => {
              return sum + (item.qty * (item.estimated_cost || 0));
            }, 0) || 0;


            const itemsString = purchase.items?.map(item => `${item.item_name} (x${item.qty})`).join(", ") || "No items";

            return {
              id: purchase.id,
              purchaseNo: purchase.purchase_no,
              items: itemsString,
              amount: new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(totalAmount),
              requestedBy: purchase.requested_by,
              status: purchase.status || "Pending",
              moneyTransaction: purchase.money_transaction,
              date: new Date(purchase.date).toLocaleDateString("en-GB", {
                year: "numeric",
                month: "short",
                day: "2-digit",
              }),
              rawDate: purchase.date,
            };
          })
          .sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate))

        setData(mappedData)
        setExportData(mappedData)
      } catch (error) {
        setIsError(true)
        setErrorMessage(error.message)
        console.error("Error fetching purchases:", error)
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
            placeholder="Search sales…"
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
            Total: {total} purchase orders.
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
            placeholder="Search purchase orders…"
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
            Total: {total} purchase orders.
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
          placeholder="Search purchase orders…"
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
          Total: {total} purchase orders.
        </div>
        <div className="flex justify-center">
          <PaginationComponent total={total} limit={limit} offset={offset} setOffset={setOffset} />
        </div>
      </div>
    </div>
  )
}
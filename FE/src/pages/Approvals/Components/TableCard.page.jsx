"use client"

import React, { useEffect, useState } from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useNavigate } from "react-router-dom"
import { featchAllOrders, featchDraftOrders } from "@/api/orderApi"
import { Badge } from "@/components/ui/badge"
import { PaginationComponent } from "@/components/Pagination"
import { useAuth, useUser } from "@clerk/clerk-react"
import { ChangeOrderStatusDropdownMenu } from "@/components/ChangeOrderStatusMenu"

export function OrderTable({ setExportData }) {
  const { getToken } = useAuth();

  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState("")
  const [limit, setLimit] = useState(10)
  const [offset, setOffset] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const { user } = useUser();

  useEffect(() => {
        const params = new URLSearchParams(location.search);
        const pageParam = parseInt(params.get("page") || "1", 10);
        setOffset((pageParam - 1) * limit);
      }, [location.search, limit]);
      
  let approvals = "approvals" ;

  const navigate = useNavigate()

  const columns = [
    {
      accessorKey: "orderNo",
      header: "Order ID.",
      cell: ({ row }) => {
        const { type, orderNo, orderId } = row.original
        return (
          <div
            className="capitalize cursor-pointer"
            onClick={() => navigate(`/approvals/${orderId}`)}
          >
            {type}{orderNo}
          </div>
        )
      },
    },
    {
      accessorKey: "customerName",
      header: "Customer Name",
      cell: ({ row }) => (
        <div
          className="capitalize"
          onClick={() => navigate(`/approvals/${row.original.orderId}`)}
        >
          {row.getValue("customerName")}
        </div>
      ),
    },
    {
      accessorKey: "price",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const basePrice = parseFloat(row.getValue("price"));
        const vatEnabled = row.original.vat

        const finalPrice = vatEnabled
          ? basePrice + basePrice * 0.18
          : basePrice;

        const formatted = new Intl.NumberFormat("en-LK", {
          style: "currency",
          currency: "LKR",
        }).format(finalPrice);

        return (
          <div
            className="text-left w-full"
            onClick={() => navigate(`/approvals/${row.original.orderId}`)}
          >
            {formatted}
          </div>
        );
      },
    }
    ,
    {
      accessorKey: "orderStatus",
      header: () => (
        <div className="pl-4">Order Status</div>
      ),
      cell: ({ row }) => {
        const orderStatus = row.getValue("orderStatus")
        const paymentStatus = row.getValue("paymentStatus")
        const orderId = row.original.orderId
        const orderNo = row.original.orderNo
        return (
          <ChangeOrderStatusDropdownMenu status={orderStatus} orderId={orderId} orderNo={orderNo} paymentStatus={paymentStatus} type={approvals} />
        )
      }
    },

    {
      accessorKey: "expected_delivery_date",
      header: "Expected Delivery Date",
      cell: ({ row }) => {
        const rawDate = row.getValue("expected_delivery_date")
        if (!rawDate) return null

        const date = new Date(rawDate)
        // Format as "DD MMM YYYY", e.g. "20 May 2025"
        const formattedDate = date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })

        return <div
          className="capitalize"
          onClick={() => navigate(`/approvals/${row.original.orderId}`)}
        >
          {formattedDate}
        </div>
      },

    },
    {
      accessorKey: "paymentStatus",
      header: () => (
        <div className="pl-2">Payment Status</div>
      ),
      cell: ({ row }) => {
        const paymentStatus = row.getValue("paymentStatus")
        return (
          paymentStatus === "Awaiting" ? (
            <Button variant="ghost"><Badge className="bg-red-600 rounded-full w-20 justify-center hover:bg-red-800">{paymentStatus}</Badge></Button>
          ) : paymentStatus === "Paid" ? (
            <Button variant="ghost"><Badge className="bg-green-600 rounded-full hover:bg-green-800 w-20 justify-center">{paymentStatus}</Badge></Button>
          ) : paymentStatus === "Advanced" ? (
            <Button variant="ghost"><Badge className="bg-blue-600 rounded-full hover:bg-blue-800 w-20 justify-center">{paymentStatus}</Badge></Button>
          ) : null

        )
      }
    },
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const token = await getToken();

        let searchValue = search;
        if (searchValue.startsWith("INV/EHP/")) {
          searchValue = searchValue.replace("INV/EHP/", "");
        }
      
        const response = await featchDraftOrders(token, searchValue, limit, offset);
        const apiData = response?.data.orders || [];
        const total = response.data.total_orders;
        setTotal(total)

        const mappedData = apiData
          .map((order) => ({
            orderId: order.id,
            orderNo: order.order_no,
            type: order.type,
            customerName: order.first_name + " " + order.last_name,
            price: order.total_price,
            vat: order.vat,
            orderStatus: order.order_status,
            paymentStatus: order.payment_status,
            expected_delivery_date: order.ExpectedDeliveryDate,
            created_at: order.created_at,
            updated_at: order.updated_at,

          }))
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        setData(mappedData);
        setExportData(mappedData);
      } catch (error) {
        setIsError(true)
        console.error("Error fetching orders:", error);
        setErrorMessage(error.message)
      } finally {
        setIsLoading(false)
        setIsError(false)
      }
    };
    fetchData();
  }, [search, limit, offset, setExportData]);

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
            placeholder="Search items…"
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
            Total: {total} items.
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
            placeholder="Search items…"
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
            Total: {total} items.
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
          placeholder="Search orders…"
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
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
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
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between sm:space-x-2 py-4">
        <div className="text-sm text-muted-foreground mb-2 sm:mb-0">
          Total: {total} items.
        </div>
        <div className="flex justify-center">
          <PaginationComponent total={total} limit={limit} offset={offset} setOffset={setOffset} />
        </div>
      </div>
    </div>
  )
}

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
import { ArrowUpDown, ExternalLink, SquareArrowOutUpRight } from "lucide-react"
import { BsRecordCircle } from "react-icons/bs";

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useNavigate } from "react-router-dom"
import { featchAllOrders } from "@/api/orderApi"
import { Badge } from "@/components/ui/badge"
import { PaginationComponent } from "@/components/Pagination"
import { useAuth, useUser } from "@clerk/clerk-react"
import { Roles } from "@/const/const"
import { ChangeOrderStatusDropdownMenu } from "@/components/ChangeOrderStatusMenu"
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MdOutlineRefresh } from "react-icons/md";
import { ChangePaymentStatusDropdownMenu } from "@/components/ChangePaymentStatusMenu";
import { useDebounce } from "@/hooks/useDebounce";
import { ChevronDown, ChevronUp, Filter } from "lucide-react"

export function OrderTable({ setExportData }) {
  const { getToken } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)

  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 500)
  const [vat, setVat] = useState("")
  const [orderStatus, setOrderStatus] = useState("")
  const [paymentStatus, setPaymentStatus] = useState("")


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
            onClick={() => navigate(`/orders/${orderId}`)}
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
          onClick={() => navigate(`/orders/${row.original.orderId}`)}
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
            onClick={() => navigate(`/orders/${row.original.orderId}`)}
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
          <ChangeOrderStatusDropdownMenu status={orderStatus} orderId={orderId} orderNo={orderNo} paymentStatus={paymentStatus} />
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
          onClick={() => navigate(`/orders/${row.original.orderId}`)}
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
        // const orderStatus = row.getValue("orderStatus")
        const paymentStatus = row.getValue("paymentStatus")
        // const orderId = row.original.orderId
        // const orderNo = row.original.orderNo
        return (
          paymentStatus === "Awaiting" ? (
            <Button variant="ghost"><Badge className="bg-red-600 rounded-full w-20 justify-center hover:bg-red-800">{paymentStatus}</Badge></Button>
          ) : paymentStatus === "Paid" ? (
            <Button variant="ghost"><Badge className="bg-green-600 rounded-full hover:bg-green-800 w-20 justify-center">{paymentStatus}</Badge></Button>
          ) : paymentStatus === "Advanced" ? (
            <Button variant="ghost"><Badge className="bg-blue-600 rounded-full hover:bg-blue-800 w-20 justify-center">{paymentStatus}</Badge></Button>
          ) : paymentStatus === "Refund" ? (
            <Button variant="ghost"><Badge className="bg-slate-600 rounded-full hover:bg-slate-800 w-20 justify-center">{paymentStatus}</Badge></Button>
          ) : paymentStatus === "Credit Note" ? (
            <Button variant="ghost"><Badge className="bg-slate-400 rounded-full hover:bg-slate-500 w-20 justify-center">{paymentStatus}</Badge></Button>
          ) : null
          // <ChangePaymentStatusDropdownMenu status={paymentStatus} orderStatus={orderStatus} orderId={orderId} orderNo={orderNo} />
        )
      }
    },
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const token = await getToken();

        // Remove the "INV/EHP/" part if it exists
        let searchValue = debouncedSearch;
        if (searchValue.startsWith("INV/EHP/")) {
          searchValue = searchValue.replace("INV/EHP/", "");
        }

        const response = await featchAllOrders(token, searchValue, vat, orderStatus, paymentStatus, limit, offset);
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
          .sort((a, b) => new Date(b.expected_delivery_date) - new Date(a.expected_delivery_date));

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
  }, [debouncedSearch, limit, offset, vat, orderStatus, paymentStatus, setExportData]);

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

  const handleClearFilters = () => {
    setSearch("")
    setVat("")
    setOrderStatus("")
    setPaymentStatus("")
  };

  const FilterControls = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {/* <Input
        type="text"
        placeholder="Order no, Customer name…"
        onChange={(e) => setSearch(e.target.value)}
        value={search}
      /> */}

      <Select onValueChange={setVat} value={vat}>
        <SelectTrigger>
          <SelectValue placeholder="VAT status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="True">VAT</SelectItem>
          <SelectItem value="False">Non VAT</SelectItem>
        </SelectContent>
      </Select>

      <Select onValueChange={setOrderStatus} value={orderStatus}>
        <SelectTrigger>
          <SelectValue placeholder="Order status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Drafted">Drafted</SelectItem>
          <SelectItem value="Cancelled">Cancelled</SelectItem>
          <SelectItem value="Pending">Pending</SelectItem>
          <SelectItem value="Hold">Hold</SelectItem>
          <SelectItem value="In Progress">In Progress</SelectItem>
          <SelectItem value="Completed">Completed</SelectItem>
          <SelectItem value="Delivered">Delivered</SelectItem>
        </SelectContent>
      </Select>

      <Select onValueChange={setPaymentStatus} value={paymentStatus}>
        <SelectTrigger>
          <SelectValue placeholder="Payment status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Awaiting">Awaiting</SelectItem>
          <SelectItem value="Advanced">Advanced</SelectItem>
          <SelectItem value="Paid">Paid</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  if (isLoading) {
    return (
      <div className="w-full bg-slate-50 px-4 rounded-md">
        {
          isMobile ? <div className="flex items-center py-4">
            <Input
              placeholder="Order no, Customer name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div> : (<div className="flex items-center py-2 justify-between">
            <div className="px-6 py-3 bg-white rounded-xl shadow-sm border border-gray-200 w-full">
              <div className="flex justify-between items-center mb-4">
                <Label htmlFor="filter-reports-label" className="text-sm font-medium text-gray-700">Filter Orders</Label>
                <Button
                  type="button"
                  onClick={handleClearFilters}
                  variant="outline"
                  className="text-sm font-medium text-blue-700 bg-blue-100 rounded-full hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-fit"
                >
                  <MdOutlineRefresh className="text-lg" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

                <Input
                  type="text"
                  placeholder="Order no, Customer name…"
                  onChange={(e) => setSearch(e.target.value)}
                  value={search}
                />

                <Select onValueChange={setVat} value={vat}>
                  <SelectTrigger>
                    <SelectValue placeholder="VAT status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="True">VAT</SelectItem>
                    <SelectItem value="False">Non VAT</SelectItem>
                  </SelectContent>
                </Select>

                <Select onValueChange={setOrderStatus} value={orderStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Order status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Drafted">Drafted</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Hold">Hold</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>

                <Select onValueChange={setPaymentStatus} value={paymentStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Payment status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Awaiting">Awaiting</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>)
        }

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
      {
        isMobile ?
          // <div className="flex items-center py-4">
          //   <Input
          //     placeholder="Search orders…"
          //     value={search}
          //     onChange={(e) => setSearch(e.target.value)}
          //     className="max-w-sm"
          //   />
          // </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 max-w-screen">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Order no, Customer name…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsFilterVisible(!isFilterVisible)}
                className={isFilterVisible ? "bg-blue-50 border-blue-200" : ""}
              >
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleClearFilters}>
                <MdOutlineRefresh className="text-xl" />
              </Button>
            </div>

            {/* Mobile Expandable Filters */}
            {isFilterVisible && (
              <div className="mt-4 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2">
                <FilterControls />
              </div>
            )}
          </div>
          : <div className="flex items-center py-2 justify-between">
            <div className="px-6 py-3 bg-white rounded-xl shadow-sm border border-gray-200 w-full">
              <div className="flex justify-between items-center mb-4">
                <Label htmlFor="filter-reports-label" className="text-sm font-medium text-gray-700">Filter Orders</Label>
                <Button
                  type="button"
                  onClick={handleClearFilters}
                  variant="outline"
                  className="text-sm font-medium text-blue-700 bg-blue-100 rounded-full hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-fit"
                >
                  <MdOutlineRefresh className="text-lg" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <Input
                  type="text"
                  placeholder="Order no, Customer name…"
                  onChange={(e) => setSearch(e.target.value)}
                  value={search}
                />

                <Select onValueChange={setVat} value={vat}>
                  <SelectTrigger>
                    <SelectValue placeholder="VAT status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="True">VAT</SelectItem>
                    <SelectItem value="False">Non VAT</SelectItem>
                  </SelectContent>
                </Select>

                <Select onValueChange={setOrderStatus} value={orderStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Order status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Drafted">Drafted</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Hold">Hold</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>

                <Select onValueChange={setPaymentStatus} value={paymentStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Payment status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Awaiting">Awaiting</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
      }
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

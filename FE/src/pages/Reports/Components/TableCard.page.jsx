import React, { useEffect, useState, useMemo } from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, CalendarIcon, ChevronDown, Download } from "lucide-react"
import { MdOutlineRefresh } from "react-icons/md"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { PaginationComponent } from "@/components/Pagination"

import { useNavigate, useLocation } from "react-router-dom"
import { useAuth, useUser } from "@clerk/clerk-react"
import { ChangeOrderStatusDropdownMenu } from "@/components/ChangeOrderStatusMenu"
import { useDebounce } from "@/hooks/useDebounce"
import { fetchReportData } from "@/api/reportApi"

export function ReportTable({ setExportData }) {
  const { getToken } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [type, setType] = useState("order"); // Matches the lowercase SelectItem value
  const [orderStatus, setOrderStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");

  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // FIX 1: Set default date range at the TOP LEVEL of the component
  const [dateRange, setDateRange] = useState(() => {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - 30); // Default to the last 30 days
    return { from, to };
  });

  const [rowSelection, setRowSelection] = useState({});

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pageParam = parseInt(params.get("page") || "1", 10);
    setOffset((pageParam - 1) * limit);
  }, [location.search, limit]);

  // --- 1. SELECTION COLUMN DEFINITION ---
  const selectionColumn = {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  };

  const columns = useMemo(() => {
    const formatDate = (rawDate) => {
      if (!rawDate) return null;
      return new Date(rawDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    };

    const formatPrice = (basePrice, vatEnabled = false) => {
      const price = parseFloat(basePrice) || 0;
      const finalPrice = vatEnabled ? price + price * 0.18 : price;
      return new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(finalPrice);
    };

    let cols = [];

    switch (type) {
      case "inventory":
        cols = [
          { accessorKey: "item_code", header: "Item Code" },
          { accessorKey: "item_name", header: "Item Name" },
          { accessorKey: "quantity", header: "Quantity" },
          { accessorKey: "hold", header: "Hold" },
          { accessorKey: "threshold", header: "Threshold" },
          { accessorKey: "status", header: "Status" },
          { accessorKey: "created_by", header: "Created By" },
          { accessorKey: "created_at", header: "Created At", cell: ({ row }) => formatDate(row.getValue("created_at")) },
        ];
        break;
      case "product":
        cols = [
          { accessorKey: "product_name", header: "Product Name" },
          // Note: If Category is an object in Go, you may need a cell renderer here: cell: ({row}) => row.getValue("category")?.Name
          { accessorKey: "category", header: "Category" },
          { accessorKey: "price", header: "Price", cell: ({ row }) => formatPrice(row.getValue("price")) },
          { accessorKey: "type", header: "Type" },
          { accessorKey: "active", header: "Active", cell: ({ row }) => row.getValue("active") ? "Yes" : "No" },
          { accessorKey: "created_by", header: "Created By" },
          { accessorKey: "created_at", header: "Created At", cell: ({ row }) => formatDate(row.getValue("created_at")) },
        ];
        break;
      case "quote":
        cols = [
          { accessorKey: "quote_no", header: "Quote No" },
          { accessorKey: "customer", header: "Customer Name" },
          { accessorKey: "price", header: "Price", cell: ({ row }) => formatPrice(row.getValue("price")) },
          { accessorKey: "status", header: "Status" },
          { accessorKey: "created_by", header: "Created By" },
          { accessorKey: "created_at", header: "Created At", cell: ({ row }) => formatDate(row.getValue("created_at")) },
        ];
        break;
      case "sale":
        cols = [
          { accessorKey: "sale_no", header: "Sale No" },
          { accessorKey: "type", header: "Type" },
          { accessorKey: "salesperson", header: "Salesperson" },
          { accessorKey: "customer", header: "Customer Name" },
          { accessorKey: "commission", header: "Commission", cell: ({ row }) => formatPrice(row.getValue("commission")) },
          { accessorKey: "created_by", header: "Created By" },
          { accessorKey: "created_at", header: "Created At", cell: ({ row }) => formatDate(row.getValue("created_at")) },
        ];
        break;
      case "repair":
        cols = [
          { accessorKey: "repair_no", header: "Job No" },
          { accessorKey: "customer", header: "Customer Name" },
          { accessorKey: "price", header: "Price", cell: ({ row }) => formatPrice(row.getValue("price")) },
          { accessorKey: "status", header: "Status" },
          { accessorKey: "due_date", header: "Due Date", cell: ({ row }) => formatDate(row.getValue("due_date")) },
          { accessorKey: "created_by", header: "Created By" },
          { accessorKey: "created_at", header: "Created At", cell: ({ row }) => formatDate(row.getValue("created_at")) },
        ];
        break;
      case "order":
      default:
        cols = [
          {
            accessorKey: "order_no",
            header: "Order No.",
            // Go backend already concatenates Type + "-" + OrderNo, so we just display it. Use row.original.id for routing.
            cell: ({ row }) => <div className="capitalize cursor-pointer text-blue-600 font-medium" onClick={() => navigate(`/orders/${row.original.id}`)}>{row.getValue("order_no")}</div>,
          },
          {
            accessorKey: "customer",
            header: "Customer Name",
            cell: ({ row }) => <div className="capitalize">{row.getValue("customer")}</div>,
          },
          {
            accessorKey: "price",
            header: "Price",
            cell: ({ row }) => <div className="text-left">{formatPrice(row.getValue("price"))}</div>,
          },
          {
            accessorKey: "order_status",
            header: "Order Status",
            cell: ({ row }) => (
              <ChangeOrderStatusDropdownMenu
                status={row.getValue("order_status")}
                orderId={row.original.id} // Updated to use 'id'
                orderNo={row.getValue("order_no")}
                paymentStatus={row.getValue("payment_status")}
              />
            ),
          },
          {
            accessorKey: "payment_status",
            header: "Payment Status",
            cell: ({ row }) => {
              const status = row.getValue("payment_status");
              const bgColors = { "Awaiting": "bg-red-600", "Paid": "bg-green-600", "Advanced": "bg-blue-600" };
              return status ? <Badge className={`${bgColors[status] || 'bg-slate-500'} rounded-full`}>{status}</Badge> : null;
            },
          },
          {
            accessorKey: "expected_delivery",
            header: "Expected Delivery",
            cell: ({ row }) => formatDate(row.getValue("expected_delivery")),
          }
        ];
        break;
    }

    return [selectionColumn, ...cols];
  }, [type, navigate]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
      pagination: {
        pageIndex: offset / limit, 
        pageSize: limit,
      },
    },
  });

  const pageSummary = useMemo(() => {
    let amount = 0;
    const isMonetary = type !== "inventory";

    data.forEach(item => {
      if (isMonetary) {
        // Sales report returns "commission" instead of "price"
        amount += parseFloat(item.price || item.commission || 0);
      } else {
        // Inventory uses "quantity"
        amount += parseInt(item.quantity || 0);
      }
    });

    return {
      amount: isMonetary
        ? new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(amount)
        : amount,
      label: isMonetary ? "Total Value (This Page)" : "Total Quantity (This Page)"
    };
  }, [data, type]);

  const dataSummary = useMemo(() => {
    let amount = 0;
    const isMonetary = type !== "inventory";

    // Check if user selected specific rows
    const hasSelection = Object.keys(rowSelection).length > 0;

    // If selected, only calculate selected rows. Otherwise, calculate ALL fetched data.
    const targetData = hasSelection
      ? table.getFilteredSelectedRowModel().rows.map(r => r.original)
      : data;

    targetData.forEach(item => {
      if (isMonetary) {
        amount += parseFloat(item.price || item.commission || 0);
      } else {
        amount += parseInt(item.quantity || 0);
      }
    });

    return {
      amount: isMonetary
        ? new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(amount)
        : amount,
      label: hasSelection
        ? (isMonetary ? "Total Value (Selected)" : "Total Quantity (Selected)")
        : (isMonetary ? "Total Value (All Results)" : "Total Quantity (All Results)")
    };
  }, [data, type, rowSelection, table]);


  useEffect(() => {
    const fetchData = async () => {
      // Return early if we don't have BOTH dates
      if (!dateRange || !dateRange.from || !dateRange.to) return;

      try {
        setIsLoading(true);
        const token = await getToken();

        const formatDateForApi = (dateObj) => {
          if (!dateObj) return "";
          const year = dateObj.getFullYear();
          const month = String(dateObj.getMonth() + 1).padStart(2, '0');
          const day = String(dateObj.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };

        const startDateStr = formatDateForApi(dateRange.from);
        const endDateStr = formatDateForApi(dateRange.to);

        const response = await fetchReportData(token, type, startDateStr, endDateStr);

        if (response && response.code === "0") {
          const apiData = response.data || [];
          setData(apiData);
          if (setExportData) setExportData(apiData);
          setTotal(apiData.length);
          setIsError(false);
        } else {
          throw new Error(response?.message || "Failed to load data");
        }

      } catch (error) {
        setIsError(true);
        console.error("Error fetching reports:", error);
        setErrorMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [type, dateRange, setExportData]);



  const handleExportCSV = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const targetData = selectedRows.length > 0 ? selectedRows.map(r => r.original) : data;

    if (targetData.length === 0) return alert("No data to export");

    const exportColumns = columns.filter(c => c.accessorKey);
    const headers = exportColumns.map(c => typeof c.header === 'string' ? c.header : c.accessorKey).join(",");

    const csvRows = targetData.map(row =>
      exportColumns.map(col => `"${row[col.accessorKey] || ''}"`).join(",")
    );

    const csvData = [headers, ...csvRows].join("\n");
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${type}_Report.csv`;
    link.click();
  };

  const handleClearFilters = () => {
    setSearch("");
    setType("order");
    setOrderStatus("");
    setPaymentStatus("");
    setRowSelection({});

    // Reset dates to last 30 days
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - 30);
    setDateRange({ from, to });
  };

  return (
    <div className="w-full space-y-4">
      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-white border rounded-xl shadow-sm flex flex-col justify-center">
          <p className="text-sm text-gray-500 font-medium">Total Search Results</p>
          <h3 className="text-2xl font-bold text-gray-900">{total} Items</h3>
        </div>
        <div className="p-4 bg-white border rounded-xl shadow-sm flex flex-col justify-center">
          {/* Use the new dynamic label and amount */}
          <p className="text-sm text-gray-500 font-medium">{dataSummary.label}</p>
          <h3 className="text-2xl font-bold text-gray-900">{dataSummary.amount}</h3>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="px-6 py-4 bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <Label className="text-lg font-semibold text-gray-800">Filter Reports</Label>
          <div className="flex gap-2">
            <Button onClick={handleExportCSV} variant="default" className="gap-2">
              <Download className="w-4 h-4" />
              {/* Change "Export Page Data" to "Export All Data" */}
              {Object.keys(rowSelection).length > 0 ? `Export Selected (${Object.keys(rowSelection).length})` : "Export All Data"}
            </Button>
            <Button onClick={handleClearFilters} variant="outline" className="text-blue-700 bg-blue-50">
              <MdOutlineRefresh className="text-lg" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <Select onValueChange={setType} value={type}>
            <SelectTrigger>
              <SelectValue placeholder="Report type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inventory">Inventory</SelectItem>
              <SelectItem value="product">Product</SelectItem>
              <SelectItem value="quote">Quote</SelectItem>
              <SelectItem value="order">Order</SelectItem>
              <SelectItem value="sale">Sale</SelectItem>
              <SelectItem value="repair">Repair</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[260px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from && dateRange?.to
                  ? `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`
                  : "Pick a date range"}
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={(range) => {
                  setDateRange(range);
                  // FIX 2: Removed the undefined handleFetchRangeData call
                }}
                numberOfMonths={2}
                classNames={{
                  head_cell: "w-8 font-normal text-[0.8rem]",
                  cell: "h-8 w-8 text-center p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                  day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100",
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Generate skeleton rows based on the page limit
              Array.from({ length: limit }).map((_, rowIndex) => (
                <TableRow key={`skeleton-row-${rowIndex}`}>
                  {columns.map((_, colIndex) => (
                    <TableCell key={`skeleton-cell-${rowIndex}-${colIndex}`}>
                      <div className="h-6 w-full bg-slate-200 rounded-md animate-pulse"></div>
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-gray-500">
                  {isError ? errorMessage : "No data found for this date range."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* PAGINATION */}
      <div className="flex flex-col sm:flex-row items-center py-4 gap-4">
        <div className="text-sm text-muted-foreground flex-1 text-center sm:text-left">
          {Object.keys(rowSelection).length} of {table.getRowModel().rows.length} row(s) selected on this page.
        </div>
        <div className="flex justify-end w-full sm:w-auto">
          <PaginationComponent total={total} limit={limit} offset={offset} setOffset={setOffset} />
        </div>
      </div>
    </div>
  )
}
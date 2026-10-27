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
import { fethchSalespersonNames } from "@/api/salespersonApi"
import { Input } from "@/components/ui/input"
import { Roles } from "@/const/const"

export function ReportTable({ setExportData }) {
  const { getToken } = useAuth();
  const { user } = useUser();
  const location = useLocation();
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [type, setType] = useState("order");
  const [orderStatus, setOrderStatus] = useState("");


  const [paymentStatus, setPaymentStatus] = useState("");
  const [vat, setVat] = useState("")
  const [PaymentMode, setPaymentMode] = useState("")
  const [selectedSalesperson, setSelectedSalesperson] = useState("");



  const [salespersons, setSalespersons] = useState([]);

  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");


  const [dateRange, setDateRange] = useState(() => {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - 30);
    return { from, to };
  });

  const [rowSelection, setRowSelection] = useState({});

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pageParam = parseInt(params.get("page") || "1", 10);
    setOffset((pageParam - 1) * limit);
  }, [location.search, limit]);

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

    // Helper to format the payment modes array
    const formatPaymentModes = (modes) => {
      if (Array.isArray(modes) && modes.length > 0) {
        return modes.join(", ");
      }
      return "N/A";
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
          { accessorKey: "status", header: "Status" },
          {
            accessorKey: "vat_status",
            header: "Vat Status",
            cell: ({ row }) => row.getValue("vat_status") ? "VAT" : "Non VAT"
          },
          { accessorKey: "payment_status", header: "Payment Status" },
          {
            accessorKey: "payment_mode",
            header: "Payment Mode",
            cell: ({ row }) => formatPaymentModes(row.getValue("payment_mode"))
          },
          { accessorKey: "created_by", header: "Created By" },
          { accessorKey: "created_at", header: "Created At", cell: ({ row }) => formatDate(row.getValue("created_at")) },
        ];
        break;
      case "payment":
        cols = [
          { accessorKey: "order_no", header: "Order No" },
          { accessorKey: "payment_mode", header: "Type" },
          { accessorKey: "salesperson", header: "Salesperson" },
          { accessorKey: "customer", header: "Customer Name" },
          { accessorKey: "price", header: "Amount", cell: ({ row }) => formatPrice(row.getValue("price")) },
          {
            accessorKey: "vat_status",
            header: "Vat Status",
            cell: ({ row }) => row.getValue("vat_status") ? "VAT" : "Non VAT"
          },
          { accessorKey: "created_at", header: "Date", cell: ({ row }) => formatDate(row.getValue("created_at")) },
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
            cell: ({ row }) => <div className="capitalize cursor-pointer text-blue-600 font-medium" onClick={() => navigate(`/orders/${row.original.id}`)}>{row.getValue("order_no")}</div>,
          },
          {
            accessorKey: "salesperson",
            header: "Salesperson",
            cell: ({ row }) => <div className="capitalize">{row.getValue("salesperson")}</div>,
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
                orderId={row.original.id}
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
            accessorKey: "vat_status",
            header: "Vat Status",
            cell: ({ row }) => (
              <span className={`font-medium ${row.getValue("vat_status") ? "text-blue-600" : "text-gray-600"}`}>
                {row.getValue("vat_status") ? "VAT" : "Non VAT"}
              </span>
            ),
          },
          {
            accessorKey: "payment_mode",
            header: "Payment Mode",
            cell: ({ row }) => formatPaymentModes(row.getValue("payment_mode")),
          },
          {
            accessorKey: "created_at",
            header: "Created Date",
            cell: ({ row }) => formatDate(row.getValue("created_at")),
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

  useEffect(() => {
    const loadSalespersons = async () => {
      try {
        const token = await getToken();
        const response = await fethchSalespersonNames(token);
        const salespersonsList = response.data.salespersons;

        const formattedList = salespersonsList.map(item => ({
          id: item.id,
          name: item.salesperson
        }));

        setSalespersons(formattedList);
      } catch (err) {
        console.error("Error fetching salespersons:", err);
      }
    };

    loadSalespersons();
  }, []);

  const pageSummary = useMemo(() => {
    let amount = 0;
    const isMonetary = type !== "inventory";

    data.forEach(item => {
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
      label: isMonetary ? "Total Value (This Page)" : "Total Quantity (This Page)"
    };
  }, [data, type]);

  const dataSummary = useMemo(() => {
    let amount = 0;
    const isMonetary = type !== "inventory";

    const hasSelection = Object.keys(rowSelection).length > 0;

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

        const response = await fetchReportData(
          token,
          type,
          startDateStr,
          endDateStr,
          vat,
          orderStatus,
          PaymentMode,
          paymentStatus,
          selectedSalesperson
        );

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
  }, [type, dateRange, vat, orderStatus, PaymentMode, paymentStatus, selectedSalesperson, setExportData]);



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
    setVat("");
    setSelectedSalesperson("");
    setPaymentMode("");
    setPaymentStatus("");
    setRowSelection({});
    setVat("")

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
          <p className="text-sm text-gray-500 font-medium">{dataSummary.label}</p>
          <h3 className="text-2xl font-bold text-gray-900">{dataSummary.amount}</h3>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="px-6 py-4 bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <Label className="text-lg font-semibold text-gray-800">Filter Reports</Label>
          <div className="flex gap-2">
            {
              user.publicMetadata.role == Roles.READ_ONLY ? null : <Button onClick={handleExportCSV} variant="default" className="gap-2">
              <Download className="w-4 h-4" />
              {Object.keys(rowSelection).length > 0 ? `Export Selected (${Object.keys(rowSelection).length})` : "Export All Data"}
            </Button>
            }
            
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
              <SelectItem value="payment">Payment</SelectItem>
              <SelectItem value="sale">Sale</SelectItem>
              <SelectItem value="repair">Repair</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[315px] justify-start text-left font-normal">
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

          <Select onValueChange={setOrderStatus} value={orderStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Order status" />
            </SelectTrigger>
            <SelectContent>
              <StatusOption value="Drafted" label="Drafted" description="Initial status, order is still being created." />
              <StatusOption value="Cancelled" label="Cancelled" description="The order has been voided." />
              <StatusOption value="Pending" label="Pending" description="Awaiting verification." />
              <StatusOption value="Hold" label="Hold" description="Order paused for internal review." />
              <StatusOption value="In Progress" label="In Progress" description="Currently being processed." />
              <StatusOption value="Completed" label="Completed" description="Job is finished and ready." />
              <StatusOption value="Delivered" label="Delivered" description="Handed over to the customer." />
            </SelectContent>
          </Select>

          <Select onValueChange={setVat} value={vat}>
            <SelectTrigger>
              <SelectValue placeholder="VAT status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="True">VAT</SelectItem>
              <SelectItem value="False">Non VAT</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={setSelectedSalesperson} value={selectedSalesperson}>
            <SelectTrigger>
              <SelectValue placeholder="Salesperson" />
            </SelectTrigger>
            <SelectContent>
              {salespersons.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={setPaymentMode} value={PaymentMode}>
            <SelectTrigger>
              <SelectValue placeholder="Payment Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Cash">Cash</SelectItem>
              <SelectItem value="Card">Card</SelectItem>
              <SelectItem value="Cheque">Cheque</SelectItem>
              <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={setPaymentStatus} value={paymentStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Payment Status" />
            </SelectTrigger>
            <SelectContent>
              <StatusOption value="Awaiting" label="Awaiting" description="Payment has not yet been received." />
              <StatusOption value="Paid" label="Paid" description="Full payment received." />
              <StatusOption value="Advanced" label="Advanced" description="Partial payment or deposit received." />
            </SelectContent>
          </Select>


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

const StatusOption = ({ value, label, description }) => (
  <SelectItem value={value}>
    <div className="flex flex-col">
      <span>{label}</span>
      <span className="text-xs text-muted-foreground">{description}</span>
    </div>
  </SelectItem>
);
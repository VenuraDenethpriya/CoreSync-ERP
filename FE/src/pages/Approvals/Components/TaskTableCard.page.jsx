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
import ActionMenu from "./ActionMenu"
import { TaskDeleteAlert } from "./DeleteAlert"
import { fetchTaskDetails, fethchTasksList } from "@/api/taskApi"
import { ChangeTaskDropdownMenu } from "./TaskStatusMenu"
import { AnimatePresence, motion } from "framer-motion";
import { BsRecordCircle } from "react-icons/bs"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, CalendarIcon, ChevronDown, Download, FileSpreadsheet, FileText, Search } from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import * as XLSX from "xlsx"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { fetchUsersList } from "@/api/userApi"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns";



export function TaskTable({ setExportData, handleTaskCards, isAnimating }) {
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
  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: new Date(),
  })
  const [taskDetails, setTaskDetails] = useState(null)

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

  const handleTaskStatusUpdate = (newStatus, taskId) => {
    setData((prevData) =>
      prevData.map((task) =>
        task.id === taskId
          ? { ...task, status: newStatus }
          : task
      )
    );
  };

  const handleTaskUpdate = (updatedTask) => {
    setData((prevData) =>
      prevData.map((task) =>
        task.id === updatedTask.id
          ? { ...task, ...updatedTask }
          : task
      )
    );
  };

  const handleTaskDelete = (taskId) => {
    setData((prevData) => prevData.filter((task) => task.id !== taskId));
    setTotal((prevTotal) => prevTotal - 1);
    setActiveDialog({ type: null, task: null });
  };

  useEffect(() => {
    const getStaff = async () => {
      try {
        const token = await getToken()
        const res = await fetchUsersList(token, "WAREHOUSE_STAFF", 100, 0)
        setEmployees(res?.data?.items || [])
      } catch (err) {
        console.error("Failed to fetch staff:", err)
      }
    }
    getStaff()
  }, [getToken])

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = await getToken();

      const start = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : "";
      const end = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : "";

      const response = await fetchTaskDetails(
        token,
        selectedAssignee,
        start,
        end
      );

      const apiData = response?.data || [];

      setTotal(apiData.length);

      const mappedData = apiData.map((task) => ({
        id: task.id,
        task: task.task,
        assignee: task.assignee,
        date: task.date,
        time: task.time,
        orderNO: task.order_no,
        JobNo: task.job_no,
        orderID: task.order_id,
        JobID: task.job_id,
        status: task.status,
        description: task.description,
        createdAt: task.created_at,
      })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setData(mappedData);
      setExportData(mappedData);
    } catch (error) {
      setIsError(true);
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [getToken, selectedAssignee, dateRange, setExportData]);

  const columns = [
    {
      accessorKey: "task",
      header: "Task",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("task")}</div>
      ),
    },
    {
      accessorKey: "assignee",
      header: "Assignee",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("assignee")}</div>
      ),
    },
    {
      accessorKey: "date",
      // header: "Deadline",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Deadline
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const rawDate = row.original.date;
        if (!rawDate) return <span>N/A</span>;
        const taskDate = new Date(row.original.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const isOverdue = taskDate < today;

        return (
          <>
            <div className="flex flex-col items-start space-y-1">
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${isOverdue
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-gray-50 text-gray-700 border border-gray-200"
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
                <span>{row.original.time}</span>
              </div>
            </div>
          </>

        );
      },
    },
    {
      accessorKey: "orderNO",
      header: "Order/Job NO",
      cell: ({ row }) => {
        return (
          <div className="capitalize" >{row.getValue("orderNO")}</div>
        )
      },
    },
    {
      accessorKey: "status",
      header: () => (
        <div className="pl-10">Status</div>
      ),
      cell: ({ row }) => {
        const status = row.getValue("status")
        const taskId = row.original.id
        return (
          <ChangeTaskDropdownMenu status={status} taskId={taskId} onUpdate={(newStatus) => handleTaskStatusUpdate(newStatus, taskId)} />
        )
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        return (
          <div className="capitalize" >{row.getValue("description")}</div>
        )
      },
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const rowId = row.id
        const isOpen = openRowId === rowId

        const handleToggleMenu = (e) => {
          e.stopPropagation();

          if (isOpen) {
            setOpenRowId(null);
          } else {
            setOpenRowId(rowId);
          }
        };

        const handleMenuClose = () => {
          setOpenRowId(null);
        };


        const handleOpenSpecificDialog = (type, task) => {
          setActiveDialog({ type, task });
          handleMenuClose();
        };

        return (
          <div className="relative">
            <button
              onClick={handleToggleMenu}
              className="cursor-pointer font-bold text-lg hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="button"
              aria-label="Open actions menu"
            >
              ⋯
            </button>
            {isOpen && (
              <div
                className="action-menu-wrapper absolute right-full left-[-200px] top-0 mt-1"
                style={{
                  zIndex: 9998,
                  position: 'absolute'
                }}
              >
                <ActionMenu
                  user={row.original}
                  onClose={handleMenuClose}
                  onOpenDialog={handleOpenSpecificDialog}
                  className=""
                />
              </div>
            )}
          </div>
        )
      },
    }
  ]

  const fetchTaskData = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = await getToken();

      const response = await fethchTasksList(token, search, limit, offset);

      const apiData = response?.data?.task || [];
      setTotal(response?.data?.total_tasks || 0);


      const mappedData = apiData.map((task) => {
        return {
          id: task.id,
          task: task.task,
          assignee: task.assignee,
          date: task.date,
          time: task.time,
          orderNO: task.order_no || task.job_no,
          orderID: task.order_id,
          JobID: task.job_id,
          status: task.status,
          description: task.description,
          createdAt: task.created_at,
        };
      }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setData(mappedData);
    } catch (error) {
      setIsError(true);
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [getToken, search, limit, offset]);

  useEffect(() => {
    fetchTaskData();
    fetchData();
  }, [fetchTaskData, fetchData]);

  const handleDownloadPDF = async () => {
    try {
      const token = await getToken();
      const start = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : "";
      const end = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : "";

      const res = await fetchTaskDetails(token, selectedAssignee, start, end);
      const reportData = res?.data || [];

      if (reportData.length === 0) {
        alert("No data found for the selected filters.");
        return;
      }

      const selectedEmployee = employees.find(emp => emp.clerk_id === selectedAssignee);
      const displayName = selectedEmployee
        ? `${selectedEmployee.first_name} ${selectedEmployee.last_name}`
        : "All_Assignees";

      const doc = new jsPDF();
      const tableColumn = ["Task", "Assignee", "Deadline", "Order No", "Status", "Description", "Created At"];
      const tableRows = reportData.map(item => [
        item.task,
        item.assignee,
        new Date(item.date).toLocaleDateString("en-GB"),
        item.order_no,
        item.status,
        item.description,
        format(new Date(item.created_at), "dd/MM/yyyy HH:mm")
      ]);

      doc.setFontSize(18);
      doc.text(`Task Report: ${displayName.replace('_', ' ')}`, 14, 15);
      doc.setFontSize(11);
      doc.text(`Period: ${start} to ${end}`, 14, 22);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 30,
        theme: 'striped',
        headStyles: { fillHex: '#2563eb' }
      });

      doc.save(`Tasks_Report_${displayName}_${start}_to_${end}.pdf`);
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      setIsLoading(true);
      const token = await getToken();

      const start = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : "";
      const end = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : "";

      const res = await fetchTaskDetails(token, selectedAssignee, start, end);
      const reportData = res?.data || [];

      if (reportData.length === 0) {
        alert("No data found for the selected filters.");
        return;
      }

      const selectedEmployee = employees.find(emp => emp.clerk_id === selectedAssignee);
      const displayName = selectedEmployee
        ? `${selectedEmployee.first_name}_${selectedEmployee.last_name}`
        : "All_Assignees";

      const exportData = reportData.map(item => ({
        "Task": item.task,
        "Assignee": item.assignee,
        "Deadline": new Date(item.date).toLocaleDateString("en-GB"),
        "Order Number": item.order_no,
        "Status": item.status,
        "Description": item.description,
        "Created At": format(new Date(item.created_at), "dd/MM/yyyy HH:mm")
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);

      XLSX.utils.sheet_add_aoa(worksheet, [[`Task Report: ${displayName.replace('_', ' ')} (Period: ${start} to ${end})`]], { origin: "A1" });

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Tasks Report");


      const fileName = `Tasks_Report_${displayName}_${start}_to_${end}.xlsx`;
      XLSX.writeFile(workbook, fileName);

    } catch (error) {
      console.error("Excel Export failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm my-4">
          <div className="flex flex-wrap items-center justify-between gap-4">

            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  placeholder="Search tasks..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 w-64 bg-slate-50 border-slate-200 focus:bg-white transition-all h-10"
                />
              </div>

              {/* Shadcn Select for Staff */}
              <Select onValueChange={setSelectedAssignee} value={selectedAssignee}>
                <SelectTrigger className="w-[200px] bg-slate-50 border-slate-200 h-10">
                  <SelectValue placeholder="All Assignees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assignees</SelectItem>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={`${emp.first_name} ${emp.last_name}`}>
                      {emp.first_name} {emp.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Shadcn Range Picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[280px] justify-start text-left font-normal bg-slate-50 border-slate-200 h-10">
                    <CalendarIcon className="mr-2 h-4 w-4 text-slate-500" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <span className="text-slate-700">{format(dateRange.from, "dd/MM/yyyy")} - {format(dateRange.to, "dd/MM/yyyy")}</span>
                      ) : (format(dateRange.from, "dd/MM/yyyy"))
                    ) : (<span className="text-slate-400">Pick a date range</span>)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 shadow-2xl border-slate-200" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
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

            {/* Export & View Toggles */}
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 h-10 px-5 shadow-lg shadow-blue-100">
                    <Download className="h-4 w-4" /> Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Choose Format</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDownloadPDF} className="gap-2 text-red-600 cursor-pointer">
                    <FileText className="h-4 w-4" /> PDF Report
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDownloadExcel} className="gap-2 text-green-700 cursor-pointer">
                    <FileSpreadsheet className="h-4 w-4" /> Excel Sheet
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div
                onClick={handleTaskCards}
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
            placeholder="Search tasks…"
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
            Total: {total} tasks.
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
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm my-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <Input
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 w-64 bg-slate-50 border-slate-200 focus:bg-white transition-all h-10"
              />
            </div>

            <Select onValueChange={setSelectedAssignee} value={selectedAssignee}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Assignees" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignees</SelectItem>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.clerk_id}>
                    {emp.first_name} {emp.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[280px] justify-start text-left font-normal bg-slate-50 border-slate-200 h-10">
                  <CalendarIcon className="mr-2 h-4 w-4 text-slate-500" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <span className="text-slate-700">{format(dateRange.from, "dd/MM/yyyy")} - {format(dateRange.to, "dd/MM/yyyy")}</span>
                    ) : (format(dateRange.from, "dd/MM/yyyy"))
                  ) : (<span className="text-slate-400">Pick a date range</span>)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 shadow-2xl border-slate-200" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  classNames={{
                    head_cell: "w-8 font-normal text-[0.8rem]",
                    cell: "h-8 w-8 text-center p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                    day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100",
                  }}
                />
              </PopoverContent>
            </Popover>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 h-10 px-5 shadow-lg shadow-blue-100">
                  <Download className="h-4 w-4" /> Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Choose Format</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDownloadPDF} className="gap-2 text-red-600 cursor-pointer">
                  <FileText className="h-4 w-4" /> PDF Report
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadExcel} className="gap-2 text-green-700 cursor-pointer">
                  <FileSpreadsheet className="h-4 w-4" /> Excel Sheet
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-3">
            <div
              onClick={handleTaskCards}
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
          Total: {total} tasks.
        </div>
        <div className="flex justify-center">
          <PaginationComponent total={total} limit={limit} offset={offset} setOffset={setOffset} />
        </div>
      </div>

      {activeDialog.type === 'edit' && (
        <EditTask
          Data={activeDialog.task}
          open={true}
          onOpenChange={(open) => {
            if (!open) setActiveDialog({ type: null, task: null });
          }}
          onUpdate={handleTaskUpdate}
        />
      )}

      {activeDialog.type === 'delete' && (
        <TaskDeleteAlert
          Data={activeDialog.task}
          open={true}
          onOpenChange={(open) => {
            if (!open) setActiveDialog({ type: null, task: null });
          }}
          onDeleteSuccess={handleTaskDelete}
        />
      )}
    </div>
  )
}
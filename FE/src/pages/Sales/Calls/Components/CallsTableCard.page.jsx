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
import { PaginationComponent } from "@/components/Pagination"
import { useAuth } from "@clerk/clerk-react"
import ActionMenu from "./ActionMenu"
import { AddtToSale } from "./AddToSale"
import AudioPlayer from "./AudioPlayer"
import { Badge } from "@/components/ui/badge"
import { fetchCallsList } from "@/api/callApi"
import { fethchSalespersonNames } from "@/api/salespersonApi"



export function CallsTable({ setExportData }) {
  const { getToken } = useAuth();

  const [data, setData] = useState([])
  const [total, setTotal] = useState()
  const [search, setSearch] = useState("")
  const [limit, setLimit] = useState(10)
  const [offset, setOffset] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [status, setStatus] = useState("Active");

  const [openRowId, setOpenRowId] = useState(null)
  const [activeDialog, setActiveDialog] = useState({ type: null, call: null });

  const [salespersonsList, setSalespersonsList] = useState([]);


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

  const handleOpenDialog = (type, call) => {
    setOpenRowId(null);
    setActiveDialog({ type, call });
  };


  const columns = [
    {
      accessorKey: "agentName",
      header: "Salesperson",
      cell: ({ row }) => {
        const agentCli = row.getValue("agentName");

        const matchedSalesperson = salespersonsList.find(
          (person) => {
            if (!person.phone_no || !agentCli) return false;

            const dbPhone = String(person.phone_no).slice(-9);
            const callPhone = String(agentCli).slice(-9);

            return dbPhone === callPhone;
          }
        );

        return (
          <div className="">
            {matchedSalesperson ? matchedSalesperson.name : agentCli}
          </div>
        );
      },
    },
    {
      accessorKey: "customerPhoneNo",
      header: "Customer Phone No.",
      cell: ({ row }) => (
        <div className="">{row.getValue("customerPhoneNo")}</div>
      ),
    },

    {
      accessorKey: "callStatus",
      header: () => <div className="text-center w-full">Call Status</div>,
      cell: ({ row }) => {
        const callStatus = row.getValue("callStatus")

        const statusColors = {
          "FAILED": "bg-red-600 hover:bg-red-800",
          "SUCCESS": "bg-green-600 hover:bg-green-800",
          "Advanced": "bg-blue-600 hover:bg-blue-800",
          "Refund": "bg-slate-600 hover:bg-slate-800",
          "Credit Note": "bg-slate-400 hover:bg-slate-500",
        }

        const color = statusColors[callStatus]

        return (
          <div className="flex justify-center w-full">
            <Badge className={`${color} rounded-full w-20 justify-center`}>
              {callStatus}
            </Badge>
          </div>
        )
      },
    }
    ,
    {
      accessorKey: "callDuration",
      header: "Call Duration",
      cell: ({ row }) => {
        return (
          <div>{row.getValue("callDuration")}</div>
        )
      },
    },
    {
      accessorKey: "recording",
      header: () => <div className="text-center w-full">Recording</div>,
      cell: ({ row }) => {
        const url = row.getValue("recording");
        if (!url) return <div className="text-center w-full">No recording</div>;

        return (
          <div className="flex justify-center w-full">
            <AudioPlayer url={url} />
          </div>
        );
      },
    }
    ,

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
                  call={row.original}
                  onClose={handleMenuClose}
                  onOpenDialog={handleOpenDialog}
                  className=""
                />
              </div>
            )}
          </div>
        )
      },
    }
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const token = await getToken();
        const response = await fetchCallsList(token, search, limit, offset)
        const apiData = response?.data?.calls || []
        const total = response.data.totalCalls;
        setTotal(total)

        const calculateDuration = (startTime, endTime) => {
          if (!startTime || !endTime) return "0s";

          const start = new Date(startTime);
          const end = new Date(endTime);

          const diffInSeconds = Math.floor((end - start) / 1000);

          if (isNaN(diffInSeconds)) return "0s";
          const minutes = Math.floor(diffInSeconds / 60);
          const seconds = diffInSeconds % 60;

          return `${minutes}m ${seconds}s`;
        };

        const mappedData = apiData
          .map((call) => ({
            id: call.id,
            // agentName: call.salesperson,
            agentName: call.agentCli,
            // customerName: call.customer_name,
            customerPhoneNo: call.customerCli,
            callStatus: call.status,
            callDuration: calculateDuration(call.callStartTime, call.callEndTime),
            recording: call.recordingUrl,
            updatedAt: call.createdAt,
          }))
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))

        setData(mappedData)
        setExportData(mappedData)
      } catch (error) {
        setIsError(true)
        setErrorMessage(error.message)
        console.error("Error fetching calls:", error)
      } finally {
        setIsLoading(false)
        setIsError(false)
      }
    }

    fetchData()
  }, [getToken, search, limit, offset, setExportData]);

  useEffect(() => {
    const loadSalespersons = async () => {
      try {
        const token = await getToken();
        const response = await fethchSalespersonNames(token, status);
        const salespersonsList = response.data.salespersons;

        const formattedList = salespersonsList.map(item => ({
          id: item.id,
          name: item.salesperson,
          phone_no: item.phone_no
        }));

        setSalespersonsList(formattedList);
      } catch (err) {
        console.error("Error fetching salespersons:", err);
      }
    };

    loadSalespersons();
  }, []);

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
            placeholder="Search calls..."
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
            placeholder="Search calls..."
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
            Total: {total} calls.
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
          placeholder="Search calls…"
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
          Total: {total} calls.
        </div>
        <div className="flex justify-center">
          <PaginationComponent total={total} limit={limit} offset={offset} setOffset={setOffset} />
        </div>
      </div>

      {activeDialog.type === "addToSale" && (
        <AddtToSale
          saleData={activeDialog.call}
          open={true}
          setOpen={() => setActiveDialog({ type: null, call: null })}
        />
      )}
    </div>
  )
}
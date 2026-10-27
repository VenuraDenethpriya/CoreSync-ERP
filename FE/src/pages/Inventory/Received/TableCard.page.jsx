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
import { fetchInventoryItemsList, fetchInventoryOrdersList, fetchInventoryReceivedOrdersList } from "@/api/inventoryApi"
// import ActionMenu from "./ActionMenu"
import { PaginationComponent } from "@/components/Pagination"
import { useAuth } from "@clerk/clerk-react"
import { useDebounce } from "@/hooks/useDebounce"
import { ChangeOrderStatusDropdownMenu } from "./Components/ChangeStatusMenu"
import ActionMenu from "./Components/ActionMenu"
import { RestockDialog } from "./Components/RestockPopOver"
// import { DeleteAlert } from "./DeleteAlert"
// import { EditItemOrder } from "./EditItemOrder"



export function InventoryOrderReceivedTable({ setExportData }) {
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

  const handleDeleteItem = (deletedId) => {

    setData((prevData) => {
      return prevData.filter((item) => String(item.id) !== String(deletedId));
    });
    setTotal((prevTotal) => prevTotal - 1);
  };

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
      accessorKey: "orderNo",
      header: "Order No",
      cell: ({ row }) => {
        const { orderNo, id } = row.original
        return (
          <div
            className="capitalize cursor-pointer"
          >
            {orderNo}
          </div>
        )
      },
    },
    {
      accessorKey: "itemCode",
      header: "Item Code",
      cell: ({ row }) => {
        const { itemCode, id } = row.original
        return (
          <div
            className="capitalize cursor-pointer"
          >
            {itemCode}
          </div>
        )
      },
    },
    {
      accessorKey: "itemName",
      header: "Item Name",
      cell: ({ row }) => {
        const { itemName, id } = row.original
        return (
          <div
            className="capitalize cursor-pointer"
          >
            {itemName}
          </div>
        )
      },
    },
    {
      accessorKey: "quantity",
      header: "Order Quantity",
      cell: ({ row }) => {
        const { quantity, threshold, id } = row.original
        return (
          <div>
            {quantity}
          </div>
        )
      },
    },
    {
      accessorKey: "amount",
      header: "Order Amount(LKR)",
      cell: ({ row }) => {
        const { amount, id } = row.original
        return (
          <div
            className="capitalize pl-5" >{row.getValue("amount")}</div>
        )
      },
    },
    {
      accessorKey: "orderDate",
      header: "Order Date",
      cell: ({ row }) => {
        const { orderDate, id } = row.original
        return (
          <div
            className="capitalize pl-5" >{row.getValue("orderDate")}</div>
        )
      },
    },
    {
      accessorKey: "acualQuantity",
      header: "Received Quantity",
      cell: ({ row }) => {
        const { acualQuantity, id } = row.original
        return (
          <div>
            {acualQuantity}
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: () => <div className="pl-8">Status</div>,
      cell: ({ row }) => {
        const item = row.original
        return (
          <ChangeOrderStatusDropdownMenu
            item={item}
          />
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


        const handleOpenSpecificDialog = (type, item) => {
          setActiveDialog({ type, item });
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
                  item={row.original}
                  onClose={handleMenuClose}
                  onOpenDialog={handleOpenSpecificDialog}
                  onUpdate={(fields) => handleInventoryUpdate(fields, row.original.id)}
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
        const response = await fetchInventoryReceivedOrdersList(token, debouncedSearch, limit, offset)
        const apiData = response?.data?.orders || []
        const total = response.data.total_inventory_orders;
        setTotal(total)

        const mappedData = apiData
          .map((item) => ({
            id: item.id,
            orderNo: item.order_no,
            itemCode: item.item_code,
            itemName: item.item_name,
            quantity: item.order_quantity,
            acualQuantity: item.quantity,
            amount: item.amount,
            status: item.status,
            orderDate: new Date(item.order_date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric"
            }),

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
      <div className="flex items-center py-4">
        <Input
          placeholder="Search items…"
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
          Total: {total} items.
        </div>
        <div className="flex justify-center">
          <PaginationComponent total={total} limit={limit} offset={offset} setOffset={setOffset} />
        </div>
      </div>

      {activeDialog.type === 'restock' && (
        <RestockDialog
          item={activeDialog.item}
          open={true}
          onOpenChange={(open) => {
            if (!open) setActiveDialog({ type: null, item: null });
          }}
          onUpdate={handleInventoryUpdate}
        />
      )}


    </div>
  )
}
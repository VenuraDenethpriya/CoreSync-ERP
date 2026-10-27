"use client"

import React, { useEffect, useState, useRef } from "react"
import { flushSync } from "react-dom"
import { useReactToPrint } from "react-to-print"
import Barcode from "react-barcode"
import { Printer } from "lucide-react"
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
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { PaginationComponent } from "@/components/Pagination"
import { useAuth } from "@clerk/clerk-react"
import { fetchWireHarnessList } from "@/api/productionApi"

export function WireHarnessTable({ setExportData }) {
  const { getToken } = useAuth();
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState("")
  const [limit, setLimit] = useState(10)
  const [offset, setOffset] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  // Print state and configuration
  const componentRef = useRef(null);
  const [printableItems, setPrintableItems] = useState([]);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: "Barcode Labels",
    removeAfterPrint: true,
    pageStyle: `
      @page { 
          size: 50mm 25mm; 
          margin: 0mm !important; 
      }
      
      html, body { 
          margin: 0 !important; 
          padding: 0 !important; 
          width: 50mm; 
          height: 25mm;
      }
      
      .print-wrapper { 
          width: 100%; 
          display: block; 
      }
      
      .barcode-label {
          width: 50mm; 
          height: 25mm; 
          transform: translateX(2mm); 
          margin: 0;
          padding: 1mm;
          box-sizing: border-box;
          page-break-after: always;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: center; 
          align-items: center;
          text-align: center;
      }
      
      .barcode-label:last-child { page-break-after: auto; }
      
      .company-logo {
          height: 4.5mm;
          max-width: 45mm;
          width: auto;
          object-fit: contain; 
          margin-bottom: 2px;
          display: block;
      }
      
      .barcode-container {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
      }

      .item-code { 
          font-size: 9px; 
          font-weight: 700; 
          margin-top: 1px; 
          width: 100%; 
          text-align: center; 
      }
      
      svg { 
          display: block !important;
          width: 100% !important;
          margin: 0 auto !important;
          max-width: 45mm !important; 
          height: auto !important;
          max-height: 14mm !important; 
      }
    `
  });

  const triggerBarcodePrint = (item) => {
    if (!item || !item.item_code) return;
    flushSync(() => { 
      setPrintableItems([item]); 
    });
    setTimeout(() => { 
      handlePrint(); 
    }, 50);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pageParam = parseInt(params.get("page") || "1", 10);
    setOffset((pageParam - 1) * limit);
  }, [location.search, limit]);

  const navigate = useNavigate()

  const columns = [
    {
      accessorKey: "serialNo",
      header: "Serial No",
      cell: ({ row }) => (
        <div className="capitalize">
          {row.getValue("serialNo")}
        </div>
      ),
    },
    {
      accessorKey: "productName",
      header: "Product Name",
      cell: ({ row }) => (
        <div
          className="capitalize font-semibold cursor-pointer hover:underline"
          onClick={() => navigate(`/products/${row.original.productId}`)}
        >
          {row.getValue("productName")}
        </div>
      ),
    },
    {
      accessorKey: "note",
      header: "Note",
      cell: ({ row }) => (
        <div className="capitalize">
          {row.getValue("note")}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="text-right">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2 text-xs flex items-center gap-1 ml-auto"
              onClick={(e) => {
                e.stopPropagation();
                triggerBarcodePrint({
                  id: item.harnessId,
                  item_code: item.serialNo
                });
              }}
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </Button>
          </div>
        );
      },
    },
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token = await getToken();

        const response = await fetchWireHarnessList(token, search, limit, offset);
        const apiData = response?.data.wire_harness || [];
        const total = response.data.total_wire_harness;
        setTotal(total);

        const mappedData = apiData.map((item) => ({
          harnessId: item.id,
          productId: item.product_id,
          productName: item.product_name,
          serialNo: item.serial_no,
          note: item.note,
          createdBy: item.created_by,
          createdAt: item.created_at 
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setData(mappedData);
        setExportData(mappedData);
      } catch (error) {
        setIsError(true);
        console.error("Error fetching wire harness:", error);
        setErrorMessage(error.message);
      } finally {
        setIsLoading(false);
        setIsError(false);
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

  // Reusable hidden print container element
  const renderHiddenPrintContainer = () => (
    <div style={{ position: "absolute", top: "-10000px", left: "-10000px" }}>
      <div ref={componentRef} className="print-wrapper">
        {printableItems.map((invItem, index) => (
          <div key={`${invItem.id}-${index}`} className="barcode-label">
            <img
              src="/CoreSync-bw-long-logo.jpg"
              alt="CoreSync"
              className="company-logo"
            />
            <div className="barcode-container">
              <Barcode
                value={invItem.item_code}
                format="CODE128"
                displayValue={false}
                width={1.6}
                height={45}
                fontSize={10}
                background="transparent"
              />
            </div>
            <div className="item-code">{invItem.item_code}</div>
          </div>
        ))}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="w-full bg-slate-50 px-4 rounded-md">
        <div className="flex items-center py-4">
          <Input
            placeholder="Search wire harness…"
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
            Total: {total} wire harness.
          </div>
          <div className="flex justify-center">
            <PaginationComponent total={total} limit={limit} offset={offset} setOffset={setOffset} />
          </div>
        </div>
        {renderHiddenPrintContainer()}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="w-full bg-slate-50 px-4 rounded-md">
        <div className="flex items-center py-4">
          <Input
            placeholder="Search wire harness…"
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
                    <p className="font-semibold mb-2">Error loading data!</p>
                    {errorMessage && <p className="text-sm text-gray-500 mb-4">{errorMessage}</p>}
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between sm:space-x-2 py-4">
          <div className="text-sm text-muted-foreground mb-2 sm:mb-0">
            Total: {total} wire harness.
          </div>
          <div className="flex justify-center">
            <PaginationComponent total={total} limit={limit} offset={offset} setOffset={setOffset} />
          </div>
        </div>
        {renderHiddenPrintContainer()}
      </div>
    )
  }

  return (
    <div className="w-full bg-slate-50 px-4 rounded-md">
      <div className="flex items-center py-4">
        <Input
          placeholder="Search wire harness…"
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
          Total: {total} wire harness.
        </div>
        <div className="flex justify-center">
          <PaginationComponent total={total} limit={limit} offset={offset} setOffset={setOffset} />
        </div>
      </div>
      {renderHiddenPrintContainer()}
    </div>
  )
}
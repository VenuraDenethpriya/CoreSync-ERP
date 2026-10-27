"use client"

import React, { useEffect, useState } from "react"
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { PaginationComponent } from "@/components/Pagination"
import { useAuth, useUser } from "@clerk/clerk-react"
import { useDebounce } from "@/hooks/useDebounce"
import { toast } from "sonner"

import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, X, Download, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { fechPayrollHistoryList, fetchEmployeeList, updatePayroll, deletePayrollHistory } from "@/api/hrApi"
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const formatCurrency = (amount) => new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', minimumFractionDigits: 2 }).format(amount || 0);

const numberField = z.union([z.string(), z.number()]).transform((val) => {
  if (val === "" || val === null || val === undefined) return 0;
  return Number(val);
});

const formSchema15 = z.object({
  payrollMonth: z.string().optional(),
  payrollPeriod: z.string().optional(),
  standardWorkingDays: numberField,
  leaveEligible: numberField,
  leaveUtilized: numberField,
  leaveBalance: numberField,
  unpaidLeave: numberField,
  overtimeHours: numberField,
  overtimeMins: numberField,
  basicSalary: numberField,
  travelAllowance: numberField,
  otherAllowance: numberField,
  expenseReimbursement: numberField,
  salesCommission: numberField,
  overtimeEarnings: numberField,
  grossSalary: numberField,
  epf: numberField,
  employerEpf: numberField,
  salaryAdvances: numberField,
  leaveDeduction: numberField,
  paymentMethod: z.string().optional(),
  paymentDate: z.date().optional().nullable(),

  bankName: z.string().optional(),
  branch: z.string().optional(),
  accountNo: z.string().optional(),
  accountHolderName: z.string().optional(),
});

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function PayrollHistoryTable15({ setExportData }) {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const [searchEmp, setSearchEmp] = useState("");
  const debouncedSearchEmp = useDebounce(searchEmp, 500);

  const [salaryCycle, setSalaryCycle] = useState("15");
  const [employeeId, setEmployeeId] = useState("");
  const [month, setMonth] = useState("");

  const [employeeOptions, setEmployeeOptions] = useState([]);

  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const [selectedEmp, setSelectedEmp] = useState(null);
  const [deleteData, setDeleteData] = useState(null);

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const token = await getToken();
        const response = await fetchEmployeeList(token, debouncedSearchEmp, 50, 0);
        const apiData = response?.data?.employees || [];

        const mappedOptions = apiData.map((emp) => ({
          id: emp.id,
          name: emp.emp_name,
        }));

        setEmployeeOptions(mappedOptions);
      } catch (error) {
        console.error("Error fetching employee options:", error);
      }
    };

    loadEmployees();
  }, [getToken, debouncedSearchEmp]);

  const filteredEmployees = employeeOptions.filter(emp =>
    emp.name.toLowerCase().includes(searchEmp.toLowerCase())
  );

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const token = await getToken();
      const response = await fechPayrollHistoryList(token, debouncedSearch, limit, offset, salaryCycle, employeeId, month);

      const apiData = response?.data?.employee || [];
      const totalRows = response?.data?.total_employee || 0;

      setTotal(totalRows);

      const mappedData = apiData.map((emp) => {
        const calculatedDeductions = (emp.epf_8 || 0) + (emp.salary_advances || 0) + (emp.leave_deduction || 0) + (emp.late_attendence || 0) + (emp.water_bill || 0) + (emp.other || 0);

        return {
          id: emp.id,
          employeeID: emp.employee_id,
          empID: emp.emp_id,
          empName: emp.emp_name,
          department: emp.department || 'N/A',
          address: emp.address || 'N/A',
          phone: emp.phone || 'N/A',
          email: emp.email || 'N/A',
          hasEpf: emp.has_epf,

          payrollMonth: emp.month || '',
          payrollPeriod: emp.payroll_period || '',

          basicSalary: emp.basic_salary || 0,
          travelAllowance: emp.travel_allowance || 0,
          otherAllowance: emp.other_allowance || 0,
          expenseReimbursement: emp.expense || 0,
          salesCommission: emp.sales_commission || 0,
          overtimeEarnings: emp.overtime_earnings || 0,

          grossSalary: emp.gross_salary || 0,
          epf: emp.epf_8 || 0,
          employerEpf: emp.epf_15 || 0,
          salaryAdvances: emp.salary_advances || 0,
          leaveDeduction: emp.leave_deduction || 0,
          lateAttendance: emp.late_attendence || 0,
          otherDeduction: emp.other || 0,
          totalDeductions: calculatedDeductions,

          standardWorkingDays: emp.working_days || 0,
          leaveEligible: emp.leave_eligible || 0,
          leaveUtilized: emp.leave_utilized || 0,
          leaveBalance: emp.leave_balance || 0,
          unpaidLeave: emp.unpaid_leave || 0,
          overtimeHours: emp.overtime_hours || 0,
          overtimeMins: emp.overtime_mins || 0,

          netSalary: emp.net_salary || 0,
          paymentMethod: emp.payment_method || "",
          paymentDate: emp.payment_date && !emp.payment_date.startsWith("0001") ? emp.payment_date : null,

          bankName: emp.bank_name || '',
          branch: emp.branch || '',
          accountNo: emp.account_no || '',
          accountHolderName: emp.account_holder_name || '',
        };
      });

      setData(mappedData);
      if (setExportData) setExportData(apiData);
    } catch (error) {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [getToken, debouncedSearch, limit, offset, salaryCycle, employeeId, month, setExportData]);

  const generatePDF = (emp) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    const contentWidth = pageWidth - (margin * 2);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(30, 58, 138);
    doc.text("CoreSync Pvt Ltd", margin, 20);

    doc.setFontSize(20);
    doc.setTextColor(30, 58, 138);
    doc.text("PAYSLIP", pageWidth - margin, 20, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text("No 11, __________, Sril Lanka", margin, 26);
    doc.text("Phone: (+94) 743020154, Email: CoreSync.energy@gmail.com", margin, 31);

    const leftBlockWidth = 110;
    const rightBlockWidth = contentWidth - leftBlockWidth - 4;
    const rightBlockX = pageWidth - margin - rightBlockWidth;

    const boxW = (rightBlockWidth - 2) / 2;
    const col1X = rightBlockX;
    const col2X = rightBlockX + boxW + 2;

    doc.setFillColor(158, 179, 218);
    doc.rect(margin, 38, leftBlockWidth, 6, "F");
    doc.rect(col1X, 38, boxW, 6, "F");
    doc.rect(col2X, 38, boxW, 6, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text("EMPLOYEE INFORMATION", margin + 2, 42);
    doc.text("PAY DATE", col1X + (boxW / 2), 42, { align: "center" });
    doc.text("PAY PERIOD", col2X + (boxW / 2), 42, { align: "center" });

    doc.setFillColor(230, 235, 245);
    doc.rect(col1X, 44, boxW, 6, "F");
    doc.rect(col2X, 44, boxW, 6, "F");
    doc.setTextColor(0, 0, 0);
    const payDateStr = emp.paymentDate ? format(new Date(emp.paymentDate), "dd-MMM") : "-";
    doc.text(payDateStr, col1X + (boxW / 2), 48, { align: "center" });
    let displayPeriod = emp.payrollPeriod || "Monthly";
    if (displayPeriod !== "Monthly" && displayPeriod.includes("-")) {
      try {
        const parts = displayPeriod.split("-").map(p => p.trim());

        const formattedParts = parts.map(part => {
          const words = part.split(" ");
          if (words.length >= 2) {
            const day = words[0];
            const month = words[1].substring(0, 3);
            return `${day} ${month}`;
          }
          return part;
        });
        displayPeriod = formattedParts.join(" - ");
      } catch (error) {
        displayPeriod = emp.payrollPeriod;
      }
    }

    doc.text(displayPeriod, col2X + (boxW / 2), 48, { align: "center" });

    let rightY = 56;
    const drawRightRow = (label, value, isGray) => {
      if (isGray) {
        doc.setFillColor(242, 242, 242);
        doc.rect(rightBlockX, rightY - 4, rightBlockWidth, 6, "F");
      }
      doc.setFont("helvetica", "bold");
      doc.text(label, rightBlockX + 2, rightY);
      doc.setFont("helvetica", "bold");
      doc.text(String(value), rightBlockX + rightBlockWidth - 2, rightY, { align: "right" });
      rightY += 6;
    };

    drawRightRow("Payment Method:", emp.paymentMethod || "EFT", true);
    drawRightRow("Working Days", emp.standardWorkingDays || 0, false);
    drawRightRow("Days in Office", emp.standardWorkingDays || 0, true);
    drawRightRow("No Pay", emp.unpaidLeave || 0, false);

    rightY += 4;

    let leftY = 52;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(emp.empName || "-", margin, leftY);
    leftY += 7;
    doc.text(emp.address || "-", margin, leftY);
    leftY += 7;
    doc.text(`Phone: ${emp.phone || "-"}`, margin, leftY);
    leftY += 7;
    doc.text(`Email: ${emp.email || "-"}`, margin, leftY);

    const startY = Math.max(leftY, rightY) + 6;

    // Conditionally Render EPF rows using the spread operator
    const tableData = [
      ["EARNINGS", "LKR"],
      ["Basic Pay", formatCurrency(emp.basicSalary).replace("LKR", "").trim()],
      ["Salary Allowances", formatCurrency(emp.otherAllowance).replace("LKR", "").trim()],
      ["Transport Allowance", formatCurrency(emp.travelAllowance).replace("LKR", "").trim()],
      ["Sales Commission", formatCurrency(emp.salesCommission).replace("LKR", "").trim()],
      ...(emp.hasOvertime ? [["Over Time", formatCurrency(emp.overtimeEarnings).replace("LKR", "").trim()]] : []),
      ...(emp.hasEpf !== false ? [["EPF ETF Contributions By Company (15%)", formatCurrency(emp.employerEpf).replace("LKR", "").trim()]] : []),
      ["Reimbursement", formatCurrency(emp.expenseReimbursement).replace("LKR", "").trim()],
      [`GROSS SALARY`, formatCurrency(emp.grossSalary).replace("LKR", "").trim()],
      ["DEDUCTIONS", "LKR"],
      ["Salary Advances", formatCurrency(emp.salaryAdvances).replace("LKR", "").trim()],
      ["Leave", formatCurrency(emp.leaveDeduction).replace("LKR", "").trim()],
      ...(emp.hasEpf !== false ? [["EPF 8%", formatCurrency(emp.epf).replace("LKR", "").trim()]] : []),
      ["Other Deductions", formatCurrency(emp.otherDeduction || emp.lateAttendance || 0).replace("LKR", "").trim()],
      ["TOTAL DEDUCTIONS", formatCurrency(emp.totalDeductions).replace("LKR", "").trim()],
      [{ content: "TOTAL NET PAY", styles: { halign: 'right' } }, formatCurrency(emp.netSalary).replace("LKR", "").trim()]
    ];

    autoTable(doc, {
      startY: startY,
      margin: { left: margin, right: margin },
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 3, textColor: [0, 0, 0], lineColor: [210, 210, 210] },
      columnStyles: {
        0: { cellWidth: contentWidth - 56 },
        1: { cellWidth: 56, halign: 'right' }
      },
      didParseCell: function (data) {
        const firstColData = data.row.raw[0];
        const rowLabel = typeof firstColData === 'object' ? firstColData.content : firstColData;

        if (rowLabel === "EARNINGS" || rowLabel === "DEDUCTIONS") {
          data.cell.styles.fillColor = [217, 217, 217];
          data.cell.styles.fontStyle = 'bold';
        }
        if (rowLabel === "GROSS SALARY" || rowLabel === "TOTAL DEDUCTIONS" || rowLabel === "TOTAL NET PAY") {
          data.cell.styles.fillColor = [190, 190, 190];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    });

    const finalY = doc.lastAutoTable.finalY + 15;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(220, 38, 38);
    doc.text("*This is a system generated document. No signature is required", pageWidth / 2, finalY, { align: "center" });

    doc.save(`${emp.empName}_Payslip_${emp.payrollMonth}.pdf`);
  };

  const columns = [
    { accessorKey: "empID", header: "EMP. ID" },
    { accessorKey: "empName", header: "Employee Name", cell: ({ row }) => <span className="font-semibold text-slate-800">{row.getValue("empName")}</span> },
    { accessorKey: "payrollMonth", header: "Month", cell: ({ row }) => <span className="text-slate-600 font-medium">{row.getValue("payrollMonth")}</span> },
    { accessorKey: "basicSalary", header: "Basic Salary", cell: ({ row }) => formatCurrency(row.getValue("basicSalary")) },
    { accessorKey: "grossSalary", header: "Gross Salary", cell: ({ row }) => <span className="text-emerald-700 font-medium">{formatCurrency(row.getValue("grossSalary"))}</span> },
    { accessorKey: "totalDeductions", header: "Deductions", cell: ({ row }) => <span className="text-rose-600 font-medium">{formatCurrency(row.getValue("totalDeductions"))}</span> },
    { accessorKey: "netSalary", header: "Net Salary", cell: ({ row }) => <span className="text-blue-700 font-bold bg-blue-50 px-2.5 py-1 rounded-lg">{formatCurrency(row.getValue("netSalary"))}</span> },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              generatePDF(row.original);
            }}
            className="h-8 gap-1 text-blue-600 border-blue-200 hover:bg-blue-50 rounded-lg"
          >
            <Download className="w-3.5 h-3.5" />
            Payslip
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteData(row.original);
            }}
            className="h-8 w-8 p-0 text-rose-600 border-rose-200 hover:bg-rose-50 rounded-lg"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row items-center gap-4 py-4">
        <Input
          placeholder="Search records..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:max-w-sm bg-slate-50 border-slate-200 h-11 rounded-xl"
        />

        <Select value={employeeId || "all"} onValueChange={(val) => setEmployeeId(val === "all" ? "" : val)}>
          <SelectTrigger className="w-full md:w-[250px] bg-slate-50 border-slate-200 h-11 rounded-xl">
            <SelectValue placeholder="Select Employee" />
          </SelectTrigger>
          <SelectContent>
            <div className="p-2 sticky top-0 bg-white z-10">
              <Input
                placeholder="Search employee..."
                value={searchEmp}
                onChange={(e) => setSearchEmp(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                className="h-9 mb-1"
              />
            </div>
            <SelectItem value="all" className="font-semibold text-blue-600">All Employees</SelectItem>
            {filteredEmployees.map(emp => (
              <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={month || "all"} onValueChange={(val) => setMonth(val === "all" ? "" : val)}>
          <SelectTrigger className="w-full md:w-[180px] bg-slate-50 border-slate-200 h-11 rounded-xl">
            <SelectValue placeholder="Select Month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="font-semibold text-blue-600">All Months</SelectItem>
            {MONTHS.map(m => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(employeeId !== "" || month !== "") && (
          <Button
            variant="ghost"
            onClick={() => { setEmployeeId(""); setMonth(""); }}
            className="h-11 text-slate-500 hover:text-slate-800"
          >
            <X className="w-4 h-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/70">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">Loading...</TableCell></TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => setSelectedEmp(row.original)}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={columns.length} className="h-24 text-center text-slate-400">No records found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between py-4 gap-4">
        <div className="text-sm font-medium text-slate-500">
          Total: {total} records
        </div>
        <div className="flex justify-end">
          <PaginationComponent total={total} limit={limit} offset={offset} setOffset={setOffset} />
        </div>
      </div>

      {/* Edit Dialog */}
      {selectedEmp && (
        <EditPayroll15Dialog
          emp={selectedEmp}
          open={!!selectedEmp}
          onOpenChange={(isOpen) => !isOpen && setSelectedEmp(null)}
          getToken={getToken}
          onSuccess={fetchData}
        />
      )}

      {/* Delete Dialog */}
      {deleteData && (
        <PayrollDeleteAlert
          Data={deleteData}
          open={!!deleteData}
          onOpenChange={(isOpen) => !isOpen && setDeleteData(null)}
          getToken={getToken}
          onSuccess={fetchData}
        />
      )}
    </div>
  )
}

function EditPayroll15Dialog({ emp, open, onOpenChange, getToken, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUser();

  const currentMonthIndex = new Date().getMonth();
  const currentMonth = MONTHS[currentMonthIndex];
  const previousMonth = MONTHS[(currentMonthIndex + 11) % 12];
  const defaultPeriodStr = `16 ${previousMonth} - 15 ${currentMonth}`;

  const form = useForm({
    resolver: zodResolver(formSchema15),
    defaultValues: {
      payrollMonth: emp.payrollMonth || currentMonth,
      payrollPeriod: emp.payrollPeriod || defaultPeriodStr,

      basicSalary: emp.basicSalary || 0,
      standardWorkingDays: emp.standardWorkingDays || 0,
      leaveEligible: emp.leaveEligible || 0,
      leaveUtilized: emp.leaveUtilized || 0,
      leaveBalance: emp.leaveBalance || 0,
      unpaidLeave: emp.unpaidLeave || 0,
      overtimeHours: emp.overtimeHours || 0,
      overtimeMins: emp.overtimeMins || 0,

      travelAllowance: emp.travelAllowance || 0,
      otherAllowance: emp.otherAllowance || 0,
      expenseReimbursement: emp.expenseReimbursement || 0,
      salesCommission: emp.salesCommission || 0,
      overtimeEarnings: emp.overtimeEarnings || 0,
      grossSalary: emp.grossSalary || 0,
      epf: emp.epf || 0,
      employerEpf: emp.employerEpf || 0,
      salaryAdvances: emp.salaryAdvances || 0,
      leaveDeduction: emp.leaveDeduction || 0,
      paymentMethod: emp.paymentMethod || "",
      paymentDate: emp.paymentDate ? new Date(emp.paymentDate) : null,

      bankName: emp.bankName || '',
      branch: emp.branch || '',
      accountNo: emp.accountNo || '',
      accountHolderName: emp.accountHolderName || '',
    }
  });

  const values = form.watch();
  const selectedMonth = form.watch("payrollMonth");

  useEffect(() => {
    if (selectedMonth && selectedMonth !== emp.payrollMonth) {
      const idx = MONTHS.indexOf(selectedMonth);
      if (idx !== -1) {
        const prevIdx = (idx + 11) % 12;
        const periodStr = `16 ${MONTHS[prevIdx]} - 15 ${MONTHS[idx]}`;
        form.setValue("payrollPeriod", periodStr, { shouldValidate: true });
      }
    }
  }, [selectedMonth, emp.payrollMonth, form]);

  const basicSalaryValue = form.watch("basicSalary");
  const travelAllowanceValue = form.watch("travelAllowance");
  const otherAllowanceValue = form.watch("otherAllowance");
  const expenseReimbursementValue = form.watch("expenseReimbursement");
  const salesCommissionValue = form.watch("salesCommission");
  const overtimeEarningsValue = form.watch("overtimeEarnings");

  const leaveEligibleValue = form.watch("leaveEligible");
  const leaveUtilizedValue = form.watch("leaveUtilized");

  useEffect(() => {
    const gross =
      Number(basicSalaryValue || 0) +
      Number(travelAllowanceValue || 0) +
      Number(otherAllowanceValue || 0) +
      Number(expenseReimbursementValue || 0) +
      Number(salesCommissionValue || 0) +
      Number(overtimeEarningsValue || 0);

    form.setValue("grossSalary", Number(gross.toFixed(2)), { shouldValidate: true });
  }, [
    basicSalaryValue,
    travelAllowanceValue,
    otherAllowanceValue,
    expenseReimbursementValue,
    salesCommissionValue,
    overtimeEarningsValue,
    form
  ]);


  useEffect(() => {
    const basic = Number(basicSalaryValue || 0);
    if (emp.hasEpf !== false) {
      form.setValue("epf", basic * 0.08, { shouldValidate: true });
      form.setValue("employerEpf", basic * 0.15, { shouldValidate: true });
    } else {
      form.setValue("epf", 0, { shouldValidate: true });
      form.setValue("employerEpf", 0, { shouldValidate: true });
    }
  }, [basicSalaryValue, form, emp.hasEpf]);

  useEffect(() => {
    const eligible = Number(leaveEligibleValue || 0);
    const utilized = Number(leaveUtilizedValue || 0);
    form.setValue("leaveBalance", Math.max(0, eligible - utilized), { shouldValidate: true });
    form.setValue("unpaidLeave", Math.max(0, utilized - eligible), { shouldValidate: true });
  }, [leaveEligibleValue, leaveUtilizedValue, form]);

  const calculatedGross =
    Number(values.basicSalary || 0) +
    Number(values.travelAllowance || 0) +
    Number(values.otherAllowance || 0) +
    Number(values.expenseReimbursement || 0) +
    Number(values.salesCommission || 0) +
    Number(values.overtimeEarnings || 0);

  const calculatedDeductions =
    Number(values.epf || 0) +
    Number(values.salaryAdvances || 0) +
    Number(values.leaveDeduction || 0);

  const calculatedNet = Number(values.grossSalary || 0) - calculatedDeductions;

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const token = await getToken();

      const payload = {
        id: emp.id,
        month: data.payrollMonth,
        payroll_period: data.payrollPeriod,
        employee_id: emp.employeeID,

        working_days: Number(data.standardWorkingDays || 0),
        leave_eligible: Number(data.leaveEligible || 0),
        leave_utilized: Number(data.leaveUtilized || 0),
        leave_balance: Number(data.leaveBalance || 0),
        unpaid_leave: Number(data.unpaidLeave || 0),
        overtime_hours: Number(data.overtimeHours || 0),
        overtime_mins: Number(data.overtimeMins || 0),

        attendance_incentive: 0,
        performance_incentive: 0,
        overtime_earnings: Number(data.overtimeEarnings || 0),

        travel_allowance: Number(data.travelAllowance || 0),
        other_allowance: Number(data.otherAllowance || 0),
        sales_commission: Number(data.salesCommission || 0),
        expense: Number(data.expenseReimbursement || 0),

        gross_salary: Number(data.grossSalary || 0),

        epf_8: Number(data.epf || 0),
        epf_15: Number(data.employerEpf || 0),
        salary_advances: Number(data.salaryAdvances || 0),
        leave_deduction: Number(data.leaveDeduction || 0),
        late_attendence: 0,
        other: 0,
        water_bill: 0,

        net_salary: Number(calculatedNet || 0),

        payment_method: data.paymentMethod || "",
        payment_date: data.paymentDate ? data.paymentDate.toISOString() : null,
        created_by: user?.id
      };

      if (updatePayroll) {
        const res = await updatePayroll(token, payload);
        if (res.message == "success") {
          toast.success(`Update payroll record for ${res?.data?.empName || "employee"} successfully!`);
          onSuccess();
          onOpenChange(false);
        } else {
          toast.error(`Error updateing payroll record for ${res?.data?.empName || "employee"} successfully!`);
        }

      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update payroll record.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[750px] w-full rounded-2xl p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-start">
          <div>
            <DialogTitle className="text-xl font-extrabold text-slate-800 mb-1">Edit Payroll - 15 Cycle</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium">{emp.empName} ({emp.empID}) • {emp.department}</DialogDescription>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">

            {/* PAYROLL MONTH & PERIOD SECTION */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-2 gap-4">
              <FormField control={form.control} name="payrollMonth" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-slate-700">Payroll Month</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger className="bg-white"><SelectValue placeholder="Select month" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {MONTHS.map(month => (
                        <SelectItem key={month} value={month}>{month}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
              <FormField control={form.control} name="payrollPeriod" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-slate-700">Payroll Period</FormLabel>
                  <FormControl>
                    <Input className="bg-white text-slate-600 font-medium" {...field} />
                  </FormControl>
                </FormItem>
              )} />
            </div>

            {/* Leaves & Days Section */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-2 sm:grid-cols-5 gap-3">
              <FormField control={form.control} name="standardWorkingDays" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] uppercase font-bold text-slate-500">Work Days</FormLabel>
                  <FormControl><Input type="number" className="bg-white h-9 text-center px-1" {...field} onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))} /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="leaveEligible" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] uppercase font-bold text-slate-500">Lv Earned</FormLabel>
                  <FormControl><Input type="number" className="bg-white h-9 text-center px-1" {...field} onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))} /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="leaveUtilized" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] uppercase font-bold text-slate-500">Lv Taken</FormLabel>
                  <FormControl><Input type="number" className="bg-white h-9 text-center px-1" {...field} onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))} /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="leaveBalance" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] uppercase font-bold text-slate-500">Lv Balance</FormLabel>
                  <FormControl><Input type="number" className="bg-white h-9 text-center px-1 text-blue-600 font-bold" readOnly {...field} /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="unpaidLeave" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] uppercase font-bold text-slate-500">Unpaid Lv</FormLabel>
                  <FormControl><Input type="number" className="bg-white h-9 text-center px-1 text-rose-600 font-bold" readOnly {...field} /></FormControl>
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

              {/* Earnings Column */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-emerald-700 uppercase tracking-wider mb-2 border-b border-slate-100 pb-2">Earnings & Allowances</h4>
                <FormField control={form.control} name="basicSalary" render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel className="text-slate-600 font-semibold text-xs">Basic Salary</FormLabel>
                    <FormControl><Input type="number" className="w-32 h-9 text-right" {...field} onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="travelAllowance" render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel className="text-slate-600 font-semibold text-xs">Travel Allowance</FormLabel>
                    <FormControl><Input type="number" className="w-32 h-9 text-right" {...field} onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="otherAllowance" render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel className="text-slate-600 font-semibold text-xs">Other Allowance</FormLabel>
                    <FormControl><Input type="number" className="w-32 h-9 text-right" {...field} onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="expenseReimbursement" render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel className="text-slate-600 font-semibold text-xs">Reimbursements</FormLabel>
                    <FormControl><Input type="number" className="w-32 h-9 text-right" {...field} onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="salesCommission" render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel className="text-slate-600 font-semibold text-xs">Sales Commission</FormLabel>
                    <FormControl><Input type="number" className="w-32 h-9 text-right" {...field} onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="overtimeEarnings" render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel className="text-slate-600 font-semibold text-xs">Overtime Earnings</FormLabel>
                    <FormControl><Input type="number" className="w-32 h-9 text-right" {...field} onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))} /></FormControl>
                  </FormItem>
                )} />

                <FormField control={form.control} name="grossSalary" render={({ field }) => (
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                    <span className="text-emerald-700 font-bold text-sm">Gross Salary</span>
                    <FormControl>
                      <Input
                        type="number"
                        className="w-32 h-9 text-right font-bold text-emerald-700 bg-emerald-50/50 border-emerald-200 shadow-inner"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                      />
                    </FormControl>
                  </div>
                )} />
              </div>

              {/* Deductions Column */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-rose-700 uppercase tracking-wider mb-2 border-b border-slate-100 pb-2">Deductions</h4>

                {/* EPF Auto Calcs */}
                {emp.hasEpf !== false && (
                  <>
                    <FormField control={form.control} name="epf" render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <FormLabel className="text-slate-600 font-semibold text-xs">EPF 8% (Employee)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            className="w-32 h-9 text-right bg-slate-50 border-slate-200"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                          />
                        </FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="employerEpf" render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <FormLabel className="text-slate-500 font-semibold text-xs">EPF 15% (Employer)</FormLabel>
                        <FormControl><Input type="number" readOnly className="w-32 h-9 text-right bg-slate-100 border-slate-200 text-slate-500 shadow-inner" {...field} /></FormControl>
                      </FormItem>
                    )} />
                  </>
                )}

                <FormField control={form.control} name="salaryAdvances" render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel className="text-slate-600 font-semibold text-xs">Salary Advances</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        className="w-32 h-9 text-right"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="leaveDeduction" render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel className="text-slate-600 font-semibold text-xs">Leave Deduction</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        className="w-32 h-9 text-right"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )} />
                <div className="flex justify-between items-center pt-2 border-t border-slate-100 mt-auto">
                  <span className="text-rose-700 font-bold text-sm">Total Deductions</span>
                  <span className="text-rose-700 font-bold">{formatCurrency(calculatedDeductions)}</span>
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-slate-700">Payment Method</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full bg-white border-slate-200 h-11 rounded-xl">
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Cheque">Cheque</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-slate-700">Payment Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal bg-white border-slate-200 h-11 rounded-xl",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className="p-3 [&_td]:!h-9 [&_td]:!w-9 [&_button]:!h-9 [&_button]:!w-9 [&_button]:!text-sm [&_.rdp-caption_label]:!text-sm"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex justify-between items-center">
              <span className="text-blue-700 font-extrabold text-lg uppercase">Net Salary</span>
              <span className="text-blue-800 font-black text-3xl">{formatCurrency(calculatedNet)}</span>
            </div>

            {/* BANK DETAILS SECTION */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Bank Name</span>
                <span className="text-sm font-semibold text-slate-700">{emp.bankName || "Not Provided"}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Branch</span>
                <span className="text-sm font-semibold text-slate-700">{emp.branch || "Not Provided"}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Account No</span>
                <span className="text-sm font-semibold text-slate-700 truncate" title={emp.accountNo}>{emp.accountNo || "Not Provided"}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Account Holder</span>
                <span className="text-sm font-semibold text-slate-700 truncate" title={emp.accountHolderName}>{emp.accountHolderName || "Not Provided"}</span>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-slate-100 flex gap-3 sm:justify-end">
              <DialogClose asChild>
                <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl px-6">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm px-6">
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function PayrollDeleteAlert({ Data, open, onOpenChange, getToken, onSuccess }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!Data) return;
    setIsDeleting(true);
    try {
      const token = await getToken();
      const res = await deletePayrollHistory(token, Data.id);

      if (res?.message === "success" || res?.code === "0") {
        toast.success(`Payroll history for ${Data.empName} deleted successfully.`);
        if (onSuccess) onSuccess();
        onOpenChange(false);
      } else {
        toast.error(`Failed to delete payroll history: ${res?.message}`);
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while deleting the record.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[500px]" onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Do you want to delete the {Data?.payrollMonth} payroll history for {Data?.empName}?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This payroll history will be permanently deleted from your system.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)} disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction className="bg-red-500 hover:bg-red-600 text-white" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
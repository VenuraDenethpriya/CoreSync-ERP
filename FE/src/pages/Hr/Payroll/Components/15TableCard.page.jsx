"use client"

import React, { useEffect, useState } from "react"
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { PaginationComponent } from "@/components/Pagination"
import { useAuth, useUser } from "@clerk/clerk-react"
import { useDebounce } from "@/hooks/useDebounce"
import { createPayroll, fechPayrollEmployeeList } from "@/api/hrApi"
import { toast } from "sonner"

import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

const formatCurrency = (amount) => new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', minimumFractionDigits: 2 }).format(amount || 0);

// Ensure fallback to 0 for undefined/null/empty strings
const numberField = z.union([z.string(), z.number()]).transform((val) => {
  if (val === "" || val === null || val === undefined) return 0;
  return Number(val);
});

const formSchema15 = z.object({
  payrollMonth: z.string().optional(),
  payrollPeriod: z.string().optional(),
  basicSalary: numberField,
  travelAllowance: numberField,
  otherAllowance: numberField,
  expenseReimbursement: numberField,
  salesCommission: numberField,
  grossSalary: numberField,
  epf: numberField,
  employerEpf: numberField,
  salaryAdvances: numberField,
  leaveDeduction: numberField,
  paymentMethod: z.string().optional(),
  paymentDate: z.date().optional().nullable(),

  // Bank Details
  bankName: z.string().optional(),
  branch: z.string().optional(),
  accountNo: z.string().optional(),
  accountHolderName: z.string().optional(),
});

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function PayrollTable15({ setExportData }) {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [salaryCycle, setSalaryCycle] = useState("15");
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const [selectedEmp, setSelectedEmp] = useState(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const token = await getToken();
      const response = await fechPayrollEmployeeList(token, debouncedSearch, limit, offset, salaryCycle);

      const apiData = response?.data?.employee || [];
      const totalRows = response?.data?.total_employee || 0;
      setTotal(totalRows);

      const mappedData = apiData.map((emp) => ({
        id: emp.id,
        empID: emp.emp_id,
        empName: emp.emp_name,
        department: emp.department || 'N/A',
        designation: emp.job_title || 'N/A',
        basicSalary: emp.basic_salary || 0,
        travelAllowance: emp.transport_allowance || 0,
        otherAllowance: emp.other_allowance || 0,
        expenseReimbursement: emp.expense_reimbursement || 0,
        salesCommission: emp.sales_commission || 0,

        grossSalary: emp.total_salary || 0,
        epf: emp.epf_deduction || 0,
        employerEpf: emp.employer_epf || 0,
        salaryAdvances: emp.salary_advances || 0,
        leaveDeduction: emp.leave_deduction || 0,
        totalDeductions: emp.total_deductions || 0,
        netSalary: emp.net_salary || emp.total_salary || 0,
        paymentMethod: emp.payment_method || "", // Removed fallback
        paymentDate: emp.payment_date || null,
        createdAt: emp.created_at || new Date().toISOString(),

        bankName: emp.bank_name || '',
        branch: emp.branch || '',
        accountNo: emp.account_no || '',
        accountHolderName: emp.account_holder_name || '',
      })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setData(mappedData);
      if (setExportData) setExportData(mappedData);
    } catch (error) {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [getToken, debouncedSearch, limit, offset, setExportData]);

  const columns = [
    { accessorKey: "empID", header: "EMP. ID" },
    { accessorKey: "empName", header: "Employee Name", cell: ({ row }) => <span className="font-semibold text-slate-800">{row.getValue("empName")}</span> },
    { accessorKey: "department", header: "Department" },
    { accessorKey: "basicSalary", header: "Basic Salary", cell: ({ row }) => formatCurrency(row.getValue("basicSalary")) },
    { accessorKey: "grossSalary", header: "Gross Salary", cell: ({ row }) => <span className="text-emerald-700 font-medium">{formatCurrency(row.getValue("grossSalary"))}</span> },
    { accessorKey: "totalDeductions", header: "Deductions", cell: ({ row }) => <span className="text-rose-600 font-medium">{formatCurrency(row.getValue("totalDeductions"))}</span> },
    { accessorKey: "netSalary", header: "Net Salary", cell: ({ row }) => <span className="text-blue-700 font-bold bg-blue-50 px-2.5 py-1 rounded-lg">{formatCurrency(row.getValue("netSalary"))}</span> },
  ];

  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input placeholder="Search employee..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm bg-slate-50 border-slate-200 h-11 rounded-xl" />
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

      {selectedEmp && (
        <EditPayroll15Dialog
          emp={selectedEmp}
          open={!!selectedEmp}
          onOpenChange={(isOpen) => !isOpen && setSelectedEmp(null)}
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

  // Initialize Default Dates logic
  const currentMonthIndex = new Date().getMonth();
  const currentMonth = MONTHS[currentMonthIndex];
  const previousMonth = MONTHS[(currentMonthIndex + 11) % 12];
  const defaultPeriodStr = `16 ${previousMonth} - 15 ${currentMonth}`;

  const form = useForm({
    resolver: zodResolver(formSchema15),
    defaultValues: {
      payrollMonth: currentMonth,
      payrollPeriod: defaultPeriodStr,
      basicSalary: emp.basicSalary || 0,
      travelAllowance: emp.travelAllowance || 0,
      otherAllowance: emp.otherAllowance || 0,
      expenseReimbursement: emp.expenseReimbursement || 0,
      salesCommission: emp.salesCommission || 0,
      grossSalary: emp.grossSalary || 0,
      epf: emp.epf || 0,
      employerEpf: emp.employerEpf || 0,
      salaryAdvances: emp.salaryAdvances || 0,
      leaveDeduction: emp.leaveDeduction || 0,
      paymentMethod: emp.paymentMethod || "", // Removed fallback
      paymentDate: emp.paymentDate && emp.paymentDate !== 'N/A' ? new Date(emp.paymentDate) : null, // Set to null default
      bankName: emp.bankName || '',
      branch: emp.branch || '',
      accountNo: emp.accountNo || '',
      accountHolderName: emp.accountHolderName || '',
    }
  });

  const values = form.watch();

  // Watch selected Month to Auto-Calculate the Period String
  const selectedMonth = form.watch("payrollMonth");

  useEffect(() => {
    if (selectedMonth) {
      const idx = MONTHS.indexOf(selectedMonth);
      if (idx !== -1) {
        const prevIdx = (idx + 11) % 12;
        const periodStr = `16 ${MONTHS[prevIdx]} - 15 ${MONTHS[idx]}`;
        form.setValue("payrollPeriod", periodStr, { shouldValidate: true });
      }
    }
  }, [selectedMonth, form]);

  const basicSalaryValue = form.watch("basicSalary");
  const travelAllowanceValue = form.watch("travelAllowance");
  const otherAllowanceValue = form.watch("otherAllowance");
  const expenseReimbursementValue = form.watch("expenseReimbursement");
  const salesCommissionValue = form.watch("salesCommission");

  useEffect(() => {
    const gross =
      Number(basicSalaryValue || 0) +
      Number(travelAllowanceValue || 0) +
      Number(otherAllowanceValue || 0) +
      Number(expenseReimbursementValue || 0) +
      Number(salesCommissionValue || 0);

    form.setValue("grossSalary", Number(gross.toFixed(2)), { shouldValidate: true });
  }, [
    basicSalaryValue,
    travelAllowanceValue,
    otherAllowanceValue,
    expenseReimbursementValue,
    salesCommissionValue,
    form
  ]);

  useEffect(() => {
    const basic = Number(basicSalaryValue || 0);
    form.setValue("epf", basic * 0.08, { shouldValidate: true });
    form.setValue("employerEpf", basic * 0.15, { shouldValidate: true });
  }, [basicSalaryValue, form]);

  // Real-time calculations
  const calculatedGross =
    Number(values.basicSalary || 0) +
    Number(values.travelAllowance || 0) +
    Number(values.otherAllowance || 0) +
    Number(values.expenseReimbursement || 0) +
    Number(values.salesCommission || 0);

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
        month: data.payrollMonth,
        payroll_period: data.payrollPeriod,
        employee_id: emp.id,

        working_days: Number(data.standardWorkingDays || 0),
        leave_eligible: Number(data.leaveEligible || 0),
        leave_utilized: Number(data.leaveUtilized || 0),
        leave_balance: Number(data.leaveBalance || 0),
        unpaid_leave: Number(data.unpaidLeave || 0),

        attendance_incentive: Number(data.attendanceIncentive || 0),
        performance_incentive: Number(data.performanceIncentive || 0),
        overtime_earnings: Number(data.overtimeEarnings || 0),
        overtime: data.overtime,
        ovetime_rate: Number(data.ovetime_rate || 0),
        travel_allowance: Number(data.travelAllowance || 0),
        other_allowance: Number(data.otherAllowance || 0),
        sales_commission: Number(data.salesCommission || 0),
        expense: Number(data.expenseReimbursement || 0),

        gross_salary: Number(data.grossSalary || 0),

        // Deductions
        epf_8: Number(data.epf || 0),
        epf_15: Number(data.employerEpf || 0),
        salary_advances: Number(data.salaryAdvances || 0),
        leave_deduction: Number(data.leaveDeduction || 0),
        late_attendence: Number(data.lateAttendance || 0),
        other: Number(data.otherDeduction || 0),
        water_bill: Number(data.waterBill || 0),

        net_salary: Number(calculatedNet || 0),

        payment_method: data.paymentMethod || "",
        payment_date: data.paymentDate ? data.paymentDate.toISOString() : null,
        created_by: user?.id
      };


      if (createPayroll) {
        const res = await createPayroll(token, payload);
        if (res.message == "success") {
          toast.success(`Payroll record for ${res?.data?.empName} updated successfully!`);
          onSuccess();
          onOpenChange(false);
        } else {
          toast.error(`Error creating payroll record for ${res?.data?.empName || "employee"}`);
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
                    <Input
                      className="bg-white text-slate-600 font-medium"
                      {...field}
                    />
                  </FormControl>
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
                <FormField control={form.control} name="travelAllowance" render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel className="text-slate-600 font-semibold text-xs">Travel Allowance</FormLabel>
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
                <FormField control={form.control} name="otherAllowance" render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel className="text-slate-600 font-semibold text-xs">Other Allowance</FormLabel>
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
                <FormField control={form.control} name="expenseReimbursement" render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel className="text-slate-600 font-semibold text-xs">Reimbursements</FormLabel>
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
                <FormField control={form.control} name="salesCommission" render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel className="text-slate-600 font-semibold text-xs">Sales Commission</FormLabel>
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

                {/* Editable Gross Salary */}
                <FormField control={form.control} name="grossSalary" render={({ field }) => (
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                    <span className="text-emerald-700 font-bold text-sm">Gross Salary</span>
                    <FormControl>
                      <Input
                        type="number"
                        className="w-32 h-9 text-right font-bold text-emerald-700 bg-emerald-50/50 border-emerald-200"
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
                <FormField control={form.control} name="epf" render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel className="text-slate-600 font-semibold text-xs">EPF 8% (Employee) <span className="text-slate-400 font-normal ml-1"></span></FormLabel>
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
                    <FormLabel className="text-slate-500 font-semibold text-xs">EPF 15% (Employer) <span className="text-slate-400 font-normal ml-1"></span></FormLabel>
                    <FormControl><Input type="number" readOnly className="w-32 h-9 text-right bg-slate-100 border-slate-200 text-slate-500 shadow-inner" {...field} /></FormControl>
                  </FormItem>
                )} />

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

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-2 gap-4">

              {/* Payment Method */}
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

              {/* Payment Date */}
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

            {/* BANK DETAILS SECTION (MOVED TO BOTTOM) */}
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
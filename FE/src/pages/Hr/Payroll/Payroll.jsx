import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Roles } from "@/const/const";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx-js-style"; 
import { toast } from "sonner";
import { createAuditLog } from "@/api/settingApi";
import { LockIcon, Download, FileText, FileSpreadsheet } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PayrollTable31 } from "./Components/31TableCard.page";
import { PayrollTable15 } from "./Components/15TableCard.page";
import { PayrollHistoryTable15 } from "./Components/15HistoryTableCard.page";
import { PayrollHistoryTable31 } from "./Components/31HistoryTableCard.page";

const Payroll = () => {
  const { user } = useUser();
  const { getToken } = useAuth();

  const [activeTab, setActiveTab] = useState("payroll");
  const [activeSubTab, setActiveSubTab] = useState("31-cycle");
  const [activeSubTab1, setActiveSubTab1] = useState("31-cycle-history");
  const [exportData, setExportData] = useState([]);
  const navigate = useNavigate();

  const subTabTriggerClass =
    "rounded-xl px-4 py-2 text-xs font-bold transition-all text-slate-600 hover:text-slate-900 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm";

  const formatPaymentDate = (dateString) => {
    if (!dateString || dateString.startsWith("0001-01-01")) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  const getEmployeesArray = () => {
    if (Array.isArray(exportData)) return exportData;
    return exportData?.data?.employee || exportData?.employee || [];
  };

  const getExportDetails = () => {
    const is15Cycle = activeSubTab1.includes("15");
    const cycleName = is15Cycle ? "15 Cycle" : "31 Cycle";
    const employees = getEmployeesArray();
    const month = employees.length > 0 && employees[0].month ? employees[0].month : "Month";
    const fileName = `${month}_payroll_${is15Cycle ? "15_cycle" : "31_cycle"}`;
    
    return { is15Cycle, fileName, month, cycleName, employees };
  };

  const handleDownloadPDF = async () => {
    try {
      const { is15Cycle, fileName, month, cycleName, employees } = getExportDetails();

      if (!employees || employees.length === 0) {
        return toast.error("No data available to export.");
      }

      const doc = new jsPDF("landscape", "mm", "a4");
      
      let head = [];
      let tableRows = [];

      const formatNum = (num) => Number(num || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      if (is15Cycle) {
        head = [
          [
            { content: 'EMPLOYEE DETAILS', colSpan: 4, styles: { fillColor: [191, 219, 254], textColor: [30, 58, 138], halign: 'center' } },    
            { content: 'EARNINGS & ALLOWANCES', colSpan: 7, styles: { fillColor: [167, 243, 208], textColor: [4, 120, 87], halign: 'center' } }, 
            { content: 'DEDUCTIONS', colSpan: 3, styles: { fillColor: [254, 205, 211], textColor: [190, 18, 60], halign: 'center' } },           
            { content: 'PAYMENT SUMMARY', colSpan: 3, styles: { fillColor: [226, 232, 240], textColor: [71, 85, 105], halign: 'center' } }       
          ],
          [
            "Emp Name", "Emp ID", "Designation", "Dept", 
            "Basic Salary", "Work Days", "Travel Allow", "Other Allow", "Expense", "Sales Comm", "Gross", 
            "EPF (8%)", "Advances", "Leave Ded", 
            "Net Salary", "Pay Method", "Pay Date"
          ]
        ];
        
        tableRows = employees.map((item) => [
          item.emp_name || "-", item.emp_id || "-", item.job_title || item.designation || "-", item.department || "-",
          formatNum(item.basic_salary), item.working_days || 0, formatNum(item.travel_allowance), formatNum(item.other_allowance),
          formatNum(item.expense), formatNum(item.sales_commission), formatNum(item.gross_salary), 
          formatNum(item.epf_8), formatNum(item.salary_advances), formatNum(item.leave_deduction), 
          formatNum(item.net_salary), item.payment_method || "-", formatPaymentDate(item.payment_date)
        ]);
      } else {
        head = [
          [
            { content: 'EMPLOYEE DETAILS', colSpan: 4, styles: { fillColor: [191, 219, 254], textColor: [30, 58, 138], halign: 'center' } },  
            { content: 'WORKING INFO', colSpan: 6, styles: { fillColor: [253, 230, 138], textColor: [180, 83, 9], halign: 'center' } },      
            { content: 'EARNINGS', colSpan: 6, styles: { fillColor: [167, 243, 208], textColor: [4, 120, 87], halign: 'center' } },           
            { content: 'DEDUCTIONS', colSpan: 5, styles: { fillColor: [254, 205, 211], textColor: [190, 18, 60], halign: 'center' } },        
            { content: 'PAYMENT', colSpan: 2, styles: { fillColor: [226, 232, 240], textColor: [71, 85, 105], halign: 'center' } }            
          ],
          [
            "Name", "ID", "Desig", "Dept", 
            "Basic", "W. Days", "L. Elig", "L. Util", "L. Bal", "Unpd L", 
            "Att. Inc", "Perf. Inc", "OT Earn", "O. Allow", "Expense", "Gross", 
            "EPF 8%", "Adv", "Lv Ded", "Other", "Water", 
            "Net Salary", "Pay Date"
          ]
        ];
        
        tableRows = employees.map((item) => [
          item.emp_name || "-", item.emp_id || "-", item.job_title || item.designation || "-", item.department || "-",
          formatNum(item.basic_salary), item.working_days || 0, item.leave_eligible || 0, item.leave_utilized || 0,
          item.leave_balance || 0, item.unpaid_leave || 0, 
          formatNum(item.attendance_incentive), formatNum(item.performance_incentive), formatNum(item.overtime_earnings), formatNum(item.other_allowance), formatNum(item.expense), formatNum(item.gross_salary),
          formatNum(item.epf_8), formatNum(item.salary_advances), formatNum(item.leave_deduction), formatNum(item.other), formatNum(item.water_bill),
          formatNum(item.net_salary), formatPaymentDate(item.payment_date)
        ]);
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(30, 58, 138);
      doc.text("CoreSync Pvt. Ltd", 14, 15);
      
      doc.setFontSize(11);
      doc.setTextColor(71, 85, 105);
      doc.text(`Payroll List - ${month} - ${cycleName}`, 14, 22);

      autoTable(doc, { 
        head: head, 
        body: tableRows, 
        startY: 28,
        theme: "grid",
        styles: { 
          fontSize: is15Cycle ? 6.5 : 5, 
          cellPadding: 1.5,
          lineColor: [226, 232, 240], 
          lineWidth: 0.1,
          textColor: [51, 65, 85] 
        }, 
        headStyles: { 
          fillColor: [241, 245, 249], 
          textColor: [15, 23, 42],
          fontStyle: "bold",
          halign: "center"
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252] 
        },
        didParseCell: function (data) {
          if (data.section === 'body') {
            const colIndex = data.column.index;
            const isNumericCol = is15Cycle 
              ? (colIndex >= 4 && colIndex <= 14)  
              : (colIndex >= 4 && colIndex <= 21); 

            if (isNumericCol) {
               data.cell.styles.halign = 'right';
            }
          }
        }
      });
      const pageCount = doc.internal.getNumberOfPages();
      for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(148, 163, 184); 
        doc.text(
          `Generated on: ${new Date().toLocaleString()}  |  Page ${i} of ${pageCount}`, 
          14, 
          doc.internal.pageSize.height - 8
        );
      }

      doc.save(`${fileName}.pdf`);
      
      const token = await getToken();
      await createAuditLog(token, {
        action: "PDF Downloaded", status_code: 200, user: user.id,
        description: `${user.firstName} ${user.lastName} downloaded the payroll list in PDF.`,
      });
    } catch (error) {
      toast.error("Failed to generate PDF.");
      console.error(error);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      const { is15Cycle, fileName, month, cycleName, employees } = getExportDetails();

      if (!employees || employees.length === 0) {
        return toast.error("No data available to export.");
      }
      
      let aoaData = [];
      let merges = [];

      aoaData.push(["CoreSync Pvt. Ltd"]);
      aoaData.push([`Payroll List - ${month} - ${cycleName}`]);
      aoaData.push([]); 

      merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: 10 } });
      merges.push({ s: { r: 1, c: 0 }, e: { r: 1, c: 10 } });

      let groupHeaders = [];
      let colHeaders = [];

      if (is15Cycle) {
        groupHeaders = [
          "EMPLOYEE DETAILS", "", "", "", 
          "EARNINGS & ALLOWANCES", "", "", "", "", "", "", 
          "DEDUCTIONS", "", "", 
          "PAYMENT SUMMARY", "", ""
        ];
        merges.push(
          { s: { r: 3, c: 0 }, e: { r: 3, c: 3 } },   
          { s: { r: 3, c: 4 }, e: { r: 3, c: 10 } },  
          { s: { r: 3, c: 11 }, e: { r: 3, c: 13 } }, 
          { s: { r: 3, c: 14 }, e: { r: 3, c: 16 } } 
        );
        colHeaders = [
          "Emp Name", "Emp ID", "Designation", "Department", 
          "Basic Salary", "Working Days", "Travel Allowance", "Other Allowance", "Expense", "Sales Comm", "Gross Salary", 
          "EPF (8%)", "Salary Advances", "Leave Deduction", 
          "Net Salary", "Payment Method", "Payment Date"
        ];

        aoaData.push(groupHeaders);
        aoaData.push(colHeaders);

        employees.forEach(item => {
          aoaData.push([
            item.emp_name || "-", item.emp_id || "-", item.job_title || item.designation || "-", item.department || "-",
            item.basic_salary || 0, item.working_days || 0, item.travel_allowance || 0, item.other_allowance || 0, item.expense || 0, item.sales_commission || 0, item.gross_salary || 0,
            item.epf_8 || 0, item.salary_advances || 0, item.leave_deduction || 0,
            item.net_salary || 0, item.payment_method || "-", formatPaymentDate(item.payment_date)
          ]);
        });
      } else {
        groupHeaders = [
          "EMPLOYEE DETAILS", "", "", "", 
          "WORKING INFO", "", "", "", "", "",
          "EARNINGS & ALLOWANCES", "", "", "", "", "",
          "DEDUCTIONS", "", "", "", "", 
          "PAYMENT SUMMARY", ""
        ];
        merges.push(
          { s: { r: 3, c: 0 }, e: { r: 3, c: 3 } },   
          { s: { r: 3, c: 4 }, e: { r: 3, c: 9 } },   
          { s: { r: 3, c: 10 }, e: { r: 3, c: 15 } }, 
          { s: { r: 3, c: 16 }, e: { r: 3, c: 20 } }, 
          { s: { r: 3, c: 21 }, e: { r: 3, c: 22 } }  
        );
        colHeaders = [
          "Emp Name", "Emp ID", "Designation", "Department", 
          "Basic Salary", "Work Days", "L. Elig", "L. Util", "L. Bal", "Unpaid L.", 
          "Att. Inc", "Perf. Inc", "OT Earn", "Other Allow", "Expense", "Gross Salary", 
          "EPF (8%)", "Advances", "Leave Ded", "Other", "Water Bill", 
          "Net Salary", "Payment Date"
        ];

        aoaData.push(groupHeaders);
        aoaData.push(colHeaders);

        employees.forEach(item => {
          aoaData.push([
            item.emp_name || "-", item.emp_id || "-", item.job_title || item.designation || "-", item.department || "-",
            item.basic_salary || 0, item.working_days || 0, item.leave_eligible || 0, item.leave_utilized || 0, item.leave_balance || 0, item.unpaid_leave || 0,
            item.attendance_incentive || 0, item.performance_incentive || 0, item.overtime_earnings || 0, item.other_allowance || 0, item.expense || 0, item.gross_salary || 0,
            item.epf_8 || 0, item.salary_advances || 0, item.leave_deduction || 0, item.other || 0, item.water_bill || 0,
            item.net_salary || 0, formatPaymentDate(item.payment_date)
          ]);
        });
      }

      const worksheet = XLSX.utils.aoa_to_sheet(aoaData);
      worksheet['!merges'] = merges;
      
      const colWidths = colHeaders.map(() => ({ wch: 16 }));
      worksheet['!cols'] = colWidths;

      const range = XLSX.utils.decode_range(worksheet['!ref']);
      
      for (let R = 0; R <= range.e.r; ++R) {
        for (let C = 0; C <= range.e.c; ++C) {
          const cell_ref = XLSX.utils.encode_cell({ c: C, r: R });
          if (!worksheet[cell_ref]) continue;

          if (R === 0) {
            worksheet[cell_ref].s = {
              font: { bold: true, sz: 16, color: { rgb: "1E3A8A" } },
              alignment: { horizontal: "center", vertical: "center" }
            };
          } 
          else if (R === 1) {
            worksheet[cell_ref].s = {
              font: { bold: true, sz: 12, color: { rgb: "475569" } },
              alignment: { horizontal: "center", vertical: "center" }
            };
          }
          else if (R === 3) {
            
            let bgRGB = "1E40AF"; 
            if (worksheet[cell_ref].v === "DEDUCTIONS") bgRGB = "BE123C"; 
            if (worksheet[cell_ref].v === "EARNINGS & ALLOWANCES") bgRGB = "047857"; 
            if (worksheet[cell_ref].v === "WORKING INFO") bgRGB = "D97706"; 
            
            worksheet[cell_ref].s = {
              font: { bold: true, color: { rgb: "FFFFFF" } },
              fill: { fgColor: { rgb: bgRGB } },
              alignment: { horizontal: "center", vertical: "center" },
              border: {
                top: { style: "thin", color: { rgb: "FFFFFF" } },
                bottom: { style: "thin", color: { rgb: "FFFFFF" } },
                left: { style: "thin", color: { rgb: "FFFFFF" } },
                right: { style: "thin", color: { rgb: "FFFFFF" } }
              }
            };
          }
          else if (R === 4) {
            worksheet[cell_ref].s = {
              font: { bold: true, color: { rgb: "1E293B" } },
              fill: { fgColor: { rgb: "F1F5F9" } }, 
              alignment: { horizontal: "center", vertical: "center" },
              border: {
                bottom: { style: "medium", color: { rgb: "94A3B8" } }
              }
            };
          }
          else if (R > 4) {
            worksheet[cell_ref].s = {
              alignment: { vertical: "center" }
            };
            
            if (typeof worksheet[cell_ref].v === 'number') {
              worksheet[cell_ref].s.numFmt = "#,##0.00";
            }
          }
        }
      }

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Payroll Data");

      XLSX.writeFile(workbook, `${fileName}.xlsx`);

      const token = await getToken();
      await createAuditLog(token, {
        action: "Excel Downloaded",
        status_code: 200,
        user: user.id,
        description: `${user.firstName} ${user.lastName} downloaded the payroll list in Excel format.`,
      });
    } catch (error) {
      toast.error("Failed to generate Excel.");
      console.error(error);
    }
  };

  if (
    user?.publicMetadata?.role === Roles.WAREHOUSE_STAFF ||
    user?.publicMetadata?.role === Roles.INVENTORY_MANAGER ||
    user?.publicMetadata?.role === Roles.OFFICE_STAFF ||
    user?.publicMetadata?.role === Roles.SALES_HEAD ||
    user?.publicMetadata?.role === Roles.SALES_TEAM
  ) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] w-full px-4">
        <div className="bg-white shadow-sm rounded-2xl p-8 max-w-md text-center border border-red-100">
          <div className="flex flex-col items-center justify-center gap-3">
            <LockIcon className="w-12 h-12 text-red-500" />
            <h1 className="text-xl font-bold text-gray-800">Access Denied</h1>
            <p className="text-sm text-gray-500">
              You are not authorized to access this page. Please contact your
              administrator if you believe this is a mistake.
            </p>
            <Button
              className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl"
              onClick={() => navigate("/")}
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* --- HEADER SECTION --- */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/70">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight truncate">
              {activeTab === "payroll" && "Payroll Management"}
              {activeTab === "payroll-history" && "Payroll History"}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {activeTab === "payroll-history" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl"
                  >
                    <Download className="w-4 h-4 mr-2" /> Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-lg">
                  <DropdownMenuItem onClick={handleDownloadPDF} className="cursor-pointer font-medium text-slate-700">
                    <FileText className="w-4 h-4 mr-2 text-rose-500" />
                    Export PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDownloadExcel} className="cursor-pointer font-medium text-slate-700">
                    <FileSpreadsheet className="w-4 h-4 mr-2 text-emerald-500" />
                    Export Excel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* --- TABS SECTION --- */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto pb-1 mb-4">
          <TabsList className="inline-flex gap-2 min-w-max border-b border-slate-200/70 bg-transparent h-auto p-0">
            <TabsTrigger
              value="payroll"
              className="rounded-t-xl border-b-2 border-transparent px-5 py-2.5 text-sm font-semibold text-slate-500 transition-all hover:text-slate-900 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              Payroll
            </TabsTrigger>
            <TabsTrigger
              value="payroll-history"
              className="rounded-t-xl border-b-2 border-transparent px-5 py-2.5 text-sm font-semibold text-slate-500 transition-all hover:text-slate-900 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              Payroll History
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="payroll" className="mt-0 outline-none w-full space-y-4">
          <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
            <div className="flex gap-2 bg-slate-100/80 p-1.5 rounded-2xl w-fit border border-slate-200/70 mb-4">
              <TabsList className="bg-transparent h-auto p-0 gap-1">
                <TabsTrigger value="31-cycle" className={subTabTriggerClass}>
                  31 Cycle (End of Month)
                </TabsTrigger>
                <TabsTrigger value="15-cycle" className={subTabTriggerClass}>
                  15 Cycle (Mid Month)
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="31-cycle" className="w-full mt-0 outline-none">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/70 p-2">
                <div className="w-full overflow-x-auto">
                  <div className="min-w-[850px] p-2">
                    <PayrollTable31 setExportData={setExportData} />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="15-cycle" className="w-full mt-0 outline-none">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/70 p-2">
                <div className="w-full overflow-x-auto">
                  <div className="min-w-[850px] p-2">
                    <PayrollTable15 setExportData={setExportData} />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="payroll-history" className="mt-0 outline-none w-full space-y-4">
          <Tabs value={activeSubTab1} onValueChange={setActiveSubTab1} className="w-full">
            <div className="flex gap-2 bg-slate-100/80 p-1.5 rounded-2xl w-fit border border-slate-200/70 mb-4">
              <TabsList className="bg-transparent h-auto p-0 gap-1">
                <TabsTrigger value="31-cycle-history" className={subTabTriggerClass}>
                  31 Cycle (End of Month)
                </TabsTrigger>
                <TabsTrigger value="15-cycle-history" className={subTabTriggerClass}>
                  15 Cycle (Mid Month)
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="31-cycle-history" className="w-full mt-0 outline-none">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/70 p-2">
                <div className="w-full overflow-x-auto">
                  <div className="min-w-[850px] p-2">
                    <PayrollHistoryTable31 setExportData={setExportData} />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="15-cycle-history" className="w-full mt-0 outline-none">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/70 p-2">
                <div className="w-full overflow-x-auto">
                  <div className="min-w-[850px] p-2">
                    <PayrollHistoryTable15 setExportData={setExportData} />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Payroll;
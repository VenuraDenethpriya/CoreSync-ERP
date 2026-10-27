import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Copy, Download, FileText, FileSpreadsheet } from "lucide-react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { ErrorState } from "@/components/Skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EditEmployee } from "./EditEmployee";
import { DeleteAlert } from "./EmployeeDeleteAlert";
import { deleteEmployee, fetchEmployeeById } from "@/api/hrApi";
import { Roles } from "@/const/const";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "@/components/ui/button";

function EmployeeView() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const { employeId } = useParams();

  const [employeeData, setemployeeData] = useState({});
  const [activeTab, setActiveTab] = useState("employee");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchemployeeData = async () => {
    try {
      const token = await getToken();
      const res = await fetchEmployeeById(token, employeId);
      const employee = res.data;
      setemployeeData(employee);
    } catch (error) {
      setIsError(true);
      setErrorMessage("Error fetching employee data: " + error.message);
      toast.error("Couldn't load employee data", { position: "bottom-right" });
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchemployeeData().finally(() => {
      setIsLoading(false);
      setIsError(false);
    });
  }, [employeId, getToken]);

  const handleDelete = async () => {
    try {
      const token = await getToken();
      const response = await deleteEmployee(token, employeId);
      if (response.message === "success") {
        toast.success("Employee deleted successfully!", { position: "bottom-right" });
        navigate("/hr/employees");
      }
    } catch (error) {
      toast.error("Error deleting employee! Please try again.", { position: "bottom-right" });
    }
  };

  const getFormattedExportData = () => {
    if (!employeeData) return {};

    const formattedData = {};
    
    const excludeKeys = ["id"]; 

    const dateTimeKeys = ["created_at", "updated_at"];

    const dateOnlyKeys = ["date_of_birth", "hire_date", "resignation_date", "termination_date"];

    Object.entries(employeeData).forEach(([key, value]) => {
      if (excludeKeys.includes(key) || (typeof value === "object" && value !== null)) {
        return; 
      }
      
      let displayValue = value !== null && value !== undefined ? String(value) : "N/A";

      if (typeof value === "string") {
        if (!value.startsWith("0001-01-01")) {
          const d = new Date(value);
          if (!isNaN(d.getTime()) && (dateTimeKeys.includes(key) || dateOnlyKeys.includes(key))) {
            if (dateTimeKeys.includes(key)) {
              displayValue = d.toLocaleString("en-US", { 
                year: 'numeric', month: 'short', day: 'numeric', 
                hour: '2-digit', minute: '2-digit', hour12: true 
              });
            } else if (dateOnlyKeys.includes(key)) {
              displayValue = d.toLocaleDateString("en-US", { 
                year: 'numeric', month: 'short', day: 'numeric' 
              });
            }
          }
        } else {
          displayValue = "N/A"; 
        }
      }

      const formattedKey = key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
      
      formattedData[formattedKey] = displayValue;
    });
    return formattedData;
  };

  const handleDownloadExcel = () => {
    const exportData = getFormattedExportData();
    if (Object.keys(exportData).length === 0) return;
    
    const ws = XLSX.utils.json_to_sheet([exportData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employee Details");
    
    const fileName = `${employeeData.first_name || 'Employee'}_${employeeData.last_name || 'Data'}.xlsx`;
    XLSX.writeFile(wb, fileName);
    toast.success("Excel downloaded successfully!", { position: "bottom-right" });
  };

  const handleDownloadPDF = () => {
    const exportData = getFormattedExportData();
    if (Object.keys(exportData).length === 0) return;

    const doc = new jsPDF();
    const title = `Employee Details: ${employeeData.first_name || ""} ${employeeData.last_name || ""}`;
    doc.text(title, 14, 15);

    const tableData = Object.entries(exportData);

    autoTable(doc, {
      startY: 20,
      head: [["Field", "Value"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246] }, 
    });

    const fileName = `${employeeData.first_name || 'Employee'}_${employeeData.last_name || 'Data'}.pdf`;
    doc.save(fileName);
    toast.success("PDF downloaded successfully!", { position: "bottom-right" });
  };

  const calculateEmploymentPeriod = (hireDateStr) => {
    if (!hireDateStr || hireDateStr.startsWith("0001-01-01") || hireDateStr === "N/A") {
      return "N/A";
    }

    const hireDate = new Date(hireDateStr);
    const today = new Date();

    let years = today.getFullYear() - hireDate.getFullYear();
    let months = today.getMonth() - hireDate.getMonth();

    if (months < 0) {
      years--;
      months += 12;
    }

    if (years === 0 && months === 0) {
      const diffTime = Math.abs(today - hireDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    }

    let period = [];
    if (years > 0) period.push(`${years} year${years > 1 ? 's' : ''}`);
    if (months > 0) period.push(`${months} month${months > 1 ? 's' : ''}`);

    return period.join(", ");
  };

  const tabTriggerClass = "rounded-t-xl border-b-2 border-transparent px-5 py-2.5 text-sm font-semibold text-slate-500 transition-all hover:text-slate-900 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 data-[state=active]:bg-white data-[state=active]:shadow-sm";

  if (isLoading) {
    return (
      <div className="w-full space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/70 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="h-8 w-64 bg-slate-200 rounded-xl"></div>
          {user?.publicMetadata?.role !== Roles.READ_ONLY && (
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-24 bg-slate-200 rounded-xl"></div>
              <div className="h-10 w-24 bg-rose-100 rounded-xl"></div>
            </div>
          )}
        </div>

        {/* Tabs Trigger Skeleton */}
        <div className="w-full flex gap-2 overflow-x-hidden pb-1 mb-4 border-b border-slate-200/70">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-10 w-24 bg-slate-200 rounded-t-xl shrink-0"></div>
          ))}
        </div>

        <div className="space-y-6">
          {/* Tab Content Skeleton (Mimics Default Employee Tab) */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
            <div className="h-6 w-40 bg-slate-200 rounded-lg mb-5"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline py-2 border-b border-slate-100 last:border-0">
                  <div className="h-4 w-28 bg-slate-200 rounded"></div>
                  <div className="h-4 w-40 bg-slate-100 rounded mt-2 sm:mt-0"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Timestamps Skeleton */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-x-16">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex flex-col space-y-2">
                  <div className="h-3 w-20 bg-slate-200 rounded"></div>
                  <div className="h-4 w-36 bg-slate-100 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return <ErrorState errorMessage={errorMessage} />;
  }

  return (
    <div className="w-full space-y-6">

      {/* --- HEADER SECTION --- */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/70 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight truncate">
            {employeeData.first_name} {employeeData.last_name}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {user?.publicMetadata?.role !== Roles.READ_ONLY && (
            <>
              <EditEmployee employeeData={employeeData} onUpdate={fetchemployeeData} />
              <DeleteAlert handleDelete={handleDelete} employeeData={employeeData} />
            </>
          )}

          {/* --- DOWNLOAD DROPDOWN --- */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 bg-white text-slate-700 border-slate-200 hover:bg-slate-50 rounded-xl px-4 shadow-sm">
                <Download className="w-4 h-4" />
                Download
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-lg">
              <DropdownMenuItem onClick={handleDownloadPDF} className="cursor-pointer font-medium text-slate-700">
                <FileText className="w-4 h-4 mr-2 text-rose-500" />
                Download PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownloadExcel} className="cursor-pointer font-medium text-slate-700">
                <FileSpreadsheet className="w-4 h-4 mr-2 text-emerald-500" />
                Download Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* ------------------------- */}
        </div>
      </div>

      {/* --- TABS SECTION --- */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto pb-1 mb-4">
          <TabsList className="inline-flex gap-2 min-w-max border-b border-slate-200/70 bg-transparent h-auto p-0">
            <TabsTrigger value="employee" className={tabTriggerClass}>Employee</TabsTrigger>
            <TabsTrigger value="position" className={tabTriggerClass}>Position</TabsTrigger>
            {/* <TabsTrigger value="reference" className={tabTriggerClass}>Reference</TabsTrigger> */}
            <TabsTrigger value="salary" className={tabTriggerClass}>Salary</TabsTrigger>
            <TabsTrigger value="leave" className={tabTriggerClass}>Leave</TabsTrigger>
            {/* <TabsTrigger value="letters" className={tabTriggerClass}>Letters</TabsTrigger> */}
            <TabsTrigger value="bank" className={tabTriggerClass}>Bank</TabsTrigger>
            <TabsTrigger value="other" className={tabTriggerClass}>Other</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="employee" className="mt-0 outline-none w-full">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
            <h3 className="text-lg font-bold mb-5 text-slate-800">Employee Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
              <DetailRow label="Employee ID" value={employeeData.emp_id} />
              {/* <DetailRow label="EMP Folder" value={employeeData.emp_folder} /> */}
              <DetailRow label="Surname" value={employeeData.surname} />
              <DetailRow label="Phone No." value={employeeData.phone} />
              <DetailRow label="Email" value={employeeData.email} />
              <DetailRow label="NIC/ Passport No." value={employeeData.nic} />
              <DetailRow label="Permanent Address" value={employeeData.permanent_address} />
              <DetailRow label="Residential Address" value={employeeData.residential_address} />
              {/* <DetailRow label="State" value={employeeData.state} />
              <DetailRow label="Zip Code" value={employeeData.zip_code} /> */}
              <DetailRow label="Marital Status" value={employeeData.marital_status} />
              <DetailRow label="Gender" value={employeeData.gender} />
              <DetailRow label="Date of Birth" value={employeeData.date_of_birth ? new Date(employeeData.date_of_birth).toLocaleDateString() : undefined} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="position" className="mt-0 outline-none w-full">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
            <h3 className="text-lg font-bold mb-5 text-slate-800">Position Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
              <DetailRow label="Job Title" value={employeeData.job_title} />
              <DetailRow label="Department" value={employeeData.department} />
              <DetailRow label="Employee Type" value={employeeData.employee_type} />
              <DetailRow label="Employment Status" value={employeeData.employment_status} />
              <DetailRow label="Manager" value={employeeData.manager} />
              <DetailRow label="Work Location" value={employeeData.work_location} />
              <DetailRow label="Hire Date" value={employeeData.hire_date ? new Date(employeeData.hire_date).toLocaleDateString() : undefined} />
              <DetailRow label="Hiring Source" value={employeeData.hire_source} />
              <DetailRow
                label="Employment Period"
                value={calculateEmploymentPeriod(employeeData.hire_date)}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reference" className="mt-0 outline-none w-full">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
            <h3 className="text-lg font-bold mb-5 text-slate-800">Reference Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
              <DetailRow label="RER No | PEM" value={employeeData.rer_no_p} />
              <DetailRow label="RER No | OL" value={employeeData.rer_no_o} />
              <DetailRow label="RER No | SCRT" value={employeeData.rer_no_s} />
              <DetailRow label="RER No | CNF" value={employeeData.rer_no_c} />
              <DetailRow label="RER No | WRN" value={employeeData.rer_no_w} />
              <DetailRow label="RER No | APT" value={employeeData.rer_no_a} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="salary" className="mt-0 outline-none w-full">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
            <h3 className="text-lg font-bold mb-5 text-slate-800">Salary Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
              <DetailRow label="Basic Salary (LKR)" value={employeeData.basic_salary} />
              {/* <DetailRow label="After Promotion Salary (LKR)" value={employeeData.after_promotion_salary} /> */}
              <DetailRow label="Transport Allowance (LKR)" value={employeeData.transport_allowance} />
              <DetailRow label="Other Allowance (LKR)" value={employeeData.other_allowance} />
              <DetailRow label="Has Overtime" value={employeeData.has_overtime ? "Yes" : "No"} />
              <DetailRow label="Overtime Rate (LKR)" value={employeeData.overtime_rate} />
              <DetailRow label="Has Attendance Software" value={employeeData.has_attendance ? "Yes" : "No"} />
              <DetailRow label="Has Performance Bonus" value={employeeData.has_performance_bonus ? "Yes" : "No"} />
              <DetailRow label="Salary Per Hour (LKR)" value={employeeData.salary_per_hour} />
              <DetailRow label="Salary Per Day (LKR)" value={employeeData.salary_per_day} />
              <DetailRow label="Salary Cycle" value={employeeData.salery_cycle} />
              <DetailRow label="Total Salary (LKR)" value={employeeData.total_salary} />
              <DetailRow label="Has EPF/ ETF" value={employeeData.has_epf ? "Yes" : "No"} />
              <DetailRow label="EPF No" value={employeeData.epf_no} />
              <DetailRow label="ETF No" value={employeeData.etf_no} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="leave" className="mt-0 outline-none w-full">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
            <h3 className="text-lg font-bold mb-5 text-slate-800">Leave Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
              <DetailRow label="No Of Annual Leave" value={employeeData.no_of_annual_leave} />
              <DetailRow label="No Of Casual Leave" value={employeeData.no_of_casual_leave} />
              <DetailRow label="No Of Sick Leave" value={employeeData.no_of_sick_leave} />
              <DetailRow label="No Of Maternity" value={employeeData.no_of_maternity_leave} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="letters" className="mt-0 outline-none w-full">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
            <h3 className="text-lg font-bold mb-5 text-slate-800">Letters Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
              <DetailRow label="OL" value={employeeData.ol} />
              <DetailRow label="LOA" value={employeeData.loa} />
              <DetailRow label="ID Status" value={employeeData.id_status} />
              <DetailRow label="Personal File" value={employeeData.personal_file} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="bank" className="mt-0 outline-none w-full">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
            <h3 className="text-lg font-bold mb-5 text-slate-800">Bank Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
              <DetailRow label="Bank Name" value={employeeData.bank_name} />
              <DetailRow label="Branch" value={employeeData.branch} />
              <DetailRow label="Account No" value={employeeData.account_no} />
              <DetailRow label="Account Holder Name" value={employeeData.account_holder_name} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="other" className="mt-0 outline-none w-full">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
            <h3 className="text-lg font-bold mb-5 text-slate-800">Other Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
              <DetailRow label="Resignation Date" value={employeeData.resignation_date ? new Date(employeeData.resignation_date).toLocaleDateString() : undefined} />
              <DetailRow label="Termination Date" value={employeeData.termination_date ? new Date(employeeData.termination_date).toLocaleDateString() : undefined} />
              <DetailRow label="Notes" value={employeeData.notes} />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Timestamps */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
        <div className="text-xs sm:text-sm text-slate-600 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-x-16">
          <Timestamp label="Created At" value={employeeData.created_at} />
          <Timestamp label="Last Updated At" value={employeeData.updated_at} />
        </div>
      </div>

    </div>
  );
}

function DetailRow({ label, value }) {
  const handleCopy = () => {
    if (typeof value === "string" && value) {
      navigator.clipboard.writeText(value);
      toast.success("Copied to clipboard!", { position: "bottom-right" });
    }
  };

  const isPhoneField = label === "Phone No.";

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline py-1.5 border-b border-slate-100 last:border-0">
      <span className="text-slate-500 text-sm font-semibold">{label}:</span>
      <span className="text-sm text-slate-800 font-medium mt-1 sm:mt-0 flex items-center gap-2">
        {value || "N/A"}
        {isPhoneField && value && value !== "N/A" && (
          <Copy
            size={14}
            className="cursor-pointer text-slate-400 hover:text-blue-600 transition-colors"
            onClick={handleCopy}
            title="Copy phone number"
          />
        )}
      </span>
    </div>
  );
}

function Timestamp({ label, value }) {
  return (
    <div className="flex flex-col">
      <span className="uppercase tracking-wider text-[10px] text-slate-400 font-bold mb-1">{label}</span>
      <span className="font-semibold text-slate-700 text-sm">{value ? new Date(value).toLocaleString() : "N/A"}</span>
    </div>
  );
}

export default EmployeeView;
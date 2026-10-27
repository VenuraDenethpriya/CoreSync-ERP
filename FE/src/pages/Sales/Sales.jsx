import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import { LockIcon, Plus, Download } from "lucide-react";
import { Roles } from "@/const/const";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SalesTable } from "./Sales/Components/SalesTableCard.page";
import { TeamTable } from "./Team/Components/TeamTableCard.page";
import { CallsTable } from "./Calls/Components/CallsTableCard.page";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import { createAuditLog } from "@/api/settingApi";
import SalesDashboard from "./Dashboard/SalesDashboard";
import SalesTeamDashboard from "./Dashboard/SalesTeamDashboard";

const Sales = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("sales");
  const [saleExportData, setSaleExportData] = useState([]);
  const [teamExportData, setTeamExportData] = useState([]);
  const [callExportData, setCallsExportData] = useState([]);

  const handleSaleDownloadPDF = async () => {
    try {
      const doc = new jsPDF();
      const tableColumn = ["Sales No.", "Type", "Date", "Salesperson", "Customer Name", "Commission", "Description"];
      const tableRows = saleExportData.map(s => [s.salesNo, s.type, s.date, s.salesPerson, s.customerName, s.commission, s.description]);

      autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });
      doc.save("Sales List.pdf");

      const token = await getToken();
      await createAuditLog(token, { action: "PDF Downloaded", status_code: 200, user: user.id, description: `Downloaded sales list.` });
    } catch (error) { toast.error("Failed to generate PDF"); }
  };

  const handleCallsDownloadPDF = async () => {
    try {
      const doc = new jsPDF();
      const tableColumn = ["Salesperson", "Customer Phone No.", "Call Status", "Call Duration"];
      const tableRows = callExportData.map(c => [c.agentName, c.customerPhoneNo, c.callStatus, c.callDuration]);
      autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });
      doc.save("Calls List.pdf");
    } catch (error) { toast.error("Failed to generate PDF"); }
  };

  const handleTeamDownloadPDF = async () => {
    try {
      const doc = new jsPDF();
      const tableColumn = ["Name", "Phone No.", "Email", "Total No. of Sale", "Total Commission"];
      const tableRows = teamExportData.map(t => [t.name, t.phoneNo, t.email, t.totalSales, t.totalCommission]);
      autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });
      doc.save("Sales Team List.pdf");
    } catch (error) { toast.error("Failed to generate PDF"); }
  };

  // if (user?.publicMetadata?.role === Roles.WAREHOUSE_STAFF || user?.publicMetadata?.role === Roles.INVENTORY_MANAGER || user?.publicMetadata?.role === Roles.HR_HEAD) {
  //   return (
  //     <div className="flex items-center justify-center min-h-[70vh] w-full px-4">
  //       <div className="bg-white shadow-sm rounded-2xl p-8 max-w-md text-center border border-red-100">
  //         <div className="flex flex-col items-center justify-center gap-3">
  //           <LockIcon className="w-12 h-12 text-red-500" />
  //           <h1 className="text-xl font-bold text-gray-800">Access Denied</h1>
  //           <p className="text-sm text-gray-500">
  //             You are not authorized to access this page. Please contact your
  //             administrator if you believe this is a mistake.
  //           </p>
  //           <Button
  //             className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl"
  //             onClick={() => navigate("/")}
  //           >
  //             Go to Dashboard
  //           </Button>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="w-full space-y-6">

      {/* --- HEADER SECTION --- */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/70">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight truncate">
              {activeTab === "dashboard" && "Sales Dashboard"}
              {activeTab === "team-dashboard" && "Sales Dashboard"}
              {activeTab === "sales" && "Sales Management"}
              {activeTab === "calls" && "Call Logs"}
              {activeTab === "team" && "Sales Team"}
            </h1>
            {/* <p className="text-sm text-slate-500 mt-1">
              {activeTab === "sales" && "Manage sales records, transactions, and commissions."}
              {activeTab === "calls" && "View customer call logs and status records."}
              {activeTab === "team" && "Manage sales team members and performance."}
              {activeTab.includes("dashboard") && "Overview of your sales performance and metrics."}
            </p> */}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  {
                    activeTab === "dashboard" || activeTab === "team-dashboard" ? null : (
                      <Button
                        variant="outline"
                        className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl"
                        onClick={activeTab === 'sales' ? handleSaleDownloadPDF : activeTab === 'calls' ? handleCallsDownloadPDF : handleTeamDownloadPDF}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Export</span>
                      </Button>
                    )
                  }

                  {/* Conditional Action Buttons */}
                  {activeTab === "sales" && user?.publicMetadata?.role !== Roles.SALES_TEAM && (
                    <Button onClick={() => navigate("/sales/add-sale")} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm">
                      <Plus className="w-4 h-4 mr-2" /> New Sale
                    </Button>
                  )}
                  {activeTab === "team" && (
                    <Button onClick={() => navigate("/sales/add-salesperson")} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm">
                      <Plus className="w-4 h-4 mr-2" /> New Member
                    </Button>
                  )}

          </div>
        </div>
      </div>

      {/* --- TABS SECTION --- */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto pb-1 mb-4">
          <TabsList className="inline-flex gap-2 min-w-max border-b border-slate-200/70 bg-transparent h-auto p-0">
            {user?.publicMetadata?.role === Roles.SUPER_ADMIN && (
              <TabsTrigger value="dashboard" className="rounded-t-xl border-b-2 border-transparent px-5 py-2.5 text-sm font-semibold text-slate-500 transition-all hover:text-slate-900 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 data-[state=active]:bg-white data-[state=active]:shadow-sm">Dashboard</TabsTrigger>
            )}
            {user?.publicMetadata?.role === Roles.SALES_TEAM && (
              <TabsTrigger value="team-dashboard" className="rounded-t-xl border-b-2 border-transparent px-5 py-2.5 text-sm font-semibold text-slate-500 transition-all hover:text-slate-900 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 data-[state=active]:bg-white data-[state=active]:shadow-sm">Dashboard</TabsTrigger>
            )}
            <TabsTrigger value="sales" className="rounded-t-xl border-b-2 border-transparent px-5 py-2.5 text-sm font-semibold text-slate-500 transition-all hover:text-slate-900 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 data-[state=active]:bg-white data-[state=active]:shadow-sm">Sales</TabsTrigger>
            <TabsTrigger value="calls" className="rounded-t-xl border-b-2 border-transparent px-5 py-2.5 text-sm font-semibold text-slate-500 transition-all hover:text-slate-900 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 data-[state=active]:bg-white data-[state=active]:shadow-sm">Calls</TabsTrigger>
            {user?.publicMetadata?.role !== Roles.SALES_TEAM && (
              <TabsTrigger value="team" className="rounded-t-xl border-b-2 border-transparent px-5 py-2.5 text-sm font-semibold text-slate-500 transition-all hover:text-slate-900 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 data-[state=active]:bg-white data-[state=active]:shadow-sm">Team</TabsTrigger>
            )}
          </TabsList>
        </div>

        {/* --- TAB CONTENTS WITH BORDER --- */}
        <TabsContent value="dashboard" className="mt-0 outline-none w-full">
          <div className="w-full overflow-x-auto border border-slate-200/70 rounded-2xl bg-white shadow-sm p-2">
            <div className="min-w-[850px]">
              <SalesDashboard />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="team-dashboard" className="mt-0 outline-none w-full">
          <div className="w-full overflow-x-auto border border-slate-200/70 rounded-2xl bg-white shadow-sm p-2">
            <div className="min-w-[850px]">
              <SalesTeamDashboard />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="sales" className="mt-0 outline-none w-full">
          <div className="w-full overflow-x-auto border border-slate-200/70 rounded-2xl bg-white shadow-sm p-2">
            <div className="min-w-[850px]">
              <SalesTable setExportData={setSaleExportData} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="calls" className="mt-0 outline-none w-full">
          <div className="w-full overflow-x-auto border border-slate-200/70 rounded-2xl bg-white shadow-sm p-2">
            <div className="min-w-[850px]">
              <CallsTable setExportData={setCallsExportData} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="team" className="mt-0 outline-none w-full">
          <div className="w-full overflow-x-auto border border-slate-200/70 rounded-2xl bg-white shadow-sm p-2">
            <div className="min-w-[850px]">
              <TeamTable setExportData={setTeamExportData} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Sales;
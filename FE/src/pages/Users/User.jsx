import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import { LockIcon, Plus, Download } from "lucide-react";
import { Roles } from "@/const/const";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserTable } from "./Components/UsersTableCard.page";
import { LogsTable } from "./Components/LogsTableCard.page";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import { createAuditLog } from "@/api/settingApi";

const Users = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState("users");
  const [exportData, setExportData] = useState([]);

  const handleDownloadPDF = async () => {
    try {
      const doc = new jsPDF();
      const tableColumn = ["Name", "Phone No.", "Email", "Role"];
      const tableRows = exportData.map(item => [
        item.userName,
        item.phoneNo,
        item.email || "-",
        item.role || "-",
      ]);

      autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });
      doc.text("Users List", 14, 15);
      doc.save("Users List.pdf");

      const token = await getToken();
      await createAuditLog(token, {
        action: "PDF Downloaded",
        status_code: 200,
        user: user.id,
        description: `${user.firstName} ${user.lastName} downloaded the users list as a PDF file.`,
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    }
  };

  const handleNewUser = () => navigate("/users/add-user");

  // ACCESS CONTROL
  if (
    user?.publicMetadata?.role === Roles.HEAD ||
    user?.publicMetadata?.role === Roles.WAREHOUSE_STAFF ||
    user?.publicMetadata?.role === Roles.INVENTORY_MANAGER ||
    user?.publicMetadata?.role === Roles.OFFICE_STAFF ||
    user?.publicMetadata?.role === Roles.SALES_TEAM ||
    user?.publicMetadata?.role === Roles.FINANCE_HEAD ||
    user?.publicMetadata?.role === Roles.HR_HEAD ||
    user?.publicMetadata?.role === Roles.READ_ONLY 
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
              className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-sm"
              onClick={() => navigate("/")}
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const tabTriggerClass = "rounded-t-xl border-b-2 border-transparent px-5 py-2.5 text-sm font-semibold text-slate-500 transition-all hover:text-slate-900 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 data-[state=active]:bg-white data-[state=active]:shadow-sm";

  return (
    <div className="w-full space-y-6">
      
      {/* --- HEADER SECTION --- */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/70 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight truncate">
            {activeTab === "users" ? "User Management" : "System Logs"}
          </h1>
          {/* <p className="text-sm text-slate-500 mt-1">
            {activeTab === "users" ? "Manage system users, permissions, and roles." : "Monitor system activity logs and audit trails."}
          </p> */}
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {activeTab === "users" && (
            <>
              <Button
                variant="outline"
                className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl h-10 px-4"
                onClick={handleDownloadPDF}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button
                onClick={handleNewUser}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm h-10 px-4"
              >
                <Plus className="w-4 h-4 mr-2" />
                New User
              </Button>
            </>
          )}
        </div>
      </div>

      {/* --- TABS SECTION --- */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto pb-1 mb-4">
          <TabsList className="inline-flex gap-2 min-w-max border-b border-slate-200/70 bg-transparent h-auto p-0">
            <TabsTrigger value="users" className={tabTriggerClass}>Users</TabsTrigger>
            <TabsTrigger value="logs" className={tabTriggerClass}>Logs</TabsTrigger>
          </TabsList>
        </div>

        {/* --- TAB CONTENTS WITH BORDER --- */}
        <TabsContent value="users" className="mt-0 outline-none w-full">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/70 p-2">
            <div className="w-full overflow-x-auto">
              <div className="min-w-[850px] p-2">
                <UserTable setExportData={setExportData} />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="mt-0 outline-none w-full">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/70 p-2">
            <div className="w-full overflow-x-auto">
              <div className="min-w-[850px] p-2">
                <LogsTable />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

    </div>
  );
};

export default Users;
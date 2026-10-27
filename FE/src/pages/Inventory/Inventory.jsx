import { Button } from "@/components/ui/button";
import { useState } from "react";
import { InventoryTable } from "./Inventory/Components/TableCard.page";
import { useNavigate } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Roles } from "@/const/const";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import { createAuditLog } from "@/api/settingApi";
import { LockIcon, Plus, Download } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InventoryOrderTable } from "./Orders/Components/TableCard.page";
import { InventoryOrderReceivedTable } from "./Received/TableCard.page";

const Inventory = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [activeTab, setActiveTab] = useState("inventory");
  const [exportData, setExportData] = useState([]);
  const navigate = useNavigate();

  // Define access permission
  const isSuperAdmin = user?.publicMetadata?.role === Roles.SUPER_ADMIN;

  const handleDownloadPDF = async () => {
    try {
      const doc = new jsPDF();
      const tableColumn = ["Item Code", "Item Name", "Quantity", "Threshold", "Status"];
      const tableRows = exportData.map(item => [item.itemCode, item.itemName, item.quantity, item.threshold, item.status]);

      autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });
      doc.text("Inventory List", 14, 15);
      doc.save("Inventory List.pdf");

      const token = await getToken();
      await createAuditLog(token, {
        action: "PDF Downloaded",
        status_code: 200,
        user: user.id,
        description: `${user.firstName} ${user.lastName} downloaded the inventory list.`,
      });
    } catch (error) {
      toast.error("Failed to generate PDF.");
    }
  };

  const handleOrderDownloadPDF = async () => {
    try {
      const doc = new jsPDF();
      const tableColumn = ["Order No", "Item Code", "Item Name", "Quantity", "Amount(LKR)", "Order Date", "Status"];
      const tableRows = exportData.map(item => [item.orderNo || "-", item.itemCode, item.itemName, item.quantity, item.amount, item.orderDate, item.status]);

      autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });
      doc.text("Inventory Order List", 14, 15);
      doc.save("Inventory Order List.pdf");

      const token = await getToken();
      await createAuditLog(token, {
        action: "PDF Downloaded",
        status_code: 200,
        user: user.id,
        description: `${user.firstName} ${user.lastName} downloaded the inventory order list.`,
      });
    } catch (error) {
      toast.error("Failed to generate PDF.");
    }
  };

  const handleNewItem = () => navigate("/inventory/add-item");
  const handleNewItemOrder = () => navigate("/inventory/add-item-order");

  if (user?.publicMetadata?.role === Roles.WAREHOUSE_STAFF || user?.publicMetadata?.role === Roles.HR_HEAD) {
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
              {activeTab === "inventory" && "Inventory Management"}
              {activeTab === "received" && "Received Items"}
              {activeTab === "orders" && "Inventory Orders"}
            </h1>
            {/* <p className="text-sm text-slate-500 mt-1">Manage and track your stock items, receipts, and supply orders.</p> */}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Conditional Buttons */}
            {activeTab === "inventory" && (
              <>
                {user?.publicMetadata?.role === Roles.READ_ONLY ? null : (
                  <>
                    <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl" onClick={handleDownloadPDF}>
                      <Download className="w-4 h-4 mr-2" /> Export
                    </Button>
                    <Button onClick={handleNewItem} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm">
                      <Plus className="w-4 h-4 mr-2" /> New Item
                    </Button>
                  </>
                )}

              </>
            )}

            {/* Show Order Buttons ONLY for Super Admin */}
            {activeTab === "orders" && isSuperAdmin && (
              <>
                <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl" onClick={handleOrderDownloadPDF}>
                  <Download className="w-4 h-4 mr-2" /> Export
                </Button>
                {/* <Button onClick={handleNewItemOrder} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm">
                  <Plus className="w-4 h-4 mr-2" /> New Order
                </Button> */}
              </>
            )}
          </div>
        </div>
      </div>

      {/* --- TABS SECTION --- */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto pb-1 mb-4">
          <TabsList className="inline-flex gap-2 min-w-max border-b border-slate-200/70 bg-transparent h-auto p-0">
            <TabsTrigger value="inventory" className="rounded-t-xl border-b-2 border-transparent px-5 py-2.5 text-sm font-semibold text-slate-500 transition-all hover:text-slate-900 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 data-[state=active]:bg-white data-[state=active]:shadow-sm">Inventory</TabsTrigger>

            {/* Only Super Admin can see these tabs */}
            {isSuperAdmin && (
              <>
                <TabsTrigger value="received" className="rounded-t-xl border-b-2 border-transparent px-5 py-2.5 text-sm font-semibold text-slate-500 transition-all hover:text-slate-900 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 data-[state=active]:bg-white data-[state=active]:shadow-sm">Received</TabsTrigger>
                <TabsTrigger value="orders" className="rounded-t-xl border-b-2 border-transparent px-5 py-2.5 text-sm font-semibold text-slate-500 transition-all hover:text-slate-900 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 data-[state=active]:bg-white data-[state=active]:shadow-sm">Orders</TabsTrigger>
              </>
            )}
          </TabsList>
        </div>

        <TabsContent value="inventory" className="mt-0 outline-none w-full">
          <div className="w-full overflow-x-auto border border-slate-200/70 rounded-2xl bg-white shadow-sm p-2">
            <div className="min-w-[800px]">
              <InventoryTable setExportData={setExportData} />
            </div>
          </div>
        </TabsContent>

        {/* Only Super Admin content */}
        {isSuperAdmin && (
          <>
            <TabsContent value="received" className="mt-0 outline-none w-full">
              <div className="w-full overflow-x-auto border border-slate-200/70 rounded-2xl bg-white shadow-sm p-2">
                <div className="min-w-[800px]">
                  <InventoryOrderReceivedTable setExportData={setExportData} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="orders" className="mt-0 outline-none w-full">
              <div className="w-full overflow-x-auto border border-slate-200/70 rounded-2xl bg-white shadow-sm p-2">
                <div className="min-w-[800px]">
                  <InventoryOrderTable setExportData={setExportData} />
                </div>
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

export default Inventory;
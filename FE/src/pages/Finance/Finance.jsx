import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Plus, Download } from "lucide-react";
import { Roles } from "@/const/const";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PurchasesTable } from "./Components/PurchaseTableCard.page";
import { PaymentsTable } from "./Components/PaymentTableCard.page";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import { createAuditLog } from "@/api/settingApi";

const Finance = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState("purchases");
  const [purchaseExportData, setPurchaseExportData] = useState([]);
  const [paymentsExportData, setPaymentsExportData] = useState([]);

  const handlePurchaseDownloadPDF = async () => {
    try {
      const doc = new jsPDF();
      const tableColumn = ["Purchase No.", "Items", "Amount", "Status", "Date"];
      const tableRows = purchaseExportData.map(p => [p.purchaseNo, p.items, p.amount, p.status, p.date]);

      autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });
      doc.text("Purchase List", 14, 15);
      doc.save("Purchase List.pdf");
      
      const token = await getToken();
      await createAuditLog(token, { action: "PDF Downloaded", status_code: 200, user: user.id, description: "Downloaded purchase orders list." });
    } catch (error) { toast.error("Failed to generate PDF"); }
  };

  const handlePaymentsDownloadPDF = async () => {
    try {
      const doc = new jsPDF();
      const tableColumn = ["Order No", "Amount", "Payment Mode", "Payment Type", "Created By", "Status", "Date"];
      const tableRows = paymentsExportData.map(p => [p.orderNo, p.amount, p.mode, p.type, p.createdBy, p.status, p.date]);

      autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });
      doc.text("Payment List", 14, 15);
      doc.save("Payment List.pdf");
      
      const token = await getToken();
      await createAuditLog(token, { action: "PDF Downloaded", status_code: 200, user: user.id, description: "Downloaded payment list." });
    } catch (error) { toast.error("Failed to generate PDF"); }
  };

  return (
    <div className="w-full space-y-6">
      
      {/* --- HEADER SECTION --- */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/70">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight truncate">
              {activeTab === "purchases" ? "Purchase Orders" : "Payments Management"}
            </h1>
            {/* <p className="text-sm text-slate-500 mt-1">
              {activeTab === "purchases" ? "Manage incoming purchase orders and stock procurement." : "Review processed payment transactions and history."}
            </p> */}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {
              user.publicMetadata.role == Roles.READ_ONLY ? null : <>
                <Button
                  variant="outline"
                  className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl h-10 px-4"
                  onClick={activeTab === "purchases" ? handlePurchaseDownloadPDF : handlePaymentsDownloadPDF}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>

                {activeTab === "purchases" && (
                  <Button onClick={() => navigate("/finance/purchases/add-purchase")} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm h-10 px-4">
                    <Plus className="w-4 h-4 mr-2" /> New Purchase
                  </Button>
                )}
              </>
            }
          </div>
        </div>
      </div>

      {/* --- TABS SECTION --- */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto pb-1 mb-4">
          <TabsList className="inline-flex gap-2 min-w-max border-b border-slate-200/70 bg-transparent h-auto p-0">
            <TabsTrigger value="purchases" className="rounded-t-xl border-b-2 border-transparent px-5 py-2.5 text-sm font-semibold text-slate-500 transition-all hover:text-slate-900 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 data-[state=active]:bg-white data-[state=active]:shadow-sm">Purchases</TabsTrigger>
            
            {/* Only show payments tab for authorized roles */}
            {!(user?.publicMetadata?.role === Roles.WAREHOUSE_STAFF || 
               user?.publicMetadata?.role === Roles.INVENTORY_MANAGER || 
               user?.publicMetadata?.role === Roles.SALES_TEAM || 
               user?.publicMetadata?.role === Roles.OFFICE_STAFF ||
               user?.publicMetadata?.role === Roles.HR_HEAD) && (
              <TabsTrigger value="payments" className="rounded-t-xl border-b-2 border-transparent px-5 py-2.5 text-sm font-semibold text-slate-500 transition-all hover:text-slate-900 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 data-[state=active]:bg-white data-[state=active]:shadow-sm">Payments</TabsTrigger>
            )}
          </TabsList>
        </div>

        {/* --- TAB CONTENTS --- */}
        <TabsContent value="purchases" className="mt-0 outline-none w-full">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/70 p-2">
            <div className="w-full overflow-x-auto">
              <div className="min-w-[850px] p-2">
                <PurchasesTable setExportData={setPurchaseExportData} />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="payments" className="mt-0 outline-none w-full">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/70 p-2">
            <div className="w-full overflow-x-auto">
              <div className="min-w-[850px] p-2">
                <PaymentsTable setExportData={setPaymentsExportData} />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Finance;
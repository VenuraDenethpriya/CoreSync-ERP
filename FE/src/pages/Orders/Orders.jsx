import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { OrderTable } from "./Components/TableCard.page";
import { PacksTable } from "./Components/PacksTableCard.page";
import { useNavigate } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import { AnimatePresence, motion } from "framer-motion";
import { BsRecordCircle } from "react-icons/bs";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import { createAuditLog } from "@/api/settingApi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, LockIcon, Plus } from "lucide-react";
import { Roles } from "@/const/const";

const Orders = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("orders");
  const [exportData, setExportData] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const isInventoryManager = user?.publicMetadata?.role === "INVENTORY_MANAGER";
  const isSalesTeam = user?.publicMetadata?.role === "SALES_TEAM";
  const isWorkshopStaff = user?.publicMetadata?.role === "WAREHOUSE_STAFF";

  const canCreateOrder = !isInventoryManager && !isSalesTeam;
  const canCreatePack = !isWorkshopStaff && !isSalesTeam;

  const handleDownloadPDF = async () => {
    try {
      const doc = new jsPDF();
      const tableColumn = ["Order ID", "Customer Name", "Price", "Order Status", "Expected Delivery Date", "Payment Status"];
      const tableRows = exportData.map(item => {
        const basePrice = parseFloat(item.price);
        const finalPrice = item.vat ? basePrice + basePrice * 0.18 : basePrice;
        return [
          item.type + item.orderNo,
          item.customerName,
          new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(finalPrice),
          item.orderStatus,
          new Date(item.expected_delivery_date).toLocaleDateString(),
          item.paymentStatus
        ];
      });

      autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });
      doc.text("Order List", 14, 15);
      doc.save("Orders.pdf");
    } catch (error) {
      toast.error("Failed to generate PDF");
    }
  };

  const handleDownloadPacksPDF = async () => {
    try {
      const doc = new jsPDF();
      const tableColumn = ["Serial No", "Product Name", "Status", "Note"];
      const tableRows = exportData.map(pack => [pack.serialNo, pack.productName, pack.status, pack.note]);
      autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });
      doc.save("Packs.pdf");
    } catch (error) {
      toast.error("Failed to generate PDF");
    }
  };

  const handleOrderCards = () => {
    setIsAnimating(true);
    const docElm = document.documentElement;
    if (docElm.requestFullscreen) docElm.requestFullscreen();
    setTimeout(() => navigate("/orders/order-cards"), 300);
  };

  // if (user?.publicMetadata?.role === Roles.WAREHOUSE_STAFF || user?.publicMetadata?.role === Roles.HR_HEAD) {
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
  //             className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-sm"
  //             onClick={() => navigate("/")}
  //           >
  //             Go to Dashboard
  //           </Button>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  const tabTriggerClass = "rounded-t-xl border-b-2 border-transparent px-5 py-2.5 text-sm font-semibold text-slate-500 transition-all hover:text-slate-900 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 data-[state=active]:bg-white data-[state=active]:shadow-sm";

  return (
    <div className="w-full space-y-6">

      {/* --- HEADER SECTION --- */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/70 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex-1 min-w-0 flex items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight truncate">
              {activeTab === "orders" ? "Orders Management" : "Packs Management"}
            </h1>
            {/* <p className="text-sm text-slate-500 mt-1">
              {activeTab === "orders" ? "Track and manage customer orders." : "Manage required battery packs."}
            </p> */}
          </div>

          {/* Order Cards Trigger (Desktop) */}
          {!isSalesTeam && activeTab === "orders" && (
            <div onClick={handleOrderCards} className="cursor-pointer relative hidden sm:block ml-2" title="View Order Cards">
              <AnimatePresence>
                {isAnimating ? (
                  <motion.div initial={{ scale: 1 }} animate={{ scale: 30, opacity: 0 }} className="absolute inset-0 flex items-center justify-center z-50">
                    <BsRecordCircle size="20px" className="text-blue-600" />
                  </motion.div>
                ) : (
                  <BsRecordCircle size="20px" className="text-blue-600 hover:scale-125 transition-transform" />
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
         
              <>
                <Button
                  variant="outline"
                  className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl h-10 px-4"
                  onClick={activeTab === "orders" ? handleDownloadPDF : handleDownloadPacksPDF}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>

                <Button
                  onClick={activeTab === "orders" ? () => navigate("/orders/add-order") : () => navigate("/orders/packs/add-pack")}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm h-10 px-4"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {activeTab === "orders" ? "New Order" : "New Pack"}
                </Button>
              </>

        </div>
      </div>

      {/* --- TABS SECTION --- */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto pb-1 mb-4">
          <TabsList className="inline-flex gap-2 min-w-max border-b border-slate-200/70 bg-transparent h-auto p-0">
            <TabsTrigger value="orders" className={tabTriggerClass}>Orders</TabsTrigger>
            <TabsTrigger value="packs" className={tabTriggerClass}>Packs</TabsTrigger>
          </TabsList>
        </div>

        {/* --- TAB CONTENTS WITH BORDER --- */}
        <TabsContent value="orders" className="mt-0 outline-none w-full">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/70 p-2">
            <div className="w-full overflow-x-auto">
              <div className="min-w-[850px] p-2">
                <OrderTable handleOrderCards={handleOrderCards} setExportData={setExportData} isAnimating={isAnimating} />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="packs" className="mt-0 outline-none w-full">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/70 p-2">
            <div className="w-full overflow-x-auto">
              <div className="min-w-[850px] p-2">
                <PacksTable handleOrderCards={handleOrderCards} setExportData={setExportData} />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

    </div>
  );
};

export default Orders;
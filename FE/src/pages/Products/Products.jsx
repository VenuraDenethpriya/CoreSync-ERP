import { Button } from "@/components/ui/button";
import { ProductTable } from "./Components/TableCard.page";
import { AddProductDropdownMenu } from "./Components/AddProductMenu";
import { useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { LockIcon, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Roles } from "@/const/const";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import { createAuditLog } from "@/api/settingApi";

const Products = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [exportData, setExportData] = useState([]);

  const handleDownloadPDF = async () => {
    try {
      const doc = new jsPDF();
      const tableColumn = ["Product Name", "Category", "Price", "Type", "Active"];
      const tableRows = exportData.map(item => [
        item.productName,
        item.category,
        new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(item.price),
        item.type,
        item.is_active === true ? "Yes" : "No",
      ]);

      autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });
      doc.text("Product List", 14, 15);
      doc.save("Products List.pdf");

      const token = await getToken();
      await createAuditLog(token, {
        action: "PDF Downloaded",
        status_code: 200,
        user: user.id,
        description: `${user.firstName} ${user.lastName} downloaded the products list as a PDF file.`,
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    }
  };

  // if (user?.publicMetadata?.role === Roles.WAREHOUSE_STAFF || user?.publicMetadata?.role === Roles.SALES_TEAM || user?.publicMetadata?.role === Roles.HR_HEAD) {
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
              Product Management
            </h1>
            {/* <p className="text-sm text-slate-500 mt-1">
              Manage and track all products, categories, and inventory listings.
            </p> */}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">

            <>
              <Button
                variant="outline"
                className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl"
                onClick={handleDownloadPDF}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <div>
                <AddProductDropdownMenu />
              </div>
            </>

          </div>
        </div>
      </div>

      {/* --- TABLE CONTENT --- */}
      <div className="w-full overflow-x-auto border border-slate-200/70 rounded-2xl bg-white shadow-sm p-2">
        <div className="min-w-[800px]">
          <ProductTable setExportData={setExportData} />
        </div>
      </div>

    </div>
  );
};

export default Products;
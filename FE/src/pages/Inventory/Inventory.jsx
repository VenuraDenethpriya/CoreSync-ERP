import { Button } from "@/components/ui/button";
import BreadCrumbs from "../../components/ui/BreadCrumbs";
import { useEffect, useState } from "react";
import { InventoryTable } from "./Components/TableCard.page";
import { useNavigate } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Roles } from "@/const/const";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import { createAuditLog } from "@/api/settingApi";

const Products = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const breadcrumbs = [
    { name: "Dashboard", link: "/" },
    { name: "Inventory", link: "/inventory" },
  ];
  const [exportData, setExportData] = useState([]);
  const navigate = useNavigate();

  const handleDownloadPDF = async () => {
    try {
      const doc = new jsPDF();
      const tableColumn = ["Item Code", "Item Name", "Quantity", "Threshold", "Status"];
      const tableRows = [];

      exportData.forEach(item => {
        const rowData = [
          item.itemCode,
          item.itemName,
          item.quantity,
          item.threshold,
          item.status,
        ];
        tableRows.push(rowData);
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
      });

      doc.text("Inventory List", 14, 15);
      doc.save("Inventory List.pdf");

      const token = await getToken();
      await createAuditLog(token, {
        action: "PDF Downloaded",
        status_code: 200,
        user: user.id,
        description: `${user.firstName} ${user.lastName} downloaded the inventory list as a PDF file.`,
      });

    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF.");
      return;
    }

  };


  const handleNewItem = () => {
    navigate("/inventory/add-item");
  };

  return (
    <div className="w-full relative min-h-screen bg-slate-50">
      {isMobile ? (
        <div className="flex flex-col w-full">
          <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-4 bg-white border-b shadow-sm w-full">
            <h1 className="font-bold text-xl text-gray-900">Inventory</h1>
            <Button
              onClick={handleNewItem}
              className="bg-blue-800 hover:bg-blue-900 shadow-md whitespace-nowrap"
              size="sm"
            >
             New Item
            </Button>
          </div>
          <div className="w-full max-w-[100vw] overflow-x-auto overflow-y-hidden">
            <div className="min-w-[700px]  py-2"> 
              <InventoryTable setExportData={setExportData} />
            </div>
          </div>
        </div>
      ) : (
        <>
          <BreadCrumbs breadcrumbs={breadcrumbs} />
          <div className="px-4 lg:px-16 flex items-center justify-end gap-2 mb-4">
            <Button
              onClick={handleNewItem}
              className="bg-blue-800 hover:bg-blue-900"
            >
              New Item
            </Button>

            <Button
              variant="outline"
              className="hidden lg:flex border-2 border-blue-950 hover:bg-blue-950 hover:text-white transition-all"
              onClick={handleDownloadPDF}
            >
              Download
            </Button>
          </div>
          <div className="mx-3 sm:mx-16">
            <InventoryTable className="" setExportData={setExportData} />
          </div>
        </>
      )}
    </div>
  );
};

export default Products;
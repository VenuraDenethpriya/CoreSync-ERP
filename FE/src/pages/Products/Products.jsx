import { Button } from "@/components/ui/button";
import BreadCrumbs from "../../components/ui/BreadCrumbs";
import { ProductTable } from "./Components/TableCard.page";
import { AddProductDropdownMenu } from "./Components/AddProductMenu";
import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { LockIcon } from "lucide-react";
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
    { name: "Products", link: "/products" },
  ];
  const [exportData, setExportData] = useState([]);

  const handleDownloadPDF = async () => {
    try {
      const doc = new jsPDF();
      const tableColumn = ["Product Name", "Category", "Price", "Type", "Active"];
      const tableRows = [];

      exportData.forEach(item => {
        const rowData = [
          item.productName,
          item.category,
          new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(item.price),
          item.type,
          item.is_active === true ? "Yes" : "No",
        ];
        tableRows.push(rowData);
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
      });

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
      return;
    }

  };



  return (
    <div className="w-full relative  bg-slate-50 overflow-x-hidden">
    {isMobile ? (
      <div className="flex flex-col w-full">
        <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-4 bg-white border-b shadow-sm w-full">
          <h1 className="font-bold text-xl text-gray-900">Products</h1>
          <div className="flex-shrink-0">
            <AddProductDropdownMenu />
          </div>
        </div>

        <div className="w-full max-w-[100vw] overflow-x-auto overflow-y-hidden">
          <div className="min-w-[700px]">
            <ProductTable setExportData={setExportData} />
          </div>
        </div>
        
      </div>
    ) : (
      <>
        <BreadCrumbs breadcrumbs={breadcrumbs} />
        <div className="px-4 lg:px-16 flex items-center justify-end gap-2 mb-4">
          <AddProductDropdownMenu />
          <Button
            variant="outline"
            className="hidden lg:flex border-2 border-blue-950 hover:bg-blue-950 hover:text-white transition-all"
            onClick={handleDownloadPDF}
          >
            Download
          </Button>
        </div>
        <div className="mx-3 sm:mx-16">
          <ProductTable setExportData={setExportData} />
        </div>
      </>
    )}
  </div>
  );
};

export default Products;
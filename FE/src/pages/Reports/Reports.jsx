import { Button } from "@/components/ui/button";
import BreadCrumbs from "../../components/ui/BreadCrumbs";
import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { LockIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Roles } from "@/const/const";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import { createAuditLog } from "@/api/settingApi";
import { ReportTable } from "./Components/TableCard.page";

const Reports = () => {
  const { user, isSignedIn } = useUser();
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
    { name: "Reports", link: "/reports" },
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

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center h-[80vh] px-4">
        <div className="bg-white shadow-md rounded-xl p-8 max-w-lg text-center border border-red-200">
          <div className="flex flex-col items-center justify-center gap-3">
            <LockIcon className="w-14 h-14 text-red-600" />
            <h1 className="text-2xl font-semibold text-gray-800">
              Authentication Required
            </h1>
            <p className="text-gray-600">
              You should be signed in to access this page.
            </p>
            <Button
              className="mt-4 bg-blue-700 hover:bg-blue-800 text-white"
              onClick={() =>  navigate("/login")} 
            >
              Log In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (user.publicMetadata.role == Roles.WAREHOUSE_STAFF) {
    return (
      <div className="flex items-center justify-center h-[80vh] px-4">
        <div className="bg-white shadow-md rounded-xl p-8 max-w-lg text-center border border-red-200">
          <div className="flex flex-col items-center justify-center gap-3">
            <LockIcon className="w-14 h-14 text-red-600" />
            <h1 className="text-2xl font-semibold text-gray-800">
              Access Denied
            </h1>
            <p className="text-gray-600">
              You are not authorized to access this page. Please contact your administrator if you believe this is a mistake.
            </p>
            <Button
              className="mt-4 bg-blue-700 hover:bg-blue-800 text-white"
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
    <div className="w-full relative  bg-slate-50 overflow-x-hidden">
      (
      <>
        <BreadCrumbs breadcrumbs={breadcrumbs} />
        <div className="px-4 lg:px-16 flex items-center justify-end gap-2 mb-4">
          {/* <Button
            variant="outline"
            className="hidden lg:flex border-2 border-blue-950 hover:bg-blue-950 hover:text-white transition-all"
            onClick={handleDownloadPDF}
          >
            Download
          </Button> */}
        </div>
        <div className="mx-3 sm:max-w-screen sm:mx-16">
          <ReportTable
            setExportData={setExportData}
          />
        </div>
      </>
      )
    </div>
  );
};

export default Reports;
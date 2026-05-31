import { Button } from "@/components/ui/button";
import BreadCrumbs from "../../components/ui/BreadCrumbs";
import { useEffect, useState } from "react";
import { QuoteTable } from "./Components/TableCard.page";
import { useNavigate } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import { LockIcon } from "lucide-react";
import { Roles } from "@/const/const";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import { createAuditLog } from "@/api/settingApi";

const Quotes = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [exportData, setExportData] = useState([]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const breadcrumbs = [
    { name: "Dashboard", link: "/" },
    { name: "Quotes", link: "/quotes" },
  ];

  const handleDownloadPDF = async () => {
    try {
      const doc = new jsPDF();
      const tableColumn = ["Quote No.", "Customer Name", "Price", "Status", "Issue Date"];
      const tableRows = [];

      exportData.forEach(item => {
        const rowData = [
          item.type + "-" + item.quoteNo,
          item.customerName,
          new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(item.price),
          item.status,
          new Date(item.issue_date).toLocaleDateString()
        ];
        tableRows.push(rowData);
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
      });

      doc.text("Quotes List", 14, 15);
      doc.save("Quotes List.pdf");

      const token = await getToken();
      await createAuditLog(token, {
        action: "PDF Downloaded",
        status_code: 200,
        user: user.id,
        description: `${user.firstName} ${user.lastName} downloaded the quotes list as a PDF file.`,
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    }
  };

  const handleNewQuote = () => {
    navigate("/quotes/add-battery-pack-quote");
  };


  return (
    <div className="w-full relative  bg-slate-50 overflow-x-hidden">
      {isMobile ? (
        <div className="flex flex-col w-full">
          <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-4 bg-white border-b shadow-sm w-full">
            <h1 className="font-bold text-xl text-gray-900">Quotes</h1>
              <div className="flex-shrink-0">
                <Button 
                  onClick={handleNewQuote} 
                  className="bg-blue-800 hover:bg-blue-900 shadow-md"
                  size="sm"
                >
                  New Quote
                </Button>
              </div>
          </div>

          <div className="w-full max-w-[100vw] overflow-x-auto overflow-y-hidden">
            <div className="min-w-[750px]">
              <QuoteTable setExportData={setExportData} />
            </div>
          </div>
          
        </div>
      ) : (
        <>
          <BreadCrumbs breadcrumbs={breadcrumbs} />
            <div className="px-16 flex items-center justify-end gap-2 mb-4">
              <Button onClick={handleNewQuote} className="bg-blue-800 hover:bg-blue-900">
                New Quote
              </Button>

              <Button
                variant="outline"
                className="border-2 border-blue-950 hover:bg-blue-950 hover:text-white transition-all ease-in"
                onClick={handleDownloadPDF}
              >
                Download
              </Button>
            </div>

          <div className="mx-3 sm:max-w-screen sm:mx-16">
            <QuoteTable setExportData={setExportData} />
          </div>
        </>
      )}
    </div>
  );
};

export default Quotes;
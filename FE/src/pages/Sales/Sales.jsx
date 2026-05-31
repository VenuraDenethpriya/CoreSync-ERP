import { Button } from "@/components/ui/button";
import BreadCrumbs from "../../components/ui/BreadCrumbs";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import { LockIcon } from "lucide-react";
import { Roles } from "@/const/const";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SalesTable } from "./Sales/Components/SalesTableCard.page";
import { TeamTable } from "./Team/Components/TeamTableCard.page";
import { CallsTable } from "./Calls/Components/CallsTableCard.page";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import { createAuditLog } from "@/api/settingApi";

const Sales = () => {
  const { user, isSignedIn } = useUser();
  const { getToken } = useAuth();

  const breadcrumbssales = [
    { name: "Dashboard", link: "/" },
    { name: "Sales", link: "/sales" },
  ];

  const breadcrumbscals = [
    { name: "Dashboard", link: "/" },
    { name: "Calls", link: "/calls" },
  ];

  const breadcrumbsteam = [
    { name: "Dashboard", link: "/" },
    { name: "Team", link: "/team" },
  ];

  const [saleExportData, setSaleExportData] = useState([]);
  const [teamExportData, setTeamExportData] = useState([]);
  const [callExportData, setCallsExportData] = useState([]);

  const navigate = useNavigate();

  const handleSaleDownloadPDF = async () => {
    try {
      const doc = new jsPDF();
      const tableColumn = ["Sales No.", "Type", "Date", "Salesperson", "Customer Name", "Commission", "Description"];
      const tableRows = [];

      saleExportData.forEach(sale => {
        const rowData = [
          sale.salesNo,
          sale.type,
          sale.date,
          sale.salesPerson,
          sale.customerName,
          sale.commission,
          sale.description,
        ];
        tableRows.push(rowData);
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
      });
      doc.text("Sales List", 14, 15);
      doc.save("Sales List.pdf");

      const token = await getToken();
      await createAuditLog(token, {
        action: "PDF Downloaded",
        status_code: 200,
        user: user.id,
        description: `${user.firstName} ${user.lastName} downloaded the sales list as a PDF file.`,
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
      return;
    }

  };

  const handleCallsDownloadPDF = async () => {
    try {
      const doc = new jsPDF();
      const tableColumn = ["Salesperson", "Customer Phone No.", "Call Status", "Call Duration"];
      const tableRows = [];

      callExportData.forEach(call => {
        const rowData = [
          call.agentName,
          call.customerPhoneNo,
          call.callStatus,
          call.callDuration,
        ];
        tableRows.push(rowData);
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
      });
      doc.text("Call List", 14, 15);
      doc.save("Calls List.pdf");

      const token = await getToken();
      await createAuditLog(token, {
        action: "PDF Downloaded",
        status_code: 200,
        user: user.id,
        description: `${user.firstName} ${user.lastName} downloaded the calls list as a PDF file.`,
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
      return;
    }

  };

  const handleTeamDownloadPDF = async () => {
    try {
      const doc = new jsPDF();
      const tableColumn = ["Name", "Phone No.", "Email", "Total No. of Sale", "Total Commission"];
      const tableRows = [];

      teamExportData.forEach(team => {
        const rowData = [
          team.name,
          team.phoneNo,
          team.email,
          team.totalSales,
          team.totalCommission,
        ];
        tableRows.push(rowData);
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
      });
      doc.text("Sales Team List", 14, 15);
      doc.save("Sales Team List.pdf");

      const token = await getToken();
      await createAuditLog(token, {
        action: "PDF Downloaded",
        status_code: 200,
        user: user.id,
        description: `${user.firstName} ${user.lastName} downloaded the sales team list as a PDF file.`,
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
      return;
    }

  };

  const handleNewSale = () => {
    navigate("/sales/add-sale");
  };

  const handleNewMember = () => {
    navigate("/sales/add-salesperson");
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


  if (user.publicMetadata.role == Roles.HEAD || user.publicMetadata.role == Roles.WAREHOUSE_STAFF || user.publicMetadata.role == Roles.INVENTORY_MANAGER) {
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
    <>
      <div className="px-16 sm:gap-2 gap-1 flex items-center sm:justify-end justify-center mb-4">
        <Tabs defaultValue="sales" className="w-full">
          <TabsList>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="calls">Calls</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>
          <TabsContent value="sales">
            <BreadCrumbs breadcrumbs={breadcrumbssales} />
            <div className="">
              <div className="gap-x-2 flex items-center justify-end mb-4 mr-3">
                <Button onClick={handleNewSale} className="bg-blue-800 hover:bg-blue-900">
                  New Sale
                </Button>
                <Button
                  variant="outline"
                  className="border-2 border-blue-950 hover:bg-blue-950 hover:text-white transition-all ease-in"
                  onClick={handleSaleDownloadPDF}
                >
                  Download
                </Button>
              </div>
              <div className="mx-3 sm:max-w-screen">
                <SalesTable setExportData={setSaleExportData} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="calls">
            <BreadCrumbs breadcrumbs={breadcrumbscals} />
            <div className="">
              <div className="gap-x-2 flex items-center justify-end mb-4 mr-3">
                <Button
                  variant="outline"
                  className="border-2 border-blue-950 hover:bg-blue-950 hover:text-white transition-all ease-in"
                  onClick={handleCallsDownloadPDF}
                >
                  Download
                </Button>
              </div>
              <div className="mx-3 sm:max-w-screen">
                <CallsTable setExportData={setCallsExportData} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="team">
            <BreadCrumbs breadcrumbs={breadcrumbsteam} />
            <div className="">
              <div className="gap-x-2 flex items-center justify-end mb-4 mr-3">
                <Button onClick={handleNewMember} className="bg-blue-800 hover:bg-blue-900">
                  New Member
                </Button>
                <Button
                  variant="outline"
                  className="border-2 border-blue-950 hover:bg-blue-950 hover:text-white transition-all ease-in"
                  onClick={handleTeamDownloadPDF}
                >
                  Download
                </Button>
              </div>
              <div className="mx-3 sm:max-w-screen">
                <TeamTable setExportData={setTeamExportData} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Sales;

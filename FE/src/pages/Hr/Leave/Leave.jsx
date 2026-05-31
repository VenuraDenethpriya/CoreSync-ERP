import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import { LockIcon } from "lucide-react";
import { Roles } from "@/const/const";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import { createAuditLog } from "@/api/settingApi";
import BreadCrumbs from "@/components/ui/BreadCrumbs";
import { AcceptTable } from "./Components/AcceptTableCard.page";
import { RequestTable } from "./Components/RequestTableCard.page";

const Leaves = () => {
  const { user, isSignedIn } = useUser();
  const { getToken } = useAuth();

  const breadcrumbsusers = [
    { name: "Dashboard", link: "/" },
    { name: "Leave", link: "/hr/leave" },
  ];

  const breadcrumbslogs = [
    { name: "Dashboard", link: "/" },
    { name: "Leave", link: "/hr/leave" },
  ];

  const [exportData, setExportData] = useState([]);
  const navigate = useNavigate();

  const handleDownloadPDF = async () => {
    try {
      const doc = new jsPDF();
      const tableColumn = ["Name", "Phone No.", "Email", "Role"];
      const tableRows = [];

      exportData.forEach(item => {
        const rowData = [
          item.userName,
          item.phoneNo,
          item.email || "-",
          item.role || "-",
        ];
        tableRows.push(rowData);
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
      });
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
      return;
    }

  };

  const handleNewItem = () => {
    navigate("/users/add-user");
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
  
  if (user.publicMetadata.role == Roles.WAREHOUSE_STAFF || user.publicMetadata.role == Roles.INVENTORY_MANAGER || user.publicMetadata.role == Roles.OFFICE_STAFF) {
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
        <Tabs defaultValue="requests" className="w-full">
          <TabsList>
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="accept">Accept</TabsTrigger>
          </TabsList>
          <TabsContent value="requests">
            <BreadCrumbs breadcrumbs={breadcrumbsusers} />
            <div className="">
              <div className="gap-x-2 flex items-center justify-end mb-4 mr-3">
                <Button onClick={handleNewItem} className="bg-blue-800 hover:bg-blue-900">
                  New Requst
                </Button>
                <Button
                  variant="outline"
                  className="border-2 border-blue-950 hover:bg-blue-950 hover:text-white transition-all ease-in"
                  onClick={handleDownloadPDF}
                >
                  Download
                </Button>
              </div>
              <div className="mx-3 sm:max-w-screen">
                <RequestTable setExportData={setExportData} />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="accept">
            <BreadCrumbs breadcrumbs={breadcrumbslogs} />
            <div className="mx-3 sm:max-w-screen">
              <AcceptTable setExportData={setExportData} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Leaves;

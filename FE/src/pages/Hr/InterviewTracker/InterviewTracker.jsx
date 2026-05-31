import { Button } from "@/components/ui/button";
import BreadCrumbs from "../../../components/ui/BreadCrumbs";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Roles } from "@/const/const";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import { createAuditLog } from "@/api/settingApi";
import { LockIcon } from "lucide-react";
import { InterviewTrackerTable } from "./Components/TableCard.page";

const InterviewTracker = () => {
  const { user, isSignedIn } = useUser();
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
    { name: "Interview Tracker", link: "/hr/interview-tracker" },
  ];
  const [exportData, setExportData] = useState([]);
  const navigate = useNavigate();

  const handleDownloadPDF = async () => {
    try {
      const doc = new jsPDF();
      const tableColumn = ["Name", "Phone Number", "Email", "Date of Application", "Position Applied", "Department", "Evaluation Score", "Status", "Comments"];
      const tableRows = [];

      exportData.forEach(member => {
        const rowData = [
          member.name,
          member.phoneNumber,
          member.email,
          member.dateOfApplication,
          member.positionApplied,
          member.department,
          member.evaluationScore,
          member.status,
          member.comments,
        ];
        tableRows.push(rowData);
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
      });

      doc.text("Interview Tracker", 14, 15);
      doc.save("Interview Tracker.pdf");

      const token = await getToken();
      await createAuditLog(token, {
        action: "PDF Downloaded",
        status_code: 200,
        user: user.id,
        description: `${user.firstName} ${user.lastName} downloaded the interview tracker as a PDF file.`,
      });

    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF.");
      return;
    }

  };


  const handleNewItem = () => {
    navigate("/hr/talent-pool/add-member ");
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
              onClick={() => navigate("/login")}
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
    <div className="w-full relative min-h-screen bg-slate-50">
      {isMobile ? (
        <div className="flex flex-col w-full">
          <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-4 bg-white border-b shadow-sm w-full">
            <h1 className="font-bold text-xl text-gray-900">Interview Tracker</h1>
            {/* <Button
              onClick={handleNewItem}
              className="bg-blue-800 hover:bg-blue-900 shadow-md whitespace-nowrap"
              size="sm"
            >
              New Member
            </Button> */}
          </div>
          <div className="w-full max-w-[100vw] overflow-x-auto overflow-y-hidden">
            <div className="min-w-[700px]  py-2">
              <InterviewTrackerTable setExportData={setExportData} />
            </div>
          </div>
        </div>
      ) : (
        <>
          <BreadCrumbs breadcrumbs={breadcrumbs} />
          <div className="px-4 lg:px-16 flex items-center justify-end gap-2 mb-4">
            {/* <Button
              onClick={handleNewItem}
              className="bg-blue-800 hover:bg-blue-900"
            >
              New Member
            </Button> */}

            <Button
              variant="outline"
              className="hidden lg:flex border-2 border-blue-950 hover:bg-blue-950 hover:text-white transition-all"
              onClick={handleDownloadPDF}
            >
              Download
            </Button>
          </div>
          <div className="mx-3 sm:mx-16">
            <InterviewTrackerTable className="" setExportData={setExportData} />
          </div>
        </>
      )}
    </div>
  );
};

export default InterviewTracker;
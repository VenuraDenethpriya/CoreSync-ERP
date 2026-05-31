import { Button } from "@/components/ui/button";
import BreadCrumbs from "../../components/ui/BreadCrumbs";
import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import { OrderTable } from "./Components/TableCard.page";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import "jspdf-autotable";
import { LockIcon } from "lucide-react";
import { Roles } from "@/const/const";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TaskTable } from "./Components/TaskTableCard.page";

const Approvals = () => {
  const { user } = useUser();

  const breadcrumbsapprovals = [
    { name: "Dashboard", link: "/" },
    { name: "Approvals", link: "/approvals" },
  ];

  const breadcrumbstasks = [
    { name: "Dashboard", link: "/" },
    { name: "Task", link: "/tasks" },
  ];

  const [exportData, setExportData] = useState([]);
  const navigate = useNavigate();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["Order ID", "Customer Name", "Price", "Order Status", "Expected Delivery Date", "Payment Status"];
    const tableRows = [];

    exportData.forEach(item => {
      const rowData = [
        item.type + item.orderNo,
        item.customerName,
        new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(item.price),
        item.orderStatus,
        new Date(item.expected_delivery_date).toLocaleDateString(),
        item.paymentStatus,
      ];
      tableRows.push(rowData);
    });

    doc.autoTable(tableColumn, tableRows, { startY: 20 });
    doc.text("Draft Order List", 14, 15);
    doc.save("Draft Orders List.pdf");
  };

  const handleNewTask = () => {
    navigate("/users/add-task");
  };

  const handleTaskCards = () => {
    setIsAnimating(true);
    // Request fullscreen first
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
      document.documentElement.msRequestFullscreen();
    }

    // Then navigate
    setTimeout(() => {
      navigate("task-cards");
    }, 300);
  };
  



  return (
    <>
      <div className="px-16 sm:gap-2 gap-1 flex items-center sm:justify-end justify-center mb-4">
        <Tabs defaultValue="approvals" className="w-full">
          <TabsList>
            <TabsTrigger value="approvals">Approvals</TabsTrigger>
            <TabsTrigger value="task">Task</TabsTrigger>
          </TabsList>
          <TabsContent value="approvals">
            <BreadCrumbs breadcrumbs={breadcrumbsapprovals} />
            <div className="">
              <div className="mx-3 sm:max-w-screen">
            <OrderTable setExportData={setExportData} />
            </div>
            </div>
          </TabsContent>
          <TabsContent value="task">
            <BreadCrumbs breadcrumbs={breadcrumbstasks} />
            <div className="gap-x-2 flex items-center justify-end mb-4 mr-3">
                <Button onClick={handleNewTask}  className="bg-blue-800 hover:bg-blue-900">
                  New Task
                </Button>
                
              </div>
            <div className="mx-3 sm:max-w-screen">
            <TaskTable handleTaskCards={handleTaskCards} setExportData={setExportData} isAnimating={isAnimating} />
          </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Approvals;
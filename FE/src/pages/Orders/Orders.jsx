import { Button } from "@/components/ui/button";
import BreadCrumbs from "../../components/ui/BreadCrumbs";
import { useEffect, useState } from "react";
import { OrderTable } from "./Components/TableCard.page";
import { useNavigate } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import { AnimatePresence, motion } from "framer-motion";
import { BsRecordCircle } from "react-icons/bs";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import { createAuditLog } from "@/api/settingApi";

const Orders = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [exportData, setExportData] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const breadcrumbs = [
    { name: "Dashboard", link: "/" },
    { name: "Orders", link: "/orders" },
  ];

  const handleDownloadPDF = async () => {
    try {
      const doc = new jsPDF();
      const tableColumn = ["Order ID", "Customer Name", "Price", "Order Status", "Expected Delivery Date", "Payment Status"];
      const tableRows = [];

      exportData.forEach(item => {
        const basePrice = parseFloat(item.price);
        const finalPrice = item.vat ? basePrice + (basePrice * 0.18) : basePrice;

        const rowData = [
          item.type + item.orderNo,
          item.customerName,
          new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(finalPrice),
          item.orderStatus,
          new Date(item.expected_delivery_date).toLocaleDateString(),
          item.paymentStatus,
        ];
        tableRows.push(rowData);
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
      });
      doc.text("Order List", 14, 15);
      doc.save("Orders List.pdf");

      const token = await getToken();
      await createAuditLog(token, {
        action: "PDF Downloaded",
        status_code: 200,
        user: user.id,
        description: `${user.firstName} ${user.lastName} downloaded the orders list as a PDF file.`,
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    }
  };

  const handleNeOrder = () => {
    navigate("/orders/add-order");
  };

  const handleOrderCards = () => {
    setIsAnimating(true);
    // Fullscreen logic
    const docElm = document.documentElement;
    if (docElm.requestFullscreen) docElm.requestFullscreen();
    else if (docElm.webkitRequestFullscreen) docElm.webkitRequestFullscreen();
    else if (docElm.msRequestFullscreen) docElm.msRequestFullscreen();

    setTimeout(() => {
      navigate("/orders/order-cards");
    }, 300);
  };

  return (
    <div className="w-full relative bg-slate-50 overflow-x-hidden">
      {isMobile ? (
        <div className="flex flex-col w-full">
          <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-4 bg-white border-b shadow-sm w-full">
            <h1 className="font-bold text-xl text-gray-900">Orders</h1>
            
              <div className="flex-shrink-0">
                <Button 
                  onClick={handleNeOrder} 
                  className="bg-blue-800 hover:bg-blue-900 shadow-md"
                  size="sm"
                >
                  New Order
                </Button>
              </div>
          </div>

          <div className="w-full max-w-[100vw] overflow-x-auto overflow-y-hidden">
            <div className="min-w-[850px]">
              <OrderTable 
                handleOrderCards={handleOrderCards} 
                setExportData={setExportData} 
                isAnimating={isAnimating} 
              />
            </div>
          </div>

        </div>
      ) : (
        <>
          <div className="flex items-center mx-4">
            <BreadCrumbs className="" breadcrumbs={breadcrumbs} />
          
              <div onClick={handleOrderCards} className="cursor-pointer relative">
                <AnimatePresence>
                  {isAnimating && (
                    <motion.div
                      initial={{ scale: 1, opacity: 1 }}
                      animate={{ scale: 30, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1, ease: "easeInOut" }}
                      className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center z-50"
                    >
                      <BsRecordCircle size="20px" className="text-blue-600" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {!isAnimating && (
                  <BsRecordCircle
                    size="20px"
                    className="ml-8 text-blue-600 hover:scale-125 transition-transform duration-300"
                  />
                )}
              </div>
           
          </div>

         
            <div className="px-16 sm:gap-2 gap-1 flex items-center justify-end mb-4">
              <Button onClick={handleNeOrder} className="bg-blue-800 hover:bg-blue-900">
                New Order
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
            <OrderTable 
              handleOrderCards={handleOrderCards} 
              setExportData={setExportData} 
              isAnimating={isAnimating} 
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Orders;
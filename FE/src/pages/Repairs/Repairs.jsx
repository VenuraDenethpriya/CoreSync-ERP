import { Button } from "@/components/ui/button";
import BreadCrumbs from "../../components/ui/BreadCrumbs";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import { createAuditLog } from "@/api/settingApi";
import { RepairTable } from "./Components/TableCard.page";

const Repairs = () => {
    const { user } = useUser();
    const { getToken } = useAuth();
    const navigate = useNavigate();
    const [exportData, setExportData] = useState([]);

    const breadcrumbs = [
        { name: "Dashboard", link: "/" },
        { name: "Repairs", link: "/repairs" },
    ];

    const handleDownloadPDF = async () => {
        try {
            const doc = new jsPDF();
            const tableColumn = ["Job No", "Customer Name", "Price", "Status", "Due Date"];
            const tableRows = [];

            exportData.forEach(repair => {
                const rowData = [
                    repair.jobNo,
                    repair.customerName,
                    new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(repair.price),
                    repair.status,
                    new Date(repair.due_date).toLocaleDateString(),
                ];
                tableRows.push(rowData);
            });

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 20,
            });
            doc.text("Repair List", 14, 15);
            doc.save("Repairs List.pdf");

            const token = await getToken();
            await createAuditLog(token, {
                action: "PDF Downloaded",
                status_code: 200,
                user: user.id,
                description: `${user.firstName} ${user.lastName} downloaded the repairs list as a PDF file.`,
            });
        } catch (error) {
            console.error("Error generating PDF:", error);
            toast.error("Failed to generate PDF");
        }
    };

    const handleNewRepair = () => {
        navigate("/repairs/add-repair");
    };

    // const handleOrderCards = () => {
    //     setIsAnimating(true);
    //     // Fullscreen logic
    //     const docElm = document.documentElement;
    //     if (docElm.requestFullscreen) docElm.requestFullscreen();
    //     else if (docElm.webkitRequestFullscreen) docElm.webkitRequestFullscreen();
    //     else if (docElm.msRequestFullscreen) docElm.msRequestFullscreen();

    //     setTimeout(() => {
    //         navigate("/orders/order-cards");
    //     }, 300);
    // };

    return (
        <div className="w-full relative bg-slate-50 overflow-x-hidden">
            <>
                <div className="flex items-center mx-4">
                    <BreadCrumbs className="" breadcrumbs={breadcrumbs} />
                </div>

                
                    <div className="px-16 sm:gap-2 gap-1 flex items-center justify-end mb-4">
                        <Button onClick={handleNewRepair} className="bg-blue-800 hover:bg-blue-900">
                            New Repair
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
                    <RepairTable
                        exportData={exportData}
                        setExportData={setExportData}
                    />
                </div>
            </>
        </div>
    );
};

export default Repairs;
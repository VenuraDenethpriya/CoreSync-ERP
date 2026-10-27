import { useNavigate, useParams } from "react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { deletePack, featchPackById, updatePackOrderID, updatePackProduction } from "@/api/orderApi";
import { CalendarDays, ChevronDown, ChevronUp, Clock, Download, Pencil, Printer, Trash2, User, Users } from "lucide-react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Roles } from "@/const/const";
import { deleteInventoryAllocation, featchInventoryAllocation, featchInventoryUsage, updateInventoryAllocationCount, updateInventoryUsageCount } from "@/api/inventoryApi";
import EditUsageCount from "./EditUsageCount";
import { PaginationComponent } from "@/components/Pagination";
import { ErrorState } from "@/components/Skeleton";
import { Button } from "@/components/ui/button";
import { useReactToPrint } from "react-to-print";
import Barcode from "react-barcode";
import { flushSync } from "react-dom";
import { jsPDF } from "jspdf";
import JsBarcode from "jsbarcode";
import AddUsage from "@/pages/Approvals/Components/AddUsage";
import { DeleteAlert } from "./OrderDeleteAlert";

function PackView() {
    const { isLoaded, getToken } = useAuth();
    const { user } = useUser();
    const { packId } = useParams();

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
        { name: "Orders", link: "/orders" },
        { name: "", link: `/orders/packs${packId}` },
    ];

    const [packData, setPackData] = useState(null);
    const [isClient, setIsClient] = useState(false);
    const [showProductDetails, setShowProductDetails] = useState({});
    const [usageData, setUsageData] = useState([]);
    const [itemAllocation, setItemAllocation] = useState([]);

    const [isOpen, setIsOpen] = useState(false);
    const [total, setTotal] = useState(0);
    const [limit, setLimit] = useState(10);
    const [offset, setOffset] = useState(0);
    const [limitUsage, setLimitUsage] = useState(5);
    const [offsetUsage, setOffsetUsage] = useState(0);

    const [allocationTotal, setAllocationTotal] = useState();
    const [allocationLimit, setAllocationLimit] = useState(5);
    const [allocationOffset, setAllocationOffset] = useState(0);

    const [currentEditItem, setCurrentEditItem] = useState(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isUsageLoading, setIsUsageLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [itemUsageData, setItemUsageData] = useState([]);
    const componentRef = useRef(null);
    const [printableItems, setPrintableItems] = useState([]);

    const togleProductDetails = (id) => {
        setShowProductDetails(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const navigate = useNavigate();

    const [expandedUsageId, setExpandedUsageId] = useState(null);

    const toggleUsageRow = (id) => {
        setExpandedUsageId(expandedUsageId === id ? null : id);
    };

    const groupedUsageItems = useMemo(() => {
        if (!itemUsageData || itemUsageData.length === 0) return [];

        const groups = {};

        const allItems = itemUsageData.flatMap(batch =>
            (batch.items || []).map(child => ({
                ...child,
                user_name: child.user_name || batch.user_name,
                inventory_id: batch.inventory_id || batch.id,
                inventory_code: batch.inventory_code,
                inventory_name: batch.inventory_name
            }))
        );

        allItems.forEach(item => {
            const key = item.inventory_id || "unknown";

            if (!groups[key]) {
                groups[key] = {
                    key_id: key,
                    display_name: item.inventory_name || item.inventory_code || "Unknown Item",
                    display_code: item.inventory_code,
                    total_usage: 0,
                    user_name: item.user_name,
                    last_updated: item.created_at,
                    details: []
                };
            }

            groups[key].total_usage += 1;
            groups[key].details.push(item);

            if (new Date(item.created_at) > new Date(groups[key].last_updated)) {
                groups[key].last_updated = item.created_at;
            }
        });

        return Object.values(groups);
    }, [itemUsageData]);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const fetchPackData = async () => {
        try {
            const token = await getToken();
            if (!token) return;
            const response = await featchPackById(token, packId);
            setPackData(response.data);
        } catch (error) {
            setIsError(true);
            setErrorMessage("Error fetching pack data: " + error.message);
            console.error("Error fetching pack data:", error);
        }
    };

    useEffect(() => {
        if (!isLoaded) return;
        setIsLoading(true);
        fetchPackData().then(() => setIsLoading(false));
    }, [getToken, packId, isLoaded]);


    const handleDelete = async () => {
        try {
            const token = await getToken();
            const response = await deletePack(token, packId);
            if (response.message == "success") {
                toast.success("Pack deleted successfully!", { position: "bottom-right" });
                navigate("/orders");
            }
        } catch (error) {
            console.error("Error deleting pack:", error);
        }
    };

    const handleAfterPrint = () => {
        setPrintableItems([]);
    };

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: "Barcode Labels",
        removeAfterPrint: true,
        onAfterPrint: handleAfterPrint,
        pageStyle: `
        @page { 
            size: 50mm 25mm; 
            margin: 0mm !important; 
        }
        html, body { 
            margin: 0 !important; 
            padding: 0 !important; 
            width: 50mm; 
            height: 25mm;
        }
        .print-wrapper { 
            width: 100%; 
            display: block; 
        }
        .barcode-label {
            width: 50mm; 
            height: 25mm; 
            margin: 0;
            transform: translateX(2mm);
            padding: 1mm;
            box-sizing: border-box;
            page-break-after: always;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            justify-content: center; 
            align-items: center;
            text-align: center;
        }
        .barcode-label:last-child { page-break-after: auto; }
        
        .company-logo {
            height: 4.5mm; 
            max-width: 45mm;
            width: auto;
            object-fit: contain;
            margin-bottom: 2px;
            display: block;
        }

        .barcode-container {
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .item-code { 
            font-size: 9px; 
            font-weight: 700; 
            margin-top: 1px; 
            width: 100%; 
            text-align: center; 
        }
        svg { 
            display: block !important;
            margin: 0 auto !important;
            width: 100% !important;
            max-width: 45mm !important; 
            height: auto !important;
            max-height: 14mm !important; 
        }
    `
    });

    const triggerSerialPrint = () => {
        const itemsToPrint = [];

        if (packData?.serial_no) {
            itemsToPrint.push(packData.serial_no);
        }

        if (itemsToPrint.length === 0) {
            toast.error("No serial numbers generated for this pack.", { position: "bottom-right" });
            return;
        }

        flushSync(() => {
            setPrintableItems(itemsToPrint);
        });

        setTimeout(() => {
            handlePrint();
        }, 50);
    };

    const fetchUsageData = async () => {
        if (!packData) return;
        try {
            setIsUsageLoading(true);
            setExpandedUsageId(null);

            const token = await getToken();
            const response = await featchInventoryUsage(token, { packId: packId, limit: limitUsage, offset: offsetUsage });

            const items = response?.data?.items || [];
            const totalCount = response?.data?.total || 0;

            setItemUsageData(items);
            setTotal(totalCount);
        } catch (error) {
            console.error("Error fetching usage data:", error);
            setItemUsageData([]);
        } finally {
            setIsUsageLoading(false);
        }
    };

    useEffect(() => {
        fetchUsageData();
    }, [packData, getToken, isLoaded, limitUsage, offsetUsage]);

    const handleEditUsageCount = async (item, newUsageCount) => {
        try {
            const token = await getToken();
            const usageData = {
                id: item.id,
                item_id: item.item_id,
                old_usage_count: item.usage_count,
                new_usage_count: parseInt(newUsageCount),
            }
            const response = await updateInventoryUsageCount(token, usageData);
            if (response.message === "success") {
                toast.success("Usage updated successfully!", { position: "bottom-right" });
                setIsOpen(false);
                fetchUsageData();
            }
        } catch (error) {
            console.error("Error updating usage:", error);
        }
    };

    const handleEditOrder = async (item, newOrderID) => {
        try {
            const token = await getToken();
            const packPayload = {
                packId: packId,
                existiongorderId: item.order_id,
                neworderId: newOrderID,
            }
            const response = await updatePackOrderID(token, packPayload);
            if (response.message === "success") {
                toast.success("Order No updated successfully!", { position: "bottom-right" });
                setIsOpen(false);
                fetchPackData();
            }
        } catch (error) {
            console.error("Error updating order no:", error);
        }
    };

    const handleEditAllocationCount = async (item, newCount) => {
        try {
            const token = await getToken();
            const allocationData = {
                id: item.id,
                item_id: item.item_id,
                count: parseInt(newCount),
                old_count: item.usage_count
            }
            const response = await updateInventoryAllocationCount(token, allocationData);
            if (response.message === "success") {
                toast.success("Allocation count updated successfully!", { position: "bottom-right" });
                setIsOpen(false);
                fetchAllocationData();
            }
        } catch (error) {
            console.error("Error updating allocation:", error);
        }
    };

    const generateBarcodeBase64 = (value) => {
        const canvas = document.createElement("canvas");
        JsBarcode(canvas, value, {
            format: "CODE128",
            displayValue: false,
            margin: 0,
            width: 2,
            height: 45
        });
        return canvas.toDataURL("image/png").split(",")[1];
    };

    const generateSticker = (action = 'download') => {
        const doc = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: [90, 230]
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const centerX = pageWidth / 2;
        const marginX = 10;
        const contentWidth = pageWidth - (marginX * 2);

        const modelName = packData?.name || "Lithium Battery Pack";
        const serialNo = packData?.serial_no || "N/A";

        const logoWidth = 60;
        const logoHeight = 17;
        const logoX = (pageWidth - logoWidth) / 2;
        const logoY = 3;

        const img = new Image();
        img.src = '/CoreSync-bw-long-logo.jpg';
        img.onload = () => {
            doc.addImage(img, "JPEG", logoX, logoY, logoWidth, logoHeight);

            const dividerY = logoY + logoHeight + 2;
            doc.setLineWidth(0.6);
            doc.line(marginX, dividerY, pageWidth - marginX, dividerY);

            let currentY = dividerY + 10;

            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");

            const splitModel = doc.splitTextToSize(`Model: ${modelName}`, contentWidth);
            doc.text(splitModel, centerX, currentY, { align: "center" });

            currentY += (splitModel.length * 6);

            if (serialNo !== "N/A") {
                try {
                    const barcodeData = generateBarcodeBase64(serialNo);
                    const barcodeWidth = 70;
                    const barcodeX = (pageWidth - barcodeWidth) / 2;

                    doc.addImage(barcodeData, "PNG", barcodeX, currentY, barcodeWidth, 14);
                    currentY += 19;

                    doc.setFontSize(11);
                    doc.setFont("courier", "bold");
                    doc.text(`${serialNo}`, centerX, currentY, { align: "center" });

                    currentY += 12;
                } catch (e) {
                    console.error("Barcode generation failed", e);
                }
            }

            let yPos = currentY;
            const rowHeight = 6;
            const valueStartX = marginX + (contentWidth * 0.35);

            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.text("SPECIFICATIONS", marginX, yPos);
            yPos += 2;

            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.5);
            doc.line(marginX, yPos, marginX + contentWidth, yPos);
            yPos += 6;

            const specData = [
                { label: "Type", value: packData?.type || "-" },
                { label: "Capacity", value: packData?.capacity ? `${packData.capacity} Ah` : "-" },
                { label: "Voltage", value: packData?.voltage ? `${packData.voltage} V` : "-" },
                { label: "Cell Type", value: packData?.cell_type || "-" },
                { label: "Cell Count", value: packData?.cell_count || "-" },
                { label: "BMS Type", value: packData?.bms_type || "-" },
                { label: "Monitor", value: packData?.monitor || "-" }
            ];

            specData.forEach(item => {
                doc.setFont("helvetica", "normal");
                doc.setFontSize(8);
                doc.setTextColor(100, 100, 100);
                doc.text(item.label, marginX, yPos);

                doc.setFont("helvetica", "bold");
                doc.setFontSize(8);
                doc.setTextColor(0, 0, 0);
                doc.text(item.value, valueStartX, yPos);

                yPos += rowHeight;
            });

            let finalY = yPos + 5;

            doc.setLineWidth(0.5);
            doc.setDrawColor(0, 0, 0);
            doc.setFillColor(0, 0, 0);
            doc.rect(marginX, finalY, contentWidth, 8, "F");

            doc.setTextColor(255, 255, 255);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.text("CAUTION", centerX, finalY + 5.5, { align: "center" });

            doc.setTextColor(0, 0, 0);
            doc.setFontSize(8.5);
            doc.setFont("helvetica", "bold");
            doc.text("WARNING: ELECTRIC SHOCK HAZARD", marginX + 3, finalY + 13);

            doc.setFont("helvetica", "normal");
            const warnings = [
                "High voltage present inside the enclosure.",
                "Capacitors store hazardous energy. Do not touch terminals within 5 minutes after all power is disconnected.",
                "Keep the equipment well ventilated.",
                "To avoid electric shock and prevent warranty void, do not remove covers.",
                "No operator serviceable components inside."
            ];

            let warningY = finalY + 18;
            const bulletIndent = marginX + 3;
            const textIndent = marginX + 6;
            const maxTextWidth = contentWidth - 10;

            warnings.forEach(warning => {
                doc.text("•", bulletIndent, warningY);
                const wrappedText = doc.splitTextToSize(warning, maxTextWidth);
                doc.text(wrappedText, textIndent, warningY);
                warningY += (wrappedText.length * 3.5) + 2.5;
            });

            const boxHeight = (warningY - finalY) + 2;
            doc.rect(marginX, finalY, contentWidth, boxHeight);

            finalY += boxHeight + 8;

            doc.setFontSize(10);
            doc.text("CoreSync Private Limited", marginX, finalY + 4);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.text("No 11, __________, Sril Lanka", marginX, finalY + 8);
            doc.text("Sri Lanka", marginX, finalY + 12);

            if (action === 'print') {
                doc.autoPrint();
                const blob = doc.output('blob');
                const blobURL = URL.createObjectURL(blob);
                window.open(blobURL, '_blank');
            } else {
                doc.save(`${serialNo}_Sticker.pdf`);
            }
        };
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "Pending":
                return <Badge className="rounded-full bg-rose-100 text-rose-700 hover:bg-rose-100 font-bold text-xs px-3 py-1 border-0">Pending</Badge>;
            case "Balancing":
                return <Badge className="rounded-full bg-slate-100 text-slate-600 hover:bg-slate-100 font-bold text-xs px-3 py-1 border-0">Balancing</Badge>;
            case "Delivered":
                return <Badge className="rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-100 font-bold text-xs px-3 py-1 border-0">Delivered</Badge>;
            case "Completed":
                return <Badge className="rounded-full bg-blue-100 text-blue-700 hover:bg-blue-100 font-bold text-xs px-3 py-1 border-0">Completed</Badge>;
            case "Drafted":
                return <Badge className="rounded-full bg-amber-100 text-amber-700 hover:bg-amber-100 font-bold text-xs px-3 py-1 border-0">Drafted</Badge>;
            default:
                return <Badge className="rounded-full bg-slate-100 text-slate-600 hover:bg-slate-100 font-bold text-xs px-3 py-1 border-0">{status || "No Status"}</Badge>;
        }
    };

    const fetchAllocationData = async () => {
        try {
            const token = await getToken();
            const response = await featchInventoryAllocation(token, { packId, limit: allocationLimit, offset: allocationOffset });
            setItemAllocation(response?.data?.items || []);
            setAllocationTotal(response?.data.total || 0);
        } catch (error) {
            console.error("Error fetching item allocation:", error);
        }
    };

    useEffect(() => {
        if (packId) {
            fetchAllocationData();
        }
    }, [packId, getToken, allocationLimit, allocationOffset]);

    const handleDeleteAllocation = async (ID, item) => {
        try {
            const token = await getToken();
            const payload = {
                id: ID,
                item_id: item.item_id,
                count: item.usage_count,
            }
            const response = await deleteInventoryAllocation(token, payload);

            if (response.message === "success") {
                toast.success("Allocation deleted successfully!", { position: "bottom-right" });
                setItemAllocation((prev) => prev.filter((item) => item.id !== ID));
            }
        } catch (error) {
            console.error("Error deleting allocation:", error);
            toast.error("Failed to delete allocation!", { position: "bottom-right" });
        }
    };

    const handleEditProductionID = async (item, selectedID) => {
        try {
            const token = await getToken();
            const payload = {
                packId: packId,
                casingId: item.type === "casing" ? selectedID : (packData?.casing_id || ""),
                wireHarnessId: item.type === "wire" ? selectedID : (packData?.wire_harness_id || "")
            };

            const response = await updatePackProduction(token, payload);
            if (response.message === "success") {
                toast.success(`${item.type === "casing" ? "Casing No" : "Wire Harness No"} updated successfully!`, { position: "bottom-right" });
                setIsOpen(false);
                fetchPackData();
            } else {
                toast.error("Error updating record!", { position: "bottom-right" });
            }
        } catch (error) {
            console.error("Error updating production ID:", error);
            toast.error("Error updating record!", { position: "bottom-right" });
        }
    };

    if (isLoading) {
        return (
            <div className="w-full space-y-6">
                {/* Header Skeleton */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/70 flex flex-col sm:flex-row justify-between items-center gap-4 animate-pulse">
                    <div className="flex items-center gap-4">
                        <div className="h-8 w-64 bg-slate-200 rounded-xl"></div>
                        <div className="h-6 w-20 bg-slate-100 rounded-full"></div>
                    </div>
                    <div className="h-10 w-28 bg-slate-200 rounded-xl"></div>
                </div>

                <div className="space-y-6">
                    {/* Pack Details Skeleton */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70 animate-pulse">
                        <div className="h-6 w-40 bg-slate-200 rounded-lg mb-5"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
                            <div className="flex justify-between items-center py-1.5">
                                <div className="h-4 w-24 bg-slate-200 rounded"></div>
                                <div className="h-4 w-32 bg-slate-100 rounded"></div>
                            </div>
                            <div className="flex justify-between items-center py-1.5">
                                <div className="h-4 w-16 bg-slate-200 rounded"></div>
                                <div className="h-4 w-48 bg-slate-100 rounded"></div>
                            </div>
                        </div>
                    </div>

                    {/* Product Specifications Skeleton */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70 animate-pulse">
                        <div className="flex justify-between items-center mb-5">
                            <div className="h-6 w-48 bg-slate-200 rounded-lg"></div>
                            <div className="flex gap-2.5">
                                <div className="h-9 w-20 bg-slate-200 rounded-xl"></div>
                                <div className="h-9 w-24 bg-slate-200 rounded-xl"></div>
                            </div>
                        </div>
                        <div className="h-14 w-full bg-slate-100 rounded-xl"></div>
                    </div>

                    {/* Items Allocation Skeleton */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70 animate-pulse">
                        <div className="h-6 w-40 bg-slate-200 rounded-lg mb-5"></div>
                        <div className="grid sm:grid-cols-6 grid-cols-1 gap-4 border-b border-slate-100 pb-2">
                            <div className="h-3 w-20 bg-slate-200 rounded"></div>
                            <div className="h-3 w-24 bg-slate-200 rounded"></div>
                            <div className="h-3 w-12 bg-slate-200 rounded"></div>
                            <div className="h-3 w-20 bg-slate-200 rounded"></div>
                            <div className="h-3 w-24 bg-slate-200 rounded"></div>
                            <div className="h-3 w-16 bg-slate-200 rounded ml-auto"></div>
                        </div>
                        {Array.from({ length: 2 }).map((_, i) => (
                            <div key={i} className="grid sm:grid-cols-6 grid-cols-1 gap-4 py-3 border-b border-slate-100 items-center">
                                <div className="h-4 w-24 bg-slate-200 rounded"></div>
                                <div className="h-4 w-32 bg-slate-100 rounded"></div>
                                <div className="h-4 w-8 bg-slate-200 rounded"></div>
                                <div className="h-4 w-24 bg-slate-100 rounded"></div>
                                <div className="h-4 w-32 bg-slate-100 rounded"></div>
                                <div className="flex justify-end gap-2">
                                    <div className="h-6 w-6 bg-slate-200 rounded-lg"></div>
                                    <div className="h-6 w-6 bg-slate-200 rounded-lg"></div>
                                </div>
                            </div>
                        ))}
                        <div className="flex justify-between items-center pt-4 mt-2">
                            <div className="h-4 w-32 bg-slate-200 rounded"></div>
                            <div className="h-8 w-64 bg-slate-100 rounded-lg"></div>
                        </div>
                    </div>

                    {/* Items Usage Skeleton */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70 animate-pulse">
                        <div className="flex justify-between items-center mb-5">
                            <div className="h-6 w-40 bg-slate-200 rounded-lg"></div>
                            <div className="h-10 w-28 bg-slate-200 rounded-xl"></div>
                        </div>
                        <div className="grid sm:grid-cols-5 grid-cols-1 gap-4 border-b border-slate-100 pb-2">
                            <div className="h-3 w-20 bg-slate-200 rounded"></div>
                            <div className="h-3 w-24 bg-slate-200 rounded"></div>
                            <div className="h-3 w-20 bg-slate-200 rounded"></div>
                            <div className="h-3 w-20 bg-slate-200 rounded"></div>
                            <div className="h-3 w-24 bg-slate-200 rounded"></div>
                        </div>
                        {Array.from({ length: 2 }).map((_, i) => (
                            <div key={i} className="grid sm:grid-cols-5 grid-cols-1 gap-4 py-3 border-b border-slate-100 items-center">
                                <div className="h-4 w-24 bg-slate-200 rounded"></div>
                                <div className="h-4 w-32 bg-slate-100 rounded"></div>
                                <div className="h-4 w-12 bg-slate-200 rounded"></div>
                                <div className="h-4 w-24 bg-slate-100 rounded"></div>
                                <div className="h-4 w-32 bg-slate-100 rounded"></div>
                            </div>
                        ))}
                        <div className="flex justify-between items-center pt-4 mt-2">
                            <div className="h-4 w-32 bg-slate-200 rounded"></div>
                            <div className="h-8 w-64 bg-slate-100 rounded-lg"></div>
                        </div>
                    </div>

                    {/* Hardware & Design Request Skeleton */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70 animate-pulse">
                        <div className="h-6 w-56 bg-slate-200 rounded-lg mb-4"></div>
                        <div className="space-y-2">
                            <div className="h-4 w-3/4 bg-slate-100 rounded"></div>
                            <div className="h-4 w-1/2 bg-slate-100 rounded"></div>
                        </div>
                    </div>

                    {/* Workers and Timestamps Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70 animate-pulse">
                            <div className="h-4 w-24 bg-slate-200 rounded mb-4"></div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="h-16 w-full bg-slate-50 border border-slate-100 rounded-xl"></div>
                                <div className="h-16 w-full bg-slate-50 border border-slate-100 rounded-xl"></div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70 animate-pulse">
                            <div className="h-4 w-24 bg-slate-200 rounded mb-4"></div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="h-16 w-full bg-slate-50 border border-slate-100 rounded-xl"></div>
                                <div className="h-16 w-full bg-slate-50 border border-slate-100 rounded-xl"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (isError) {
        return <ErrorState errorMessage={errorMessage} />;
    }

    return (
        <div className="w-full space-y-6">

            {/* Header Section */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/70 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
                        {packData?.serial_no}
                    </h1>
                    {getStatusBadge(packData?.status)}
                </div>
                <div className="flex gap-4 items-center">
                    <div>
                        {(user?.publicMetadata?.role === Roles.HEAD || user?.publicMetadata?.role === Roles.SUPER_ADMIN || user?.publicMetadata?.role === Roles.INVENTORY_MANAGER) && (
                            <DeleteAlert handleDelete={handleDelete} packData={packData} type="pack" />
                        )}
                    </div>

                    <div>
                        <Button
                            onClick={triggerSerialPrint}
                            variant="outline"
                            className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl h-10 px-4"
                        >
                            <Printer className="w-4 h-4 mr-2" /> Print S/N
                        </Button>
                    </div>


                </div>
            </div>

            <div className="space-y-6">
                {/* Pack Details Card */}
                {user?.publicMetadata?.role !== Roles.WAREHOUSE_STAFF && (
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                        <h3 className="text-lg font-bold mb-5 text-slate-800">Pack Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">

                            {/* Order No */}
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline py-1.5">
                                <span className="text-slate-500 text-sm font-semibold">Order No:</span>
                                <div className="flex items-center gap-2 mt-1 sm:mt-0 font-medium text-sm">
                                    <button
                                        type="button"
                                        className="flex items-center justify-center transition-transform hover:scale-110"
                                        onClick={() => {
                                            setCurrentEditItem({ ...packData, type: "order" });
                                            setIsOpen(true);
                                        }}
                                        title="Edit Order No"
                                    >
                                        <Pencil size={14} className="text-slate-400 hover:text-blue-600 transition-colors" />
                                    </button>
                                    {packData?.order_no ? (
                                        <span
                                            onClick={() => navigate(`/orders/${packData?.order_id}`)}
                                            className="text-blue-600 font-medium cursor-pointer hover:text-blue-800 hover:underline transition-colors"
                                        >
                                            {packData.order_no}
                                        </span>
                                    ) : (
                                        <span className="text-slate-300 italic font-normal">Unassigned</span>
                                    )}
                                </div>
                            </div>

                            {/* Casing No */}
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline py-1.5">
                                <span className="text-slate-500 text-sm font-semibold">Casing No:</span>
                                <div className="flex items-center gap-2 mt-1 sm:mt-0 font-medium text-sm">
                                    <button
                                        type="button"
                                        className="flex items-center justify-center transition-transform hover:scale-110"
                                        onClick={() => {
                                            setCurrentEditItem({ ...packData, type: "casing" });
                                            setIsOpen(true);
                                        }}
                                        title="Edit Casing No"
                                    >
                                        <Pencil size={14} className="text-slate-400 hover:text-blue-600 transition-colors" />
                                    </button>
                                    {packData?.casing_no ? (
                                        <span className="text-slate-800 font-medium">
                                            {packData.casing_no}
                                        </span>
                                    ) : (
                                        <span className="text-slate-300 italic font-normal">Unassigned</span>
                                    )}
                                </div>
                            </div>

                            {/* Wire Harness No */}
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline py-1.5">
                                <span className="text-slate-500 text-sm font-semibold">Wire Harness No:</span>
                                <div className="flex items-center gap-2 mt-1 sm:mt-0 font-medium text-sm">
                                    <button
                                        type="button"
                                        className="flex items-center justify-center transition-transform hover:scale-110"
                                        onClick={() => {
                                            setCurrentEditItem({ ...packData, type: "wire" });
                                            setIsOpen(true);
                                        }}
                                        title="Edit Wire Harness No"
                                    >
                                        <Pencil size={14} className="text-slate-400 hover:text-blue-600 transition-colors" />
                                    </button>
                                    {packData?.wire_harness_no ? (
                                        <span className="text-slate-800 font-medium">
                                            {packData.wire_harness_no}
                                        </span>
                                    ) : (
                                        <span className="text-slate-300 italic font-normal">Unassigned</span>
                                    )}
                                </div>
                            </div>

                            <DetailRow label="Note" value={packData?.note} />
                        </div>
                    </div>
                )}

                {/* Product Specifications Card */}
                {user?.publicMetadata?.role !== Roles.WAREHOUSE_STAFF && (
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-lg font-bold text-slate-800">Product Specifications</h3>
                            <div className="flex gap-2.5">
                                <Button
                                    onClick={() => generateSticker('print')}
                                    variant="outline"
                                    size="sm"
                                    className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl h-9 px-3 text-xs font-semibold"
                                >
                                    <Printer className="w-3.5 h-3.5 mr-1.5" /> Print
                                </Button>
                                <Button
                                    onClick={() => generateSticker('download')}
                                    variant="outline"
                                    size="sm"
                                    className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl h-9 px-3 text-xs font-semibold"
                                >
                                    <Download className="w-3.5 h-3.5 mr-1.5" /> Download
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="border border-slate-200/70 rounded-2xl overflow-hidden shadow-sm">
                                <div
                                    className="flex items-center justify-between p-4 bg-slate-50/70 cursor-pointer transition-colors hover:bg-slate-100"
                                    onClick={() => togleProductDetails(packData?.product_id)}
                                >
                                    <h3 className="text-base font-bold text-slate-800">
                                        {packData?.name}
                                    </h3>
                                    {showProductDetails[packData?.product_id] ? (
                                        <ChevronUp className="h-5 w-5 text-slate-500" />
                                    ) : (
                                        <ChevronDown className="h-5 w-5 text-slate-500" />
                                    )}
                                </div>

                                {showProductDetails[packData?.product_id] && (
                                    <div className="p-5 bg-white border-t border-slate-100 space-y-3">
                                        <InfoItem label="Category" value={packData?.category} />
                                        <InfoItem label="Base Price" value={packData?.base_price != null ? `LKR ${packData.base_price}` : undefined} />
                                        <InfoItem label="Pack Type" value={packData?.type} />
                                        <InfoItem label="Capacity" value={packData?.capacity ? `${packData.capacity} Ah` : undefined} />
                                        <InfoItem label="Voltage" value={packData?.voltage ? `${packData.voltage} V` : undefined} />
                                        <InfoItem label="Cell Type" value={packData?.cell_type} />
                                        <InfoItem label="Cell Count" value={packData?.cell_count} />
                                        <InfoItem label="BMS Type" value={packData?.bms_type} />
                                        <InfoItem label="Monitor" value={packData?.monitor} />
                                        <InfoItem label="Specifications" value={packData?.specifications} />
                                        <InfoItem label="Is Active" value={packData?.is_active ? "Yes" : "No"} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Items Allocation Card */}
                {user?.publicMetadata?.role !== Roles.WAREHOUSE_STAFF && (
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                        <h3 className="text-lg font-bold mb-5 text-slate-800">Items Allocation</h3>

                        <div className="space-y-3">
                            <div className="grid sm:grid-cols-6 grid-cols-1 text-xs text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 pb-2">
                                <span>Item Code</span>
                                <span>Item Name</span>
                                <span>Count</span>
                                <span>Allocator</span>
                                <span>Time Stamp</span>
                                <span className="text-right">Actions</span>
                            </div>

                            {itemAllocation?.map((item) => (
                                <div key={item.id} className="grid sm:grid-cols-6 grid-cols-1 items-center text-sm text-slate-700 font-medium border-b border-slate-100 py-3">
                                    <span className="font-mono text-xs">{item.item_code}</span>
                                    <span>{item.item_name}</span>
                                    <span className="font-bold">{item.usage_count}</span>
                                    <span>{item.user_name}</span>
                                    <span className="text-xs text-slate-500">{new Date(item.created_at).toLocaleString()}</span>

                                    {user?.publicMetadata?.role !== Roles.WAREHOUSE_STAFF && (
                                        <div className="flex justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setCurrentEditItem({ ...item, type: "allocation" });
                                                    setIsOpen(true);
                                                }}
                                                className="p-1 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                                                title="Edit Allocation"
                                            >
                                                <Pencil size={15} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteAllocation(item.id, item)}
                                                className="p-1 rounded-lg hover:bg-rose-50 text-rose-500 transition-colors"
                                                title="Delete Allocation"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 mt-4 border-t border-slate-100">
                            <div className="text-xs text-slate-500 font-medium mb-2 sm:mb-0">
                                Total: {allocationTotal || 0} allocations
                            </div>
                            <div className="flex justify-center">
                                <PaginationComponent total={allocationTotal} limit={allocationLimit} offset={allocationOffset} setOffset={setAllocationOffset} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Items Usage Card */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                    <div className="flex gap-6 mb-5 items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-800">Items Usage</h3>
                        <AddUsage
                            type="pack"
                            packData={packData}
                            onUpdate={fetchUsageData}
                        />
                    </div>

                    {isUsageLoading ? (
                        <div className="space-y-2 animate-pulse">
                            {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-slate-100 rounded-xl w-full"></div>)}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="grid sm:grid-cols-5 grid-cols-1 text-xs text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 pb-2 pl-2">
                                <span>Item Code</span>
                                <span>Item Name</span>
                                <span>Total Usage</span>
                                <span>User</span>
                                <span>Time Stamp</span>
                            </div>

                            {groupedUsageItems.length === 0 && <div className="text-sm text-slate-400 py-4 text-center">No usage history found.</div>}

                            {groupedUsageItems.map((group, index) => (
                                <div key={`${group.key_id}-${index}`} className="border-b border-slate-100 last:border-0 rounded-xl overflow-hidden">
                                    <div
                                        className={`grid sm:grid-cols-5 grid-cols-1 text-sm text-slate-700 font-medium py-3 px-3 items-center cursor-pointer transition-colors hover:bg-slate-50 ${expandedUsageId === group.key_id ? 'bg-blue-50/50' : ''}`}
                                        onClick={() => toggleUsageRow(group.key_id)}
                                    >
                                        <span className="font-mono text-xs">{group.display_code}</span>
                                        <span className="font-semibold text-slate-800">{group.display_name}</span>
                                        <span className="font-extrabold text-blue-600">{group.total_usage}</span>
                                        <span>{group.user_name}</span>
                                        <span className="flex justify-between items-center w-full text-xs text-slate-500">
                                            {group.last_updated ? new Date(group.last_updated).toLocaleString() : "N/A"}
                                            <div className="p-1 rounded-full hover:bg-slate-200 text-slate-400">
                                                {expandedUsageId === group.key_id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </div>
                                        </span>
                                    </div>

                                    {expandedUsageId === group.key_id && (
                                        <div className="bg-slate-50 p-4 border-t border-slate-200/70 animate-in slide-in-from-top-2 duration-200">
                                            <p className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">
                                                Used Item Codes ({group.details?.length || 0})
                                            </p>
                                            <div className="max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
                                                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                                    {group.details?.map((subItem, idx) => (
                                                        <div
                                                            key={`${subItem.usage_id}-${idx}`}
                                                            className="bg-white border border-slate-200/70 rounded-xl px-3 py-2 flex items-center justify-between shadow-sm h-9"
                                                        >
                                                            <span className="text-xs font-mono text-slate-700 font-medium truncate w-full" title={subItem.item_code}>
                                                                {subItem.item_code || "No Code"}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 mt-4 border-t border-slate-100">
                        <div className="text-xs text-slate-500 font-medium mb-2 sm:mb-0">
                            Total Records: {total || 0}
                        </div>
                        <div className="flex justify-center">
                            <PaginationComponent total={total} limit={limitUsage} offset={offsetUsage} setOffset={setOffsetUsage} />
                        </div>
                    </div>
                </div>

                {/* Hardware and Design Request Card */}
                {user?.publicMetadata?.role !== Roles.WAREHOUSE_STAFF && (
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                        <h3 className="text-lg font-bold mb-4 text-slate-800">Hardware and Design Request</h3>
                        <div className="flex flex-col space-y-2 text-slate-600 text-sm">
                            {packData?.cad_files && packData?.cad_files?.file_name?.length > 0 && (
                                <p>
                                    CAD files "<strong>{packData?.cad_files?.file_name.join(", ")}</strong>" were sent to <strong>{packData?.cad_files?.email.join(", ")}</strong>.
                                </p>
                            )}
                            {packData?.designer?.description && packData?.designer?.email?.length > 0 && (
                                <p>
                                    Design description "<strong>{packData.designer.description}</strong>" was sent to <strong>{packData.designer.email.join(", ")}</strong>.
                                </p>
                            )}
                            {(!packData?.cad_files?.file_name?.length && !packData?.designer?.description) && (
                                <p className="text-slate-400 italic">No hardware or design requests found.</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Workers & Timestamps Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Workers</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InfoBlock icon={User} label="Supervisor" value={packData?.supervisor} />
                            <InfoBlock
                                icon={Users}
                                label="Assignee"
                                value={
                                    Array.isArray(packData?.assignee)
                                        ? packData.assignee.join(", ")
                                        : packData?.assignee
                                }
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Timestamps</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InfoBlock
                                icon={CalendarDays}
                                label="Created At"
                                value={packData?.created_at ? new Date(packData.created_at).toLocaleString() : undefined}
                            />
                            <InfoBlock
                                icon={Clock}
                                label="Last Updated"
                                value={packData?.updated_at ? new Date(packData.updated_at).toLocaleString() : undefined}
                            />
                        </div>
                    </div>
                </div>

            </div>



            {currentEditItem && (
                <EditUsageCount
                    type={currentEditItem.type}
                    item={currentEditItem}
                    handleEditCount={
                        currentEditItem.type === "allocation"
                            ? handleEditAllocationCount
                            : currentEditItem.type === "order"
                                ? handleEditOrder
                                : currentEditItem.type === "casing" || currentEditItem.type === "wire"
                                    ? handleEditProductionID
                                    : handleEditUsageCount
                    }
                    isOpen={isOpen}
                    setIsOpen={setIsOpen}
                />
            )}

            <div style={{ display: "none" }}>
                <div ref={componentRef} className="print-wrapper">
                    {printableItems.map((item, index) => (
                        <div key={index} className="barcode-label">
                            <img
                                src="/CoreSync-bw-long-logo.jpg"
                                alt="CoreSync Logo"
                                className="company-logo"
                            />
                            <div className="barcode-container">
                                <Barcode
                                    value={item}
                                    format="CODE128"
                                    displayValue={false}
                                    margin={0}
                                    background="transparent"
                                />
                            </div>
                            <div className="item-code">{item}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function DetailRow({ label, value }) {
    if (label.toLowerCase() === "recording" && value) {
        return (
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1.5">
                <span className="text-slate-500 text-sm font-semibold">{label}:</span>
                <div className="flex items-center gap-2 mt-1 sm:mt-0">
                    <audio controls className="h-10">
                        <source src={value} type="audio/mpeg" />
                        Your browser does not support the audio element.
                    </audio>
                </div>
            </div>
        );
    }
    return (
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline py-1.5">
            <span className="text-slate-500 text-sm font-semibold">{label}:</span>
            <span className="text-sm text-slate-800 font-medium mt-1 sm:mt-0">{value || "N/A"}</span>
        </div>
    );
}

function InfoItem({ label, value }) {
    return (
        <div className="flex flex-col sm:flex-row py-2 border-b border-slate-100 last:border-b-0">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider w-32 shrink-0">{label}:</span>
            <span className="text-sm text-slate-800 font-medium ml-0 sm:ml-4 mt-1 sm:mt-0">{value || "N/A"}</span>
        </div>
    );
}

function InfoBlock({ icon: Icon, label, value }) {
    return (
        <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/50 border border-slate-100">
            <div className="p-2 rounded-xl bg-white shadow-sm border border-slate-200/70 flex items-center justify-center shrink-0">
                <Icon size={16} className="text-slate-600" />
            </div>
            <div className="flex flex-col">
                <span className="uppercase tracking-wider text-[10px] text-slate-400 font-bold mb-0.5">
                    {label}
                </span>
                <span className="font-semibold text-slate-700 text-sm">
                    {value || "N/A"}
                </span>
            </div>
        </div>
    );
}

export default PackView;
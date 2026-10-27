import { featchInventoryRestock, featchInventoryUsage, fetchInventoryItemById, deleteInventoryUsage, updateInventoryRestockPrintStatus, featchInventoryAllocation } from "@/api/inventoryApi";
import { Roles } from "@/const/const";
import { useAuth, useUser } from "@clerk/clerk-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { InventoryDeleteAlert } from "./InventoryItemDeleteAlert";
import { LockIcon, Printer, ChevronDown, ChevronUp, Download } from "lucide-react";
import { PaginationComponent } from "@/components/Pagination";
import InventoryTemplate from "./InventoryPdf";
import { EditInventoryItem } from "./EditInventoryItem";
import { ErrorState } from "@/components/Skeleton";
import { Button } from "@/components/ui/button";
import { useReactToPrint } from "react-to-print";
import Barcode from "react-barcode";
import { flushSync } from "react-dom";
import bwipjs from 'bwip-js';
import jsPDF from 'jspdf';
import { createAuditLog } from "@/api/settingApi";
import { featchRepairUsage } from "@/api/repair";

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"

function InventoryView() {
    const { getToken } = useAuth();
    const { user } = useUser();
    const { itemId } = useParams();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const [totalUsage, setTotalUsage] = useState(0);
    const [repairTotalUsage, setRepairTotalUsage] = useState(0);
    const [restockTotal, setRestockTotal] = useState(0);
    const [allocationTotal, setAllocationTotal] = useState(0);

    const [limitUsage, setLimitUsage] = useState(5);
    const [limitRestock, setLimitRestock] = useState(5);

    const [offsetUsage, setOffsetUsage] = useState(0);
    const [allocationLimit, seAllocationLimit] = useState(5);
    const [allocationOffset, setAllocationOffset] = useState(0);

    const [limitRepairUsage, setLimitRepairUsage] = useState(5);
    const [offsetRepairUsage, setOffseRepairtUsage] = useState(0);
    const [offsetRestock, setOffsetRestock] = useState(0);

    const [itemUsageData, setItemUsageData] = useState([]);
    const [repairUsageData, setRepairUsageData] = useState([]);
    const [inventoryData, setInventoryData] = useState({});
    const [restockData, setRestockData] = useState([]);

    const [itemAllocation, setItemAllocation] = useState([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isUsageLoading, setIsUsageLoading] = useState(false);
    const [isRepairLoading, setIsRepairLoading] = useState(true);
    const [isRepairUsageLoading, setIsRepairUsageLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [isOpen, setIsOpen] = useState(false);
    const [currentEditItem, setCurrentEditItem] = useState(null);

    const navigate = useNavigate();

    const [expandedRestockId, setExpandedRestockId] = useState(null);
    const [expandedUsageId, setExpandedUsageId] = useState(null);
    const [expandedRepairId, setExpandedRepairId] = useState(null);

    const [printingRestockId, setPrintingRestockId] = useState(null);

    const toggleRestockRow = (id) => {
        setExpandedRestockId(expandedRestockId === id ? null : id);
    };

    const toggleUsageRow = (id) => {
        setExpandedUsageId(expandedUsageId === id ? null : id);
    };

    const toggleRepairUsageRow = (id) => {
        setExpandedRepairId(expandedRepairId === id ? null : id);
    };

    const componentRef = useRef();
    const [printableItems, setPrintableItems] = useState([]);

    const handleAfterPrint = async () => {
        if (!printingRestockId) return;

        try {
            const token = await getToken();

            await updateInventoryRestockPrintStatus(token, {
                id: printingRestockId,
                is_print: true
            });

            toast.success("Print status updated successfully");
        } catch (error) {
            console.error("Failed to update print status:", error);
            toast.error("Printed, but failed to update status on server.");
        } finally {
            setPrintingRestockId(null);
        }
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
            transform: translateX(2mm); 
            margin: 0;
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
            width: 100% !important;
            margin: 0 auto !important;
            max-width: 45mm !important; 
            height: auto !important;
            max-height: 14mm !important; 
        }
    `
    });

    const triggerBarcodePrint = async (items, restockId) => {
        if (!items || items.length === 0) {
            toast.error("No barcodes available to print");
            return;
        }
        setPrintingRestockId(restockId);

        flushSync(() => { setPrintableItems(items); });
        setTimeout(() => { handlePrint(); }, 50);
    };

    const handleDownloadRestock = async (restockItem) => {
        const items = restockItem.inventory_items;

        if (!items || items.length === 0) {
            toast.error("No items found to generate barcodes.");
            return;
        }

        try {
            const doc = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: [50, 25]
            });

            for (let i = 0; i < items.length; i++) {
                const itemCode = items[i].item_code;

                if (i > 0) {
                    doc.addPage([50, 25], 'landscape');
                }

                const canvas = document.createElement('canvas');

                try {
                    bwipjs.toCanvas(canvas, {
                        bcid: 'code128',
                        text: itemCode,
                        scale: 3,
                        height: 10,
                        includetext: false,
                        textxalign: 'center',
                    });

                    const imgData = canvas.toDataURL('image/png');

                    doc.setFontSize(8);
                    doc.setFont("helvetica", "bold");
                    doc.text("CoreSync Pvt. Ltd", 25, 4, { align: "center" });

                    doc.addImage(imgData, 'PNG', 5, 5, 40, 13);

                    doc.setFontSize(9);
                    doc.setFont("helvetica", "bold");
                    doc.text(itemCode, 25, 22, { align: "center" });

                } catch (err) {
                    console.error(`Failed to generate barcode for ${itemCode}`, err);
                }
            }
            const fileName = `Barcodes_Restock_${inventoryData?.item_code || 'Item'}.pdf`;
            doc.save(fileName);
            toast.dismiss();
            toast.success("PDF Downloaded successfully!");
            const token = await getToken();
            await createAuditLog(token, {
                action: "Barcode Download",
                status_code: 200,
                user: user.id,
                description: `${user.firstName} ${user.lastName} downloaded the barcodes for ${inventoryData?.item_code || "an item"}.`,
            });
        } catch (error) {
            console.error("PDF generation error:", error);
            toast.dismiss();
            toast.error("Failed to generate PDF");
        }
    };

    useEffect(() => {
        const fetchInventoryData = async () => {
            try {
                setIsLoading(true);
                const token = await getToken();
                const response = await fetchInventoryItemById(token, itemId);
                setInventoryData(response?.data);
            } catch (error) {
                setIsError(true);
                setErrorMessage("Error fetching inventory data: " + error.message);
            } finally {
                setIsLoading(false);
                setIsError(false);
            }
        };
        fetchInventoryData();
    }, [getToken, itemId]);

    const [barcodeImgUrl, setBarcodeImgUrl] = useState("");
    const generateBarcodeDataUrlLocal = async (text) => {
        try {
            let canvas = document.createElement('canvas');
            bwipjs.toCanvas(canvas, {
                bcid: 'code128', text: text, scale: 3, height: 10, includetext: true, textxalign: 'center',
            });
            return canvas.toDataURL('image/png');
        } catch (e) {
            console.error(e);
            return '';
        }
    }
    useEffect(() => {
        if (inventoryData?.item_code) {
            generateBarcodeDataUrlLocal(inventoryData?.item_code).then((url) => {
                if (url) setBarcodeImgUrl(url);
            });
        }
    }, [inventoryData]);

    const fetchUsageData = async () => {
        try {
            setIsUsageLoading(true);
            setExpandedUsageId(null);

            const token = await getToken();
            const response = await featchInventoryUsage(token, { itemId: itemId, limit: limitUsage, offset: offsetUsage });

            const items = response?.data?.items || [];
            setItemUsageData(items);
            setTotalUsage(response?.data?.total || 0);
        } catch (error) {
            console.error("Error fetching usage data:", error);
            setItemUsageData([]);
        } finally {
            setIsUsageLoading(false);
        }
    };

    const fetchRepairhUsageData = async () => {
        try {
            setIsRepairUsageLoading(true);
            setExpandedRepairId(null);

            const token = await getToken();
            const response = await featchRepairUsage(token, { itemId: itemId, limit: limitRepairUsage, offset: offsetRepairUsage });

            const items = response?.data?.items || [];
            setRepairUsageData(items);
            setRepairTotalUsage(response?.data?.total || 0);
        } catch (error) {
            console.error("Error fetching repair usage data:", error);
            setRepairUsageData([]);
        } finally {
            setIsRepairUsageLoading(false);
        }
    };

    const fetchAllocationData = async () => {
        try {
            const token = await getToken()
            const response = await featchInventoryAllocation(token, { itemId, limit: allocationLimit, offset: allocationOffset })
            setItemAllocation(response?.data?.items || [])
            setAllocationTotal(response?.data.total || 0)
        } catch (error) {
            console.error("Error fetching item allocation:", error)
        }
    }

    useEffect(() => {
        fetchUsageData();
        fetchRepairhUsageData();
        fetchAllocationData();
    }, [getToken, limitUsage, offsetUsage, limitRepairUsage, offsetRepairUsage, allocationLimit, allocationOffset]);

    const fetchRestockData = async () => {
        try {
            const token = await getToken();
            const response = await featchInventoryRestock(token, { itemId: itemId, limit: limitRestock, offset: offsetRestock });
            setRestockData(response?.data?.items || []);
            setRestockTotal(response?.data?.total || 0);
            setExpandedRestockId(null);
        } catch (error) {
            console.error("Error fetching restock data:", error);
        }
    };
    useEffect(() => {
        fetchRestockData();
    }, [getToken, limitRestock, offsetRestock]);

    const handleInventoryUpdate = (updatedFields) => {
        setInventoryData((prev) => ({ ...prev, ...updatedFields }));
    };

    const handleDeleteUsage = async (usageId, itemId, count) => {
        try {
            const token = await getToken();
            const payload = { id: usageId, item_id: itemId, usage_count: count };
            const response = await deleteInventoryUsage(token, payload);
            if (response.message === "success") {
                toast.success("Usage item removed successfully", { position: "bottom-right" });
                fetchUsageData();
            }
        } catch (error) {
            console.error("Delete failed", error);
            toast.error("Failed to remove item usage");
        }
    };

    const handleDownloadLog = async () => {
        try {
            const token = await getToken();
            await createAuditLog(token, {
                action: "PDF Downloaded",
                status_code: 200,
                user: user.id,
                description: `${user.firstName} ${user.lastName} downloaded the ${inventoryData?.item_code} report as a PDF file.`,
            });
        } catch (error) {
            console.error("Failed to log download action:", error);
        }
    };

    if (user?.publicMetadata?.role === Roles.WAREHOUSE_STAFF) {
        return (
            <div className="flex items-center justify-center min-h-[70vh] w-full px-4">
                <div className="bg-white shadow-sm rounded-2xl p-8 max-w-md text-center border border-red-100">
                    <div className="flex flex-col items-center justify-center gap-3">
                        <LockIcon className="w-12 h-12 text-red-500" />
                        <h1 className="text-xl font-bold text-gray-800">Access Denied</h1>
                        <p className="text-sm text-gray-500">You are not authorized to access this page.</p>
                        <Button className="mt-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm" onClick={() => navigate("/")}>Go to Dashboard</Button>
                    </div>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="w-full space-y-6">
                {/* Header Skeleton */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/70 flex flex-col sm:flex-row justify-between items-center gap-4 animate-pulse">
                    <div className="h-8 w-48 bg-slate-200 rounded-xl"></div>
                    <div className="flex flex-wrap items-center gap-2.5">
                        <div className="h-10 w-24 bg-slate-200 rounded-xl"></div>
                        <div className="h-10 w-24 bg-rose-100 rounded-xl"></div>
                        <div className="h-10 w-28 bg-slate-200 rounded-xl"></div>
                    </div>
                </div>

                {/* Primary Details Skeleton */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70 animate-pulse">
                    <div className="h-6 w-40 bg-slate-200 rounded-lg mb-6"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                        <div className="space-y-4 py-2">
                            {Array.from({length: 4}).map((_, i) => (
                                <div key={i} className="flex justify-between items-center">
                                    <div className="h-4 w-24 bg-slate-200 rounded"></div>
                                    <div className="h-4 w-32 bg-slate-100 rounded"></div>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center justify-center bg-slate-50/50 rounded-xl p-4 border border-slate-100 h-32">
                            <div className="w-48 h-20 bg-slate-200/50 rounded-lg"></div>
                        </div>
                    </div>
                </div>

                {/* List Skeleton */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70 animate-pulse">
                    <div className="h-6 w-40 bg-slate-200 rounded-lg mb-6"></div>
                    <div className="space-y-4">
                        <div className="h-8 w-full bg-slate-100 rounded-lg"></div>
                        <div className="h-12 w-full bg-slate-50 rounded-xl border border-slate-100"></div>
                        <div className="h-12 w-full bg-slate-50 rounded-xl border border-slate-100"></div>
                        <div className="h-12 w-full bg-slate-50 rounded-xl border border-slate-100"></div>
                    </div>
                </div>
            </div>
        );
    }
    
    if (isError) return <ErrorState errorMessage={errorMessage} />;

    return (
        <>
            <div className="w-full space-y-6">

                {/* Header */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/70 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">{inventoryData?.item_code}</h1>
                    {
                        isMobile ? null : <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                            {user.publicMetadata.role == Roles.WAREHOUSE_STAFF || user.publicMetadata.role == Roles.FINANCE_HEAD || user.publicMetadata.role == Roles.READ_ONLY ? null : <EditInventoryItem itemData={inventoryData} onUpdate={handleInventoryUpdate} />}
                            {user.publicMetadata.role == Roles.WAREHOUSE_STAFF || user.publicMetadata.role == Roles.FINANCE_HEAD || user.publicMetadata.role == Roles.READ_ONLY ? null : <InventoryDeleteAlert itemData={inventoryData} />}
                            {user.publicMetadata.role == Roles.WAREHOUSE_STAFF || user.publicMetadata.role == Roles.FINANCE_HEAD || user.publicMetadata.role == Roles.READ_ONLY ? null : <PDFDownloadLink
                                document={<InventoryTemplate inventoryData={inventoryData} itemUsageData={itemUsageData} restockData={restockData} />}
                                fileName={`Inventory Item Report-${inventoryData?.item_code}.pdf`}
                                className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 h-10 px-4 py-2 transition-colors"
                                onClick={handleDownloadLog}
                            >
                                {({ loading }) => loading ? "Generating..." : "Download"}
                            </PDFDownloadLink>}
                        </div>
                    }
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                        <h3 className="text-lg font-bold mb-5 text-slate-800">Primary Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                            <div>
                                <DetailRow label="Item Name" value={inventoryData?.item_name} />
                                <DetailRow label="Quantity" value={inventoryData?.quantity} />
                                <DetailRow label="Threshold" value={inventoryData?.threshold} />
                                <DetailRow label="Unit Cost" value={`LKR ${Number(inventoryData.unit_cost).toLocaleString()}`} />
                            </div>
                            <div className="flex items-center justify-center bg-slate-50/50 rounded-xl p-4 border border-slate-100">
                                {inventoryData?.item_code && barcodeImgUrl ? (
                                    <img src={barcodeImgUrl} alt="Barcode" className="w-48 max-w-xs mx-auto h-24 object-contain" />
                                ) : <p className="text-rose-500 text-sm font-medium">No barcode available</p>}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                        <div className="flex gap-6 mb-5 items-center">
                            <h3 className="text-lg font-bold text-slate-800">Items Allocation</h3>
                        </div>

                        <div className="space-y-2">
                            <div className="grid sm:grid-cols-5 grid-cols-1 text-xs text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 pb-2">
                                <span>Order/Serial No</span>
                                <span>Count</span>
                                <span>Allocator</span>
                                <span>Time Stamp</span>
                                <span>Actions</span>
                            </div>
                            {
                                itemAllocation?.map((item) => (
                                    <div key={item.id} className="grid sm:grid-cols-5 grid-cols-1 text-xs text-slate-600 font-medium border-b border-slate-100 py-3 items-center">
                                        <span
                                            className="text-blue-600 cursor-pointer font-semibold hover:underline"
                                            onClick={() => { !item.serial_no ? navigate(`/orders/${item.order_id}`) : navigate(`/orders/packs/${item.pack_id}`) }}
                                        >
                                            {!item.serial_no ? `${item.order_type}${item.order_no}` : item.serial_no}
                                        </span>
                                        <span className="font-bold text-slate-900">{item.usage_count}</span>
                                        <span>{item.user_name}</span>
                                        <span>{new Date(item.created_at).toLocaleString()}</span>
                                        <span></span>
                                    </div>
                                ))
                            }
                        </div>
                        <div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between sm:space-x-2 py-4">
                                <div className="text-sm text-slate-500 mb-2 sm:mb-0">
                                    Total: {allocationTotal} Allocations.
                                </div>
                                <div className="flex justify-center">
                                    <PaginationComponent total={allocationTotal} limit={allocationLimit} offset={allocationOffset} setOffset={setAllocationOffset} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                        <div className="flex gap-6 mb-5 items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-800">Items Usage</h3>
                        </div>

                        <Tabs defaultValue="order" className="w-full">
                            <TabsList className="bg-slate-100 p-1 rounded-xl mb-4">
                                <TabsTrigger value="order" className="rounded-lg text-xs font-semibold">Orders</TabsTrigger>
                                <TabsTrigger value="repair" className="rounded-lg text-xs font-semibold">Repairs</TabsTrigger>
                            </TabsList>
                            <TabsContent value="order">
                                {isUsageLoading ? (
                                    <div className="space-y-3 py-4 animate-pulse">
                                        {Array.from({ length: 3 }).map((_, i) => (
                                            <div key={i} className="h-12 w-full bg-slate-50 rounded-xl border border-slate-100"></div>
                                        ))}
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-2">
                                            <div className="grid sm:grid-cols-5 grid-cols-1 text-xs text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 pb-2 pl-2">
                                                <span>Order / Serial No</span>
                                                <span>Total Usage</span>
                                                <span>User</span>
                                                <span>Time Stamp</span>
                                                <span>Actions</span>
                                            </div>

                                            {itemUsageData?.length === 0 && <div className="text-sm text-slate-400 py-4 text-center">No usage history found.</div>}

                                            {itemUsageData?.map((item, index) => (
                                                <div key={`${item.id}-${index}`} className="border-b border-slate-100 last:border-0">
                                                    <div
                                                        className={`grid sm:grid-cols-5 grid-cols-1 text-xs text-slate-700 font-medium py-3 pl-2 items-center cursor-pointer transition-colors hover:bg-slate-50/80 rounded-xl ${expandedUsageId === item.id ? 'bg-blue-50/50' : ''}`}
                                                        onClick={() => toggleUsageRow(item.id)}
                                                    >
                                                        <span
                                                            className={`${item.order_id || item.pack_id ? 'text-blue-600 cursor-pointer font-semibold hover:underline' : 'text-slate-400'}`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (item.order_id) {
                                                                    navigate(`/orders/${item.order_id}`);
                                                                } else if (item.pack_id) {
                                                                    navigate(`/orders/packs/${item.pack_id}`);
                                                                }
                                                            }}
                                                        >
                                                            {item.order_id ? (
                                                                <>{item.order_type}{item.order_no}</>
                                                            ) : item.pack_id ? (
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className="bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider">PACK</span>
                                                                    <span>{item.serial_no}</span>
                                                                </div>
                                                            ) : (
                                                                <span className="italic text-slate-400">Independent</span>
                                                            )}
                                                        </span>

                                                        <span className="font-bold text-blue-600">{item.total_usage}</span>
                                                        <span>{item.user_name}</span>
                                                        <span>{item.items && item.items.length > 0 ? new Date(item.items[0].created_at).toLocaleString() : "N/A"}</span>

                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 transition-colors"
                                                                onClick={(e) => { e.stopPropagation(); toggleUsageRow(item.id); }}
                                                            >
                                                                {expandedUsageId === item.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {expandedUsageId === item.id && (
                                                        <div className="bg-slate-50 p-4 border-t border-slate-100 rounded-xl my-2 animate-in slide-in-from-top-2 duration-200">
                                                            <p className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">
                                                                Used Item Codes ({item.items?.length || 0})
                                                            </p>

                                                            <div className="max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
                                                                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                                                    {item.items?.map((subItem, idx) => (
                                                                        <div
                                                                            key={`${subItem.usage_id}-${idx}`}
                                                                            className="bg-white border border-slate-200/70 rounded-xl px-3 py-1.5 flex items-center justify-between shadow-sm h-9"
                                                                        >
                                                                            <span className="text-xs font-mono text-slate-700 font-medium truncate w-full" title={subItem.item_code}>
                                                                                {subItem.item_code}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                    {(!item.items || item.items.length === 0) && (
                                                                        <span className="text-xs text-slate-400 italic col-span-full">No specific codes recorded.</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between sm:space-x-2 py-4 mt-2">
                                            <div className="text-sm text-slate-500 mb-2 sm:mb-0">
                                                Total: {totalUsage} usages.
                                            </div>
                                            <div className="flex justify-center">
                                                <PaginationComponent total={totalUsage} limit={limitUsage} offset={offsetUsage} setOffset={setOffsetUsage} />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </TabsContent>

                            <TabsContent value="repair">
                                {isRepairUsageLoading ? (
                                    <div className="space-y-3 py-4 animate-pulse">
                                        {Array.from({ length: 3 }).map((_, i) => (
                                            <div key={i} className="h-12 w-full bg-slate-50 rounded-xl border border-slate-100"></div>
                                        ))}
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-2">
                                            <div className="grid sm:grid-cols-5 grid-cols-1 text-xs text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 pb-2 pl-2">
                                                <span>Job No</span>
                                                <span>Total Usage</span>
                                                <span>User</span>
                                                <span>Time Stamp</span>
                                                <span>Actions</span>
                                            </div>

                                            {repairUsageData?.length === 0 && <div className="text-sm text-slate-400 py-4 text-center">No usage history found.</div>}

                                            {repairUsageData?.map((item, index) => (
                                                <div key={`${item.id}-${index}`} className="border-b border-slate-100 last:border-0">
                                                    <div
                                                        className={`grid sm:grid-cols-5 grid-cols-1 text-xs text-slate-700 font-medium py-3 pl-2 items-center cursor-pointer transition-colors hover:bg-slate-50/80 rounded-xl ${expandedUsageId === item.id ? 'bg-blue-50/50' : ''}`}
                                                        onClick={() => toggleRepairUsageRow(item.id)}
                                                    >
                                                        <span className="text-blue-600 font-semibold cursor-pointer hover:underline"
                                                            onClick={() => navigate(`/repairs/${item.job_id}`)}>
                                                            {item.job_no}
                                                        </span>
                                                        <span className="font-bold text-blue-600">{item.total_usage}</span>
                                                        <span>{item.user_name}</span>
                                                        <span>{item.items && item.items.length > 0 ? new Date(item.items[0].created_at).toLocaleString() : "N/A"}</span>

                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 transition-colors"
                                                                onClick={(e) => { e.stopPropagation(); toggleRepairUsageRow(item.id); }}
                                                            >
                                                                {expandedUsageId === item.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {expandedRepairId === item.id && (
                                                        <div className="bg-slate-50 p-4 border-t border-slate-100 rounded-xl my-2 animate-in slide-in-from-top-2 duration-200">
                                                            <p className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">
                                                                Used Item Codes ({item.items?.length || 0})
                                                            </p>

                                                            <div className="max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
                                                                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                                                    {item.items?.map((subItem, idx) => (
                                                                        <div
                                                                            key={`${subItem.usage_id}-${idx}`}
                                                                            className="bg-white border border-slate-200/70 rounded-xl px-3 py-1.5 flex items-center justify-between shadow-sm h-9"
                                                                        >
                                                                            <span className="text-xs font-mono text-slate-700 font-medium truncate w-full" title={subItem.item_code}>
                                                                                {subItem.item_code}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                    {(!item.items || item.items.length === 0) && (
                                                                        <span className="text-xs text-slate-400 italic col-span-full">No specific codes recorded.</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between sm:space-x-2 py-4 mt-2">
                                            <div className="text-sm text-slate-500 mb-2 sm:mb-0">
                                                Total: {repairTotalUsage} items.
                                            </div>
                                            <div className="flex justify-center">
                                                <PaginationComponent total={repairTotalUsage} limit={limitRepairUsage} offset={offsetRepairUsage} setOffset={setOffseRepairtUsage} />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                        <div className="flex gap-6 mb-5 items-center">
                            <h3 className="text-lg font-bold text-slate-800">Item Restock</h3>
                        </div>

                        <div className="space-y-2">
                            <div className="grid sm:grid-cols-8 grid-cols-1 text-xs text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 pb-2 pl-2">
                                <span>Unit Price</span>
                                <span>Quantity</span>
                                <span>Amount</span>
                                <span>User</span>
                                <span className="col-span-2">Time Stamp</span>
                                <span className="col-span-2">Actions</span>
                            </div>

                            {restockData?.map((item, index) => (
                                <div key={`${item.id}-${index}`} className="border-b border-slate-100 last:border-0">
                                    <div
                                        className={`grid sm:grid-cols-8 grid-cols-1 text-xs text-slate-700 font-medium py-3 pl-2 items-center cursor-pointer transition-colors hover:bg-slate-50/80 rounded-xl ${expandedRestockId === item.id ? 'bg-blue-50/50' : ''}`}
                                        onClick={() => toggleRestockRow(item.id)}
                                    >
                                        <span>LKR {item.unit_price}</span>
                                        <span>{item.quantity}</span>
                                        <span className="font-semibold text-slate-900">LKR {item.amount}</span>
                                        <span>{item.user_name}</span>
                                        <span className="col-span-2">{new Date(item.created_at).toLocaleString()}</span>
                                        {
                                            user?.publicMetadata.role === Roles.SUPER_ADMIN ? (
                                                <div className="flex items-center gap-2 col-span-2" onClick={(e) => e.stopPropagation()}>
                                                    <Button variant="ghost" size="sm" className="h-8 px-2.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg text-xs" onClick={() => triggerBarcodePrint(item.inventory_items)}>
                                                        <Printer className="w-3.5 h-3.5 mr-1" /> Print
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 px-2.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg text-xs"
                                                        onClick={() => handleDownloadRestock(item)}
                                                    >
                                                        <Download className="w-3.5 h-3.5 mr-1" />
                                                        Download
                                                    </Button>
                                                    <div className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 transition-colors" onClick={() => toggleRestockRow(item.id)}>
                                                        {expandedRestockId === item.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 col-span-2" onClick={(e) => e.stopPropagation()}>
                                                    {
                                                        item.is_print ? (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 px-2.5 text-slate-400 cursor-not-allowed rounded-lg text-xs"
                                                                disabled
                                                            >
                                                                <Printer className="w-3.5 h-3.5 mr-1" /> Printed
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 px-2.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg text-xs"
                                                                onClick={() => triggerBarcodePrint(item.inventory_items)}
                                                            >
                                                                <Printer className="w-3.5 h-3.5 mr-1" /> Print
                                                            </Button>
                                                        )
                                                    }
                                                    <div className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 transition-colors" onClick={() => toggleRestockRow(item.id)}>
                                                        {expandedRestockId === item.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                    </div>
                                                </div>
                                            )
                                        }
                                    </div>

                                    {expandedRestockId === item.id && (
                                        <div className="bg-slate-50 p-4 border-t border-slate-100 rounded-xl my-2 animate-in slide-in-from-top-2 duration-200">
                                            <p className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">
                                                Generated Item Codes ({item.inventory_items?.length || 0})
                                            </p>
                                            <div className="max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
                                                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                                    {item.inventory_items?.map((subItem, idx) => (
                                                        <div key={`${subItem.id}-${idx}`} className="bg-white border border-slate-200/70 rounded-xl px-2.5 py-1.5 text-xs font-mono text-slate-700 font-medium text-center shadow-sm h-9 flex items-center justify-center">
                                                            {subItem.item_code}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between sm:space-x-2 py-4 mt-2">
                            <div className="text-sm text-slate-500 mb-2 sm:mb-0">
                                Total: {restockTotal} items.
                            </div>
                            <div className="flex justify-center">
                                <PaginationComponent total={restockTotal} limit={limitRestock} offset={offsetRestock} setOffset={setOffsetRestock} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                        <div className="text-xs sm:text-sm text-slate-600 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-x-16">
                            <Timestamp label="Created At" value={inventoryData?.created_at} />
                            <Timestamp label="Last Updated At" value={inventoryData?.updated_at} />
                        </div>
                    </div>
                </div>

            </div>

            <div style={{ position: "absolute", top: "-10000px", left: "-10000px" }}>
                <div ref={componentRef} className="print-wrapper">
                    {printableItems.map((invItem, index) => (
                        <div key={`${invItem.id}-${index}`} className="barcode-label">
                            <img
                                src="/CoreSync-bw-long-logo.jpg"
                                alt="CoreSync"
                                className="company-logo"
                            />
                            <div className="barcode-container">
                                <Barcode
                                    value={invItem.item_code}
                                    format="CODE128"
                                    displayValue={false}
                                    width={1.6}
                                    height={45}
                                    fontSize={10}
                                    background="transparent"
                                />
                            </div>
                            <div className="item-code">{invItem.item_code}</div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

function DetailRow({ label, value }) {
    return (
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline py-1.5">
            <span className="text-slate-500 text-sm font-semibold">{label}:</span>
            <span className="text-sm text-slate-800 font-medium mt-1 sm:mt-0">{value || "N/A"}</span>
        </div>
    );
}

function Timestamp({ label, value }) {
    return (
        <div className="flex flex-col">
            <span className="uppercase tracking-wider text-[10px] text-slate-400 font-bold mb-1">{label}</span>
            <span className="font-semibold text-slate-700 text-sm">{value ? new Date(value).toLocaleString() : "N/A"}</span>
        </div>
    );
}

export default InventoryView;
import { Separator } from "@/components/ui/separator";
import { useNavigate, useParams } from "react-router";
import { use, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import BreadCrumbs from "@/components/ui/BreadCrumbs";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { EditOrder } from "./EditOrder";
import { Badge } from "@/components/ui/badge";
import OrderTemplate from "./OrderPdf";
import { deleteOrder, featchOrderById, orderPaymentsRefund } from "@/api/orderApi";
import { CalendarDays, ChevronDown, ChevronUp, Clock, ExternalLink, Pencil, PlusCircle, Printer, RotateCcw, Trash2, User, Users } from "lucide-react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { DeleteAlert } from "./OrderDeleteAlert";
import { Roles } from "@/const/const";
import { fetchProductById } from "@/api/productApi";
import AddUsage from "@/components/AddUsage";
import { deleteInventoryAllocation, deleteInventoryUsage, featchInventoryAllocation, featchInventoryUsage, updateInventoryAllocationCount, updateInventoryUsageCount } from "@/api/inventoryApi";
import EditUsageCount from "./EditUsageCount";
import { PaginationComponent } from "@/components/Pagination";
import { ErrorState, SkeletonDetailRow, SkeletonSummaryRow, SkeletonTableRow } from "@/components/Skeleton";
import { Button } from "@/components/ui/button";
import TCDialog from "./T&CDialog";
import TCDropDown from "./T&CDropDown";
import BarcodeSection from "./OrderBarCode";
import ItemAllocation from "@/pages/Approvals/Components/ItemAllocation";
import CashNotePdf from "./CreditNotePdf";
import CreditNotePdf from "./CreditNotePdf";
import { useReactToPrint } from "react-to-print";
import Barcode from "react-barcode";
import { flushSync } from "react-dom";
import DeliveryNotePdf from "./DeliveryNotePdf";

function OrderView() {
    const { isLoaded, getToken } = useAuth();
    const { user } = useUser();
    const { orderId } = useParams();

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
        { name: "", link: `/orders/${orderId}` },
    ];

    const [orderData, setOrderData] = useState(null);
    const [isClient, setIsClient] = useState(false);
    const [productID, setProductID] = useState([]);
    const [showProductDetails, setShowProductDetails] = useState({});
    const [usageData, setUsageData] = useState([]);
    const [itemAllocation, setItemAllocation] = useState([])

    const [isOpen, setIsOpen] = useState(false);
    const [total, setTotal] = useState(0);
    const [limit, setLimit] = useState(10)
    const [offset, setOffset] = useState(0)
    const [limitUsage, setLimitUsage] = useState(5)
    const [offsetUsage, setOffsetUsage] = useState(0)

    const [allocationTotal, setAllocationTotal] = useState()
    const [allocationLimit, setAllocationLimit] = useState(10)
    const [allocationOffset, setAllocationOffset] = useState(0)

    const [currentEditItem, setCurrentEditItem] = useState(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isUsageLoading, setIsUsageLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const totalLoanAmount = orderData?.payments?.reduce((acc, payment) => acc + (payment.loan_amount || 0), 0) || 0;

    const [itemUsageData, setItemUsageData] = useState([]);
    const componentRef = useRef(null);
    const [printableItems, setPrintableItems] = useState([]);


    const togleProductDetails = (id) => {
        setShowProductDetails(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };
    const [productData, setProductData] = useState();

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

    const handleDelete = async () => {
        try {
            const token = await getToken();
            const response = await deleteOrder(token, orderId);
            if (response.message == "success") {
                toast.error("Order deleted successfully!", { position: "bottom-right" });
                navigate("/orders");
            }
        } catch (error) {
            console.error("Error deleting order:", error);
        }
    };
    // useEffect(() => {
    //     if (!isLoaded) return;
    //     setIsLoading(true);
    //     const fetchOrderData = async () => {
    //         try {
    //             const token = await getToken();
    //             if (!token) return;
    //             const response = await featchOrderById(token, orderId);
    //             setOrderData(response.data);
    //         } catch (error) {
    //             setIsError(true);
    //             setErrorMessage("Error fetching order data: " + error.message);
    //             console.error("Error fetching order data:", error);
    //             // toast.error("Failed to fetch order data.");
    //         } finally {
    //             setIsLoading(false);
    //             setIsError(false);
    //         }
    //     };
    //     fetchOrderData();
    // }, [getToken, orderId, isLoaded]);

    const fetchOrderData = async () => {
        try {
            const token = await getToken();
            if (!token) return;
            const response = await featchOrderById(token, orderId);
            setOrderData(response.data);
        } catch (error) {
            setIsError(true);
            setErrorMessage("Error fetching order data: " + error.message);
            console.error("Error fetching order data:", error);
        }
    };

    useEffect(() => {
        if (!isLoaded) return;
        setIsLoading(true);
        fetchOrderData().then(() => setIsLoading(false));
    }, [getToken, orderId, isLoaded]);

    useEffect(() => {
        if (!orderData || !Array.isArray(orderData.order_items)) return;
        setIsLoading(true);
        const fetchProductData = async () => {

            const productIds = orderData.order_items.map(item => item.product_id);
            setProductID(productIds);

            try {

                const token = await getToken();

                const responses = await Promise.all(
                    productIds.map(id => fetchProductById(token, id))
                );

                const allProductData = responses.map(res => res.data);
                setProductData(allProductData);
            } catch (error) {
                setIsError(true);
                setErrorMessage("Error fetching product data: " + error.message);
                console.error("Error fetching product data:", error);
                // toast.error("Failed to fetch product data.");
            } finally {
                setIsLoading(false);
                setIsError(false);
            }
        };

        fetchProductData();
    }, [orderData, getToken, isLoaded]);

    const enrichedOrderData = useMemo(() => {
        if (!orderData) return null;

        let batteryCount = 0;

        const updatedItems = orderData.order_items?.map((item) => {
            const product = productData?.find(p => p.id === item.product_id);
            let baseSerialNo = item.serial_no || "";
            let generatedSerials = [];

            if (product && product.category?.toUpperCase() === 'BATTERY_PACK') {
                batteryCount++;
                const sequence = batteryCount.toString().padStart(3, '0');
                baseSerialNo = `${orderData.type}${orderData.order_no}BP-${sequence}`;

                const qty = item.quantity || 1;
                for (let i = 1; i <= qty; i++) {
                    generatedSerials.push(`${baseSerialNo}/${i}`);
                }
            } else if (baseSerialNo) {
                generatedSerials.push(baseSerialNo);
            }

            return {
                ...item,
                dynamic_serial_no: baseSerialNo,
                generated_serials: generatedSerials
            };
        });

        return { ...orderData, order_items: updatedItems };
    }, [orderData, productData]);

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
        .company-name { 
            font-size: 8px; 
            font-weight: 700; 
            margin-bottom: 2px; 
            width: 100%; 
            text-align: center; 
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

        enrichedOrderData?.order_items?.forEach(item => {
            if (item.generated_serials && item.generated_serials.length > 0) {
                item.generated_serials.forEach(serial => {
                    itemsToPrint.push({
                        ...item,
                        dynamic_serial_no: serial
                    });
                });
            }
        });

        if (itemsToPrint.length === 0) {
            toast.error("No serial numbers generated for this order.", { position: "bottom-right" });
            return;
        }

        flushSync(() => { setPrintableItems(itemsToPrint); });
        setTimeout(() => { handlePrint(); }, 50);
    };

    // useEffect(() => {
    //     if (!orderData) return;
    //     setIsLoading(true);
    //     const fetchUsageData = async () => {
    //         try {

    //             const token = await getToken();
    //             const response = await featchInventoryUsage(token, { orderId: orderData.id, limit, offset });
    //             setUsageData(response?.data.items);
    //             setTotal(response?.data.total);
    //         } catch (error) {
    //             setIsError(true);
    //             setErrorMessage("Error fetching usage data: " + error.message);
    //             console.error("Error fetching usage data:", error);
    //             // toast.error("Failed to fetch usage data.");
    //         } finally {
    //             setIsLoading(false);
    //             setIsError(false);
    //         }
    //     };
    //     fetchUsageData();
    // }, [orderData, getToken, isLoaded, limit, offset]);

    const fetchUsageData = async () => {
        if (!orderData) return;
        try {
            setIsUsageLoading(true);
            setExpandedUsageId(null);

            const token = await getToken();
            const response = await featchInventoryUsage(token, { orderId: orderData.id, limit: limitUsage, offset: offsetUsage });

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
    }, [orderData, getToken, isLoaded, limit, offset]);

    const handleDeleteUsage = async (usageId, itemId, usageCount) => {
        try {
            const token = await getToken();
            console.log("Token:", token);
            const usageData = {
                id: usageId,
                item_id: itemId,
                usage_count: usageCount,
            }
            const response = await deleteInventoryUsage(token, usageData);
            if (response.message === "success") {
                toast.success("Usage deleted successfully!", { position: "bottom-right" });
                setUsageData(prev => prev.filter(item => item.id !== usageId));
            }
        } catch (error) {
            console.error("Error deleting usage:", error);
        }
    };

    const handleEditUsageCount = async (item, newUsageCount) => {
        try {
            const token = await getToken();
            console.log("Token:", token);
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

    const handleEditAllocationCount = async (item, newCount) => {
        try {
            const token = await getToken();
            console.log("Token:", token);
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

    const discountAmount = parseFloat(orderData?.discount) || 0;
    const subtotal = parseFloat(orderData?.subtotal) || 0;
    const additionalCharges = (orderData?.additional_charges || []).reduce((sum, item) => sum + (parseFloat(item.value) || 0), 0);
    const subTotalWithAdditionalCharges = subtotal + additionalCharges;
    const discountPercentage = (discountAmount / subTotalWithAdditionalCharges) * 100;
    const totalPaid = orderData?.payments?.map(payment => payment.amount).reduce((acc, amount) => acc + amount, 0);
    const vatAmount = orderData?.vat == true ? orderData?.total * 0.18 : 0;
    const netTotal = orderData?.total + vatAmount;





    const getStatusBadge = (status) => {
        switch (status) {
            case "Pending":
                return <Badge className="rounded-full bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-sm">Pending</Badge>;
            case "Balancing":
                return <Badge className="rounded-full bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 text-sm">Balancing</Badge>;
            case "Delivered":
                return <Badge className="rounded-full bg-green-600 hover:bg-green-800 text-white px-3 py-1 text-sm">Delivered</Badge>;
            case "Completed":
                return <Badge className="rounded-full bg-blue-600 hover:bg-blue-800 text-white px-3 py-1 text-sm">Completed</Badge>;
            case "Drafted":
                return <Badge className="rounded-full bg-amber-500 hover:bg-amber-700 text-white px-3 py-1 text-sm">Drafted</Badge>;
            default:
                return null;
        }
    };



    // const barcodeValue = orderData?.type + orderData?.order_no;
    // // const barcodeValue = item?.itemCode && item?.itemName
    // //   ? `${item.itemCode}-${item.itemName}`
    // //   : null;

    // const barcodeRef = useRef(null);

    // const handleDownloadBarcode = () => {
    //     if (barcodeRef.current) {
    //         const svgElement = barcodeRef.current.querySelector('svg');

    //         if (svgElement) {
    //             const canvas = document.createElement('canvas');
    //             const ctx = canvas.getContext('2d');

    //             const svgData = new XMLSerializer().serializeToString(svgElement);
    //             const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    //             const url = URL.createObjectURL(svgBlob);

    //             const img = new Image();
    //             img.onload = () => {
    //                 canvas.width = img.width;
    //                 canvas.height = img.height;
    //                 ctx.drawImage(img, 0, 0);


    //                 const pngUrl = canvas.toDataURL('image/png');
    //                 const downloadLink = document.createElement('a');
    //                 downloadLink.href = pngUrl;
    //                 downloadLink.download = `${orderData?.type + orderData?.order_no} || 'unknown'}.png`;
    //                 document.body.appendChild(downloadLink);
    //                 downloadLink.click();
    //                 document.body.removeChild(downloadLink);
    //                 URL.revokeObjectURL(url);
    //             };
    //             img.src = url;
    //         } else {
    //             console.error("SVG element not found in barcodeRef.current");
    //         }
    //     }
    // };

    const fetchAllocationData = async () => {
        try {
            const token = await getToken()
            const response = await featchInventoryAllocation(token, { orderId, limit: allocationLimit, offset: allocationOffset })
            setItemAllocation(response?.data?.items || [])
            setAllocationTotal(response?.data.total || 0)
        } catch (error) {
            console.error("Error fetching item allocation:", error)
        }
    }

    useEffect(() => {
        if (orderId) {
            fetchAllocationData()
        }
    }, [orderId, getToken, allocationLimit, allocationOffset])

    const handleDeleteAllocation = async (ID, item) => {
        try {
            const token = await getToken();
            console.log("Token:", token);

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

    const handleRefundClick = async () => {
        try {
            const token = await getToken();
            const payload = {
                id: orderId,
                PaymentID: orderData?.payments.map(p => p.id),
                PaymentType: "Refund",
                OrderStatus: "Cancelled",
                PaymentStatus: "Refund"
            }
            const response = await orderPaymentsRefund(token, payload);
            if (response.message === "success") {
                toast.success("Order payment refund successfully!", { position: "bottom-right" });
            }
        } catch (error) {
            console.error("Failed to refund update:", error);
            toast.error("Failed to refund update", { position: "bottom-right" });
        }
    }

    const handleCreditNoteClick = async () => {
        try {
            const token = await getToken();
            const payload = {
                id: orderId,
                PaymentID: orderData?.payments.map(p => p.id),
                PaymentType: "Credit Note",
                OrderStatus: "Cancelled",
                PaymentStatus: "Credit Note"
            }
            const response = await orderPaymentsRefund(token, payload);
            if (response.message === "success") {
                toast.success("Order payment marked as credit note!", { position: "bottom-right" });
            }
        } catch (error) {
            console.error("Failed to credit note update:", error);
            toast.error("Failed to credit note update", { position: "bottom-right" });
        }
    }



    if (isLoading) {
        return (
            <>
                {/* Breadcrumbs Skeleton */}
                <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>

                <div className="sm:p-8 p-4 space-y-6 bg-gray-50 min-h-screen">
                    {/* Header Skeleton */}
                    <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                        <div className="h-10 w-48 bg-gray-200 rounded animate-pulse sm:text-4xl text-2xl"></div>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                            <div className="h-9 w-28 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-9 w-28 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-9 w-28 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                    </div>

                    {/* Overview Header Skeleton */}
                    <div className="space-y-4">
                        <div className="h-8 w-36 bg-gray-200 rounded animate-pulse text-2xl font-semibold"></div>
                        <Separator className="my-4 bg-gray-200 h-1 animate-pulse" />
                    </div>

                    {/* Primary Details Skeleton */}
                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                        <div className="h-7 w-48 bg-gray-200 rounded animate-pulse mb-5 text-xl font-bold"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                            <div>
                                <SkeletonDetailRow />
                                <SkeletonDetailRow />
                            </div>
                            <div>
                                <SkeletonDetailRow />
                                <SkeletonDetailRow />
                            </div>
                        </div>
                    </div>

                    {/* Product Details Skeleton */}
                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                        {/* Title Skeleton */}
                        <div className="h-7 w-48 bg-gray-200 rounded animate-pulse mb-5 text-xl font-bold"></div>

                        {/* Table Skeleton */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse float-right"></div>
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse float-right"></div>
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse float-right"></div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {/* Simulate a few rows */}
                                    <SkeletonTableRow />
                                    <SkeletonTableRow />
                                    <SkeletonTableRow />
                                    <SkeletonTableRow />
                                    <SkeletonTableRow />
                                </tbody>
                            </table>
                        </div>

                        {/* Pricing Summary Skeleton */}
                        <div className="mt-6 pt-4 border-t border-gray-200 space-y-3 text-sm sm:text-base">
                            {/* Subtotal */}
                            <SkeletonSummaryRow />

                            {/* Additional Charges (simulated 2) */}
                            <SkeletonSummaryRow />
                            <SkeletonSummaryRow />

                            {/* Discount (%) */}
                            <SkeletonSummaryRow />

                            {/* Discount Amount (if applicable) */}
                            {/* <SkeletonSummaryRow /> This can be optional, similar to how it's conditionally rendered */}

                            {/* Total Payable */}
                            <div className="flex flex-wrap justify-between font-bold text-xl text-green-700 pt-3 border-t border-gray-200">
                                <div className="h-6 w-36 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-6 w-28 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                        <div className="h-7 w-48 bg-gray-200 rounded animate-pulse mb-5 text-xl font-bold"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                            <div>
                                <SkeletonDetailRow />
                                <SkeletonDetailRow />
                                <SkeletonDetailRow />
                                <SkeletonDetailRow />
                            </div>

                        </div>
                    </div>

                    {/* Timestamps Skeleton */}
                    <div className="flex justify-end mt-8">
                        <div className="bg-gray-100 rounded-xl p-5 text-xs sm:text-sm text-gray-600 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-x-16">
                            <SkeletonDetailRow />
                            <SkeletonDetailRow />
                        </div>
                    </div>
                </div>
            </>
        );
    }
    if (isError) {
        return (
            <ErrorState errorMessage={errorMessage} />
        )
    }

    return (
        <>
            {
                isMobile ? null : <BreadCrumbs breadcrumbs={breadcrumbs} />
            }

            <div className="sm:p-8 p-4 space-y-6 bg-gray-50 min-h-screen">

                {/* Header Section */}
                <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <h1 className="sm:text-4xl text-md font-extrabold text-gray-800">
                            {orderData?.type} {orderData?.order_no}
                        </h1>
                        {getStatusBadge(orderData?.OrderStatus)}
                    </div>

                    {/* Action Buttons */}

                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                        {isMobile ? (
                            <div className="w-full flex flex-col gap-2">
                                <TCDropDown
                                    className="w-full"
                                    orderData={orderData}
                                    discountPercentage={discountPercentage}
                                    totalPaid={totalPaid}
                                    isClient={isClient}
                                    vatAmount={vatAmount}
                                    netTotal={netTotal}
                                />
                            </div>
                        ) : (
                            /* DESKTOP VIEW */
                            <div className="gap-4 flex items-center">
                                <BarcodeSection orderData={orderData} />
                                <EditOrder orderData={orderData} totalLoanAmount={totalLoanAmount} onUpdate={fetchOrderData} />


                                <DeleteAlert handleDelete={handleDelete} orderData={orderData} />



                                <PDFDownloadLink
                                    // onClick={handleDeliveryNoteClick}
                                    document={<DeliveryNotePdf orderData={orderData} />}
                                    fileName={`Delivery Note-${orderData?.type + orderData?.order_no}.pdf`}
                                    className="flex items-center gap-1 px-3 py-2 rounded-md 
                         bg-green-500 text-white text-sm font-medium shadow-sm 
                         hover:bg-green-600 hover:shadow-md 
                         active:scale-95 transition-all duration-200"
                                >
                                    {({ loading }) =>
                                        loading ? "Generating..." : "Delivery Note"
                                    }
                                </PDFDownloadLink>

                                <TCDropDown
                                    orderData={enrichedOrderData}
                                    // orderData={orderData}
                                    discountPercentage={discountPercentage}
                                    totalPaid={totalPaid}
                                    isClient={isClient}
                                    vatAmount={vatAmount}
                                    netTotal={netTotal}
                                />
                            </div>
                        )}
                    </div>

                </div>

                {/* Overview Section */}
                <div className="space-y-4 sm:pl-6">
                    <h2 className="text-2xl font-semibold text-gray-700">Overview</h2>
                    <Separator className="my-4 bg-gray-300" />
                   
                       <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                            <h3 className="text-xl font-bold mb-5 text-gray-700">Customer Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                                <DetailRow label="Name" value={`${orderData?.title} ${orderData?.first_name} ${orderData?.last_name}`} />
                                <DetailRow label="Email" value={orderData?.email} />
                                <DetailRow label="Phone No. 1" value={orderData?.phone_no1} />
                                <DetailRow label="Phone No. 2" value={orderData?.phone_no2} />
                                <DetailRow label="Address" value={orderData?.address} />

                                {
                                    orderData?.po_no ? <DetailRow label="PO No" value={orderData?.po_no} /> : null
                                }
                                {
                                    orderData?.vat_no ? <DetailRow label="VAT No" value={orderData?.vat_no} /> : null
                                }
                            </div>
                        </div>
                    


                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold mb-5 text-gray-700">Product Details</h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                                onClick={triggerSerialPrint}
                            >
                                <Printer className="w-4 h-4 mr-1" /> Print S/Ns
                            </Button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Product Name
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Unit Price (LKR)
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Quantity
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Subtotal (LKR)
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {enrichedOrderData?.order_items?.map((item) => (
                                        <tr key={item.id}>
                                            {/* <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 hover:cursor-pointer" onClick={() => navigate(`/products/${item.product_id}`)}>
                                                {item.product_name}  {item.serial_no ? `(S/N:${item.serial_no})` : ""}
                                            </td> */}
                                            <td
                                                className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 hover:cursor-pointer"
                                                onClick={() => navigate(`/products/${item.product_id}`)}
                                            >
                                                {item.product_name}
                                                <span className="ml-2 text-gray-500">
                                                    {item.generated_serials && item.generated_serials.length > 0
                                                        ? `(S/N: ${item.generated_serials.join(', ')})`
                                                        : item.dynamic_serial_no
                                                            ? `(S/N: ${item.dynamic_serial_no})`
                                                            : ""}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700">
                                                {parseFloat(item.unit_price).toLocaleString(undefined, {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700">
                                                {parseFloat(item.quantity)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700">
                                                {parseFloat(item.subtotal).toLocaleString(undefined, {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pricing Summary */}
                        <div className="mt-6 pt-4 border-t border-gray-200 space-y-3">
                            <div className="flex justify-between font-semibold text-gray-800">
                                <span>Subtotal</span>
                                <span>LKR {parseFloat(orderData?.subtotal).toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}
                                </span>
                            </div>
                            {orderData?.additional_charges?.map((charge, index) => (
                                <div key={index} className="flex justify-between text-gray-600">
                                    <span>{charge.type}</span>
                                    <span className="text-right min-w-[100px]">+ LKR {parseFloat(charge.value).toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    })}
                                    </span>
                                </div>
                            ))}
                            {/* <div className="flex justify-between text-sm text-gray-600">
                                <span>Discount</span>
                                <span>
                                    
                                </span>
                            </div> */}

                            {orderData?.discount && Number(orderData?.discount) > 0 && (
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Discount ({discountPercentage.toFixed(2)}%)</span>
                                    <span className="text-right min-w-[100px]">
                                        - LKR {orderData.discount && Number(orderData.discount) > 0
                                            ? Number(orderData.discount).toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })
                                            : "0.00"}
                                    </span>
                                </div>

                            )}
                            {
                                !orderData?.vat ? null : <div className="flex justify-between text-sm text-gray-600">
                                    <span>VAT (18%)</span>
                                    <span>
                                        + LKR {vatAmount.toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </span>
                                </div>
                            }


                            <div className="flex flex-wrap justify-between font-bold text-xl text-green-700 pt-3 border-t border-gray-200">
                                <span>Net Total</span>
                                <span className="text-right min-w-[100px]">LKR {netTotal.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}
                                </span>
                            </div>
                        </div>
                    </div>




                       <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                            <h3 className="text-xl font-bold mb-5 text-gray-700 flex items-center">
                                Payment Details
                            </h3>
                            <div className="">
                                {/* <DetailRow
                                    label="Advanced Paid Date"
                                    value={
                                        orderData?.advanced_amount == 0 || orderData?.paid_amount == 0 || !orderData?.advanced_paid_date
                                            ? "-"
                                            : new Date(orderData?.advanced_paid_date || orderData?.full_amount_paid_date).toLocaleString('en-LK', { timeZone: 'Asia/Colombo' })
                                    }
                                /> */}

                                {/* <DetailRow
                                    label="Advanced Amount"
                                    value={`LKR ${Number(orderData?.advanced_amount || orderData?.paid_amount).toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}`}
                                /> */}


                                {/* View Advanced Receipt */}
                                {/* <DetailRow
                                    // label="Advanced Receipt" // Add label for clarity
                                    value={
                                        orderData?.paid_receipt?.[0] ? (
                                            <span
                                                className="flex items-center text-blue-600 hover:underline cursor-pointer"
                                                onClick={() => window.open(orderData.paid_receipt[0], "_blank")}
                                            >
                                                View Receipt 1
                                                <ExternalLink size="16px" className="ml-2" />
                                            </span>
                                        ) : (
                                            ""
                                        )
                                    }
                                /> */}

                                {/* {orderData.PaymentStatus === "Paid" && ( */}
                                <>
                                    {/* {
                                        orderData?.advanced_amount + orderData?.paid_amount == orderData?.total
                                            ? <DetailRow
                                                label="Full Amount Paid Date"
                                                value={
                                                    !orderData.full_amount_paid_date
                                                        ? "-"
                                                        : new Date(orderData.full_amount_paid_date).toLocaleString('en-LK', { timeZone: 'Asia/Colombo' })
                                                }
                                            />
                                            : <DetailRow
                                                label="Full Amount Paid Date"
                                                value="-"
                                            />
                                    }
                                    <DetailRow
                                        label="Full Amount"
                                        value={`LKR ${orderData?.paid_amount
                                            ? Number(orderData.paid_amount).toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })
                                            : "0.00"
                                            }`}
                                    /> */}



                                    {/* View Additional Receipts (if any) */}
                                    {/* <DetailRow
                                        // label="Other Receipts" 
                                        value={
                                            orderData?.paid_receipt?.length > 1 ? (
                                                <div className="flex flex-col space-y-1">
                                                    {orderData.paid_receipt.slice(1).map((item, index) => (
                                                        <span
                                                            key={index}
                                                            className="flex items-center text-blue-600 hover:underline cursor-pointer"
                                                            onClick={() => window.open(item, "_blank")}
                                                        >
                                                            View Receipt {index + 2}
                                                            <ExternalLink size="16px" className="ml-2" />
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                "-"
                                            )
                                        }
                                    /> */}
                                </>
                                {/* )} */}
                                {/* {
                                    orderData?.payments?.map((item, index) => (
                                        <DetailRow
                                            key={item.id || index}
                                            label="Loan Amount"
                                            value={`LKR ${Number(item.loan_amount || 0).toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}`}
                                        />
                                    ))
                                } */}
                                <div className="space-y-2 pt-4">
                                    <div className="grid sm:grid-cols-5 grid-cols-1 text-xs text-gray-500 font-semibold border-b pb-1">
                                        <span>Paid Date</span>
                                        <span>Type</span>
                                        <span>Created By</span>
                                        <span>Amount</span>
                                        <span></span>
                                    </div>

                                    {(() => {
                                        const payments = orderData?.payments || [];
                                        const totalLoanAmount = payments.reduce((acc, item) => acc + (Number(item.loan_amount) || 0), 0);
                                        const totalPaymentAmount = payments
                                            .filter(item => item.payment_type !== "None")
                                            .reduce((acc, item) => acc + (Number(item.amount) || 0), 0);

                                        const grandTotalPaid = totalLoanAmount + totalPaymentAmount;
                                        const loanMetadataItem = payments.find(p => Number(p.loan_amount) > 0);

                                        return (
                                            <>
                                                {totalLoanAmount > 0 && (
                                                    <div className="grid sm:grid-cols-5 grid-cols-1 text-xs text-gray-500 font-semibold border-b pb-1">
                                                        <span>
                                                            {loanMetadataItem?.paid_date
                                                                ? new Date(loanMetadataItem.paid_date).toLocaleString()
                                                                : "-"}
                                                        </span>
                                                        <span className="text-orange-600">Loan</span>
                                                        <span>{loanMetadataItem?.created_by || "-"}</span>
                                                        <span>
                                                            {totalLoanAmount.toLocaleString(undefined, {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2,
                                                            })}
                                                        </span>
                                                        <span>-</span>
                                                    </div>
                                                )}

                                                {payments.map((item) => {
                                                    if (item.payment_type === "None") return null;

                                                    return (
                                                        <div
                                                            key={item.id}
                                                            className="grid sm:grid-cols-5 grid-cols-1 text-xs text-gray-500 font-semibold border-b pb-1"
                                                        >
                                                            <span>
                                                                {item.paid_date
                                                                    ? new Date(item.paid_date).toLocaleString()
                                                                    : "-"}
                                                            </span>
                                                            <span>{item.payment_type}</span>
                                                            <span>{item.created_by}</span>
                                                            <span>
                                                                {Number(item.amount).toLocaleString(undefined, {
                                                                    minimumFractionDigits: 2,
                                                                    maximumFractionDigits: 2,
                                                                })}
                                                            </span>
                                                            {item.image ? (
                                                                <span className="flex">
                                                                    <a
                                                                        href={item.image}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="flex gap-2 text-blue-500 hover:text-blue-700"
                                                                    >
                                                                        View Receipt <ExternalLink size="16px" />
                                                                    </a>
                                                                </span>
                                                            ) : (
                                                                <h1>-</h1>
                                                            )}
                                                        </div>
                                                    );
                                                })}

                                                {grandTotalPaid > 0 && (
                                                    <div className="flex gap-x-10 items-center pt-4">
                                                        <h1 className="flex text-gray-600 text-sm font-medium">
                                                            Total Paid: LKR{" "}
                                                            {grandTotalPaid.toLocaleString(undefined, {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2,
                                                            })}
                                                        </h1>

                                                        <button
                                                            onClick={handleRefundClick}
                                                            className="flex items-center gap-1 px-3 py-1 rounded-full 
                       bg-red-500 text-white text-sm font-medium shadow-sm 
                       hover:bg-red-600 hover:shadow-md 
                       active:scale-95 transition-all duration-200"
                                                        >
                                                            Refund
                                                        </button>

                                                        {isClient && (
                                                            <PDFDownloadLink
                                                                onClick={handleCreditNoteClick}
                                                                document={<CreditNotePdf orderData={orderData} />}
                                                                fileName={`Credit Note-${orderData?.type + orderData?.order_no}.pdf`}
                                                                className="flex items-center gap-1 px-3 py-1 rounded-full 
                         bg-green-500 text-white text-sm font-medium shadow-sm 
                         hover:bg-green-600 hover:shadow-md 
                         active:scale-95 transition-all duration-200"
                                                            >
                                                                {({ loading }) =>
                                                                    loading ? "Generating..." : "Credit Note"
                                                                }
                                                            </PDFDownloadLink>
                                                        )}
                                                    </div>
                                                )}
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>

                        </div>
                   

                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                        <h3 className="text-xl font-bold mb-5 text-gray-700">Notes</h3>
                        <div className="flex flex-col space-y-4">
                            {
                                orderData?.order_items?.map((item) =>
                                    item.note && <NoteDetail key={item.id} label={item.product_name} value={item.note} />
                                )
                            }
                            {
                                !orderData?.order_items?.some(item => item.note) && (
                                    <p className="text-gray-500 col-span-full">No specific notes available for products.</p>
                                )
                            }
                        </div>
                    </div>


                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                        <h3 className="text-xl font-bold mb-5 text-gray-700">Product Specifications</h3>
                        <div className="flex-row justify-start">
                            {
                                productData?.map((product, index) => (
                                    product?.category == 'SOLAR' ? <div key={index}>
                                        <>
                                            <div key={index} className="mb-4">
                                                <div
                                                    className="flex items-center justify-between p-2 bg-slate-100 rounded-lg shadow-sm cursor-pointer transition-all duration-200 hover:bg-slate-200"
                                                    onClick={() => togleProductDetails(product.id)}
                                                >
                                                    <h3 className="text-lg font-semibold text-gray-800">
                                                        {product.name}
                                                    </h3>
                                                    {showProductDetails[product.id] ? (
                                                        <ChevronUp className="h-5 w-5 text-gray-600" />
                                                    ) : (
                                                        <ChevronDown className="h-5 w-5 text-gray-600" />
                                                    )}
                                                </div>

                                                {showProductDetails[product.id] && (
                                                    <div className="mt-2 p-4 bg-white rounded-lg shadow-md border border-gray-200 animate-fade-in-down">
                                                        <InfoItem label="Category" value={product.category} />
                                                        <InfoItem label="Base Price" value={`LKR ${product.base_price}`} />
                                                        <InfoItem label="Inverter" value={product.Inverter} />
                                                        <InfoItem label="Capacity" value={product.capacity} />
                                                        <InfoItem label="Solar Panal" value={product.PanelType} />
                                                        <InfoItem label="Specifications" value={product.Specifications} />
                                                        <InfoItem label="Is Active" value={product.is_active ? "Yes" : "No"} />
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    </div> : product?.category == 'BATTERY_PACK' ? <div key={index}>
                                        <>
                                            <div key={index} className="mb-4">
                                                <div
                                                    className="flex items-center justify-between p-2 bg-slate-100 rounded-lg shadow-sm cursor-pointer transition-all duration-200 hover:bg-slate-200"
                                                    onClick={() => togleProductDetails(product.id)}
                                                >
                                                    <h3 className="text-lg font-semibold text-gray-800">
                                                        {product.name}
                                                    </h3>
                                                    {showProductDetails[product.id] ? (
                                                        <ChevronUp className="h-5 w-5 text-gray-600" />
                                                    ) : (
                                                        <ChevronDown className="h-5 w-5 text-gray-600" />
                                                    )}
                                                </div>


                                                {showProductDetails[product.id] && (
                                                    <div className="mt-2 p-4 bg-white rounded-lg shadow-md border border-gray-200 animate-fade-in-down">
                                                        <InfoItem label="Category" value={product.category} />
                                                        <InfoItem label="Base Price" value={`LKR ${product.base_price}`} />
                                                        <InfoItem label="Pack Type" value={product.type} />
                                                        <InfoItem label="Model" value={product.model} />
                                                        <InfoItem label="Capacity" value={product.capacity} Ah />
                                                        <InfoItem label="Voltage" value={product.voltage} V />
                                                        <InfoItem label="Cell Type" value={product.cell_type} />
                                                        <InfoItem label="BMS Type" value={product.bms_type} />
                                                        <InfoItem label="Monitor" value={product.monitor} />
                                                        <InfoItem label="Specifications" value={product.Specifications} />
                                                        <InfoItem label="Is Active" value={product.is_active ? "Yes" : "No"} />
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    </div> : product?.category == 'OTHER' ? <div key={index}>
                                        <>
                                            <div key={index} className="mb-4">
                                                {/* Product Name Header - Now a clickable panel header */}
                                                <div
                                                    className="flex items-center justify-between p-2 bg-slate-100 rounded-lg shadow-sm cursor-pointer transition-all duration-200 hover:bg-slate-200"
                                                    onClick={() => togleProductDetails(product.id)}
                                                >
                                                    <h3 className="text-lg font-semibold text-gray-800">
                                                        {product.name}
                                                    </h3>
                                                    {showProductDetails[product.id] ? (
                                                        <ChevronUp className="h-5 w-5 text-gray-600" />
                                                    ) : (
                                                        <ChevronDown className="h-5 w-5 text-gray-600" />
                                                    )}
                                                </div>

                                                {/* Product Details Content - Conditionally rendered with a subtle animation */}
                                                {showProductDetails[product.id] && (
                                                    <div className="mt-2 p-4 bg-white rounded-lg shadow-md border border-gray-200 animate-fade-in-down">
                                                        <InfoItem label="Category" value={product.category} />
                                                        <InfoItem label="Base Price" value={`LKR ${product.base_price}`} />
                                                        <InfoItem label="Voltage(V)" value={`${product.voltage}V`} />
                                                        <InfoItem label="Brand Name" value={product.Specifications} />
                                                        <InfoItem label="Is Active" value={product.is_active ? "Yes" : "No"} />
                                                    </div>
                                                )}
                                            </div>

                                        </>
                                    </div> : product?.category == 'E_VEHICLE' ? <div key={index}>
                                        <>
                                            <div key={index} className="mb-4">
                                                {/* Product Name Header - Now a clickable panel header */}
                                                <div
                                                    className="flex items-center justify-between p-2 bg-slate-100 rounded-lg shadow-sm cursor-pointer transition-all duration-200 hover:bg-slate-200"
                                                    onClick={() => togleProductDetails(product.id)}
                                                >
                                                    <h3 className="text-lg font-semibold text-gray-800">
                                                        {product.name}
                                                    </h3>
                                                    {showProductDetails[product.id] ? (
                                                        <ChevronUp className="h-5 w-5 text-gray-600" />
                                                    ) : (
                                                        <ChevronDown className="h-5 w-5 text-gray-600" />
                                                    )}
                                                </div>

                                                {/* Product Details Content - Conditionally rendered with a subtle animation */}
                                                {showProductDetails[product.id] && (
                                                    <div className="mt-2 p-4 bg-white rounded-lg shadow-md border border-gray-200 animate-fade-in-down">
                                                        <InfoItem label="Category" value={product.category} />
                                                        <InfoItem label="Type" value={product.type} />
                                                        <InfoItem label="Cell Type" value={product.cell_type} />
                                                        <InfoItem label="Capacity" value={product.capacity} />
                                                        <InfoItem label="BMS Type" value={product.bms_type} />
                                                        <InfoItem label="Base Price" value={`LKR ${product.base_price}`} />
                                                        <InfoItem label="Voltage(V)" value={`${product.voltage}V`} />
                                                        <InfoItem label="Brand Name" value={product.Specifications} />
                                                        <InfoItem label="Is Active" value={product.is_active ? "Yes" : "No"} />
                                                    </div>
                                                )}
                                            </div>

                                        </>
                                    </div> : product?.category == 'SERVICE' ? <div key={index}>
                                        <>
                                            <div key={index} className="mb-4">
                                                {/* Product Name Header - Now a clickable panel header */}
                                                <div
                                                    className="flex items-center justify-between p-2 bg-slate-100 rounded-lg shadow-sm cursor-pointer transition-all duration-200 hover:bg-slate-200"
                                                    onClick={() => togleProductDetails(product.id)}
                                                >
                                                    <h3 className="text-lg font-semibold text-gray-800">
                                                        {product.name}
                                                    </h3>
                                                    {showProductDetails[product.id] ? (
                                                        <ChevronUp className="h-5 w-5 text-gray-600" />
                                                    ) : (
                                                        <ChevronDown className="h-5 w-5 text-gray-600" />
                                                    )}
                                                </div>

                                                {/* Product Details Content - Conditionally rendered with a subtle animation */}
                                                {showProductDetails[product.id] && (
                                                    <div className="mt-2 p-4 bg-white rounded-lg shadow-md border border-gray-200 animate-fade-in-down">
                                                        <InfoItem label="Category" value={product.category} />
                                                        <InfoItem label="Base Price" value={`LKR ${product.base_price}`} />
                                                        {/* <InfoItem label="Voltage(V)" value={`${product.voltage}V`} /> */}
                                                        <InfoItem label="Brand Name" value={product.Specifications} />
                                                        <InfoItem label="Is Active" value={product.is_active ? "Yes" : "No"} />
                                                    </div>
                                                )}
                                            </div>

                                        </>
                                    </div> : null
                                ))
                            }
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                        <div className="flex gap-6 mb-5 items-center">
                            <h3 className="text-xl font-bold text-gray-700">Items Allocation</h3>
                            {/* <div
                                className="flex items-center text-blue-600 hover:underline cursor-pointer mt-1"
                            >
                                <PlusCircle size={12} />
                                <span className="text-xs">Add</span>
                            </div> */}
                            {/* <ItemAllocation
                                type="order"
                                orderData={orderData}
                            /> */}
                        </div>


                        <div className="space-y-2">
                            <div className="grid sm:grid-cols-6  grid-cols-1 text-xs text-gray-500 font-semibold border-b pb-1">
                                <span>Item Code</span>
                                <span>Item Name</span>
                                <span>Count</span>
                                <span>Allocator</span>
                                <span>Time Stamp</span>
                                <span></span>
                            </div>
                            {itemAllocation?.map((item) => (
                                <div key={item.id} className="grid sm:grid-cols-6 grid-cols-1 text-xs text-gray-500 font-semibold border-b pb-1">
                                    <span>{item.item_code}</span>
                                    <span>{item.item_name}</span>
                                    <span className="pl-5">{item.usage_count}</span>
                                    <span>{item.user_name}</span>
                                    <span>{new Date(item.created_at).toLocaleString()}</span>

                                    {
                                        user?.publicMetadata.role == Roles.WAREHOUSE_STAFF ? null : <div className="flex gap-4">
                                            <button
                                                onClick={() => {
                                                    setCurrentEditItem({ ...item, type: "allocation" });
                                                    setIsOpen(true);
                                                }}
                                            >
                                                <Pencil size={14} className="cursor-pointer text-blue-500 hover:text-blue-700" />
                                            </button>
                                            <Trash2
                                                size={16}
                                                className="cursor-pointer text-red-500 hover:text-red-700"
                                                onClick={() => handleDeleteAllocation(item.id, item)}
                                            />
                                        </div>
                                    }

                                </div>
                            ))}
                        </div>
                        <div>
                            <div>

                            </div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between sm:space-x-2 py-4">
                                <div className="text-sm text-muted-foreground mb-2 sm:mb-0">
                                    Total: {allocationTotal} usage.
                                </div>
                                <div className="flex justify-center">
                                    <PaginationComponent total={allocationTotal} limit={allocationLimit} offset={allocationOffset} setOffset={setAllocationOffset} />
                                </div>
                            </div>
                        </div>

                    </div>


                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                        <div className="flex gap-6 mb-5 items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-700">Items Usage</h3>
                            <AddUsage
                                type="order"
                                orderData={orderData}
                                onUpdate={fetchUsageData}
                            />
                        </div>

                        {isUsageLoading ? (
                            <div className="space-y-2 animate-pulse">
                                {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-gray-100 rounded w-full"></div>)}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {/* Table Header */}
                                <div className="grid sm:grid-cols-5 grid-cols-1 text-xs text-gray-500 font-semibold border-b pb-1 pl-2">
                                    <span>Item Code</span>
                                    <span>Item Name</span>
                                    <span>Total Usage</span>
                                    <span>User</span>
                                    <span>Time Stamp</span>
                                </div>

                                {groupedUsageItems.length === 0 && <div className="text-sm text-gray-500 py-2">No usage history found.</div>}

                                {groupedUsageItems.map((group, index) => (
                                    <div key={`${group.key_id}-${index}`} className="border-b last:border-0">

                                        {/* Parent Row (Clickable) */}
                                        <div
                                            className={`grid sm:grid-cols-5 grid-cols-1 text-xs text-gray-600 font-medium py-3 pl-2 items-center cursor-pointer transition-colors hover:bg-gray-50 ${expandedUsageId === group.key_id ? 'bg-blue-50/50' : ''}`}
                                            onClick={() => toggleUsageRow(group.key_id)}
                                        >
                                            <span>{group.display_code}</span>
                                            <span>{group.display_name}</span>


                                            <span className="font-bold text-blue-700">{group.total_usage}</span>
                                            <span>{group.user_name}</span>

                                            <span className="flex justify-between items-center w-full pr-4">
                                                {group.last_updated ? new Date(group.last_updated).toLocaleString() : "N/A"}

                                                <div className="p-1 rounded-full hover:bg-gray-200 text-gray-400">
                                                    {expandedUsageId === group.key_id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                </div>
                                            </span>
                                        </div>

                                        {/* Expanded Detail Rows (GRID VIEW with SCROLL) */}
                                        {expandedUsageId === group.key_id && (
                                            <div className="bg-gray-50 p-4 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
                                                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                                                    Used Item Codes ({group.details?.length || 0})
                                                </p>

                                                {/* SCROLLABLE CONTAINER: Max Height ~2 rows (~90px), Scroll Y enabled */}
                                                <div className="max-h-[100px] overflow-y-auto pr-2 custom-scrollbar">
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                                        {group.details?.map((subItem, idx) => (
                                                            <div
                                                                key={`${subItem.usage_id}-${idx}`}
                                                                className="bg-white border border-gray-200 rounded px-2 py-1 flex items-center justify-between shadow-sm group h-8"
                                                            >
                                                                <span className="text-xs font-mono text-gray-700 font-medium truncate w-full" title={subItem.item_code}>
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

                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between sm:space-x-2 py-4 mt-2">
                            <div className="text-sm text-muted-foreground mb-2 sm:mb-0">
                                Total Records: {total}
                            </div>
                            <div className="flex justify-center">
                                <PaginationComponent total={total} limit={limitUsage} offset={offsetUsage} setOffset={setOffsetUsage} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                        <h3 className="text-xl font-bold mb-5 text-gray-700">Hardware and Design Request</h3>
                        <div className="flex flex-col space-y-4 text-gray-600 text-sm">
                            {/* CAD Files sentence */}
                            {orderData?.cad_files && orderData?.cad_files?.file_name?.length > 0 && (
                                <p>
                                    CAD files "<strong>{orderData?.cad_files?.file_name.join(", ")}</strong>"
                                    were sent to <strong>{orderData?.cad_files?.email.join(", ")}</strong>.
                                </p>
                            )}

                            {/* Designer sentence */}
                            {orderData?.designer?.description && orderData?.designer?.email?.length > 0 && (
                                <p>
                                    Design description "<strong>{orderData.designer.description}</strong>"
                                    was sent to <strong>{orderData.designer.email.join(", ")}</strong>.
                                </p>
                            )}

                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                        <h3 className="text-xl font-bold mb-5 text-gray-700">Sale Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                            <DetailRow label="No." value={orderData?.sales_no} />
                            <DetailRow label="Type" value={orderData?.sales_type} />
                            <DetailRow label="Salesperson" value={orderData?.salesperson} />
                            <DetailRow
                                label="Commission"
                                value={orderData?.commission.toLocaleString('en-US', {
                                    style: 'currency',
                                    currency: 'LKR',
                                })}
                            />

                            <DetailRow label="Description" value={orderData?.description} />
                            <DetailRow label="Recording" value={orderData?.recording_url} />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between gap-6 mt-8">
                        {/* Workers */}
                        <div className="bg-white shadow-sm border rounded-xl p-5 w-full sm:w-1/2">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">
                                Workers
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InfoBlock icon={User} label="Supervisor" value={orderData?.supervisor} />
                                <InfoBlock
                                    icon={Users}
                                    label="Assignee"
                                    value={
                                        Array.isArray(orderData?.assignee)
                                            ? orderData.assignee.join(", ")
                                            : orderData?.assignee
                                    }
                                />
                            </div>
                        </div>


                        {/* Timestamps */}
                        <div className="bg-white shadow-sm border rounded-xl p-5 w-full sm:w-1/2">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">
                                Timestamps
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InfoBlock
                                    icon={CalendarDays}
                                    label="Created At"
                                    value={orderData?.created_at ? new Date(orderData.created_at).toLocaleString() : "N/A"}
                                />
                                <InfoBlock
                                    icon={Clock}
                                    label="Last Updated"
                                    value={orderData?.updated_at ? new Date(orderData.updated_at).toLocaleString() : "N/A"}
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
                                : handleEditUsageCount
                        }
                        isOpen={isOpen}
                        setIsOpen={setIsOpen}
                    />
                )}
            </div>

            <div style={{ display: "none" }}>
                <div ref={componentRef} className="print-wrapper">
                    {printableItems.map((item, index) => (
                        <div key={index} className="barcode-label">
                            <div className="company-name">RENEWAA</div>
                            <div className="barcode-container">
                                <Barcode
                                    value={item.dynamic_serial_no}
                                    format="CODE128"
                                    displayValue={false}
                                    margin={0}
                                    background="transparent"
                                />
                            </div>
                            <div className="item-code">{item.dynamic_serial_no}</div>
                        </div>
                    ))}
                </div>
            </div>
        </>

    );
}

// function DetailRow({ label, value }) {
//     return (
//         <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline py-1">
//             <span className="text-gray-600 text-sm font-medium">{label}:</span>
//             <span className="text-sm text-gray-600 mt-1 sm:mt-0">{value || "N/A"}</span>
//         </div>
//     );
// }

function DetailRow({ label, value }) {
    if (label.toLowerCase() === "recording" && value) {
        return (
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1">
                <span className="text-gray-600 text-sm font-medium">{label}:</span>
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
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline py-1">
            <span className="text-gray-600 text-sm font-medium">{label}:</span>
            <span className="text-sm text-gray-600 mt-1 sm:mt-0">{value || "N/A"}</span>
        </div>
    );
}

function InfoItem({ label, value }) {
    return (
        <div className="flex flex-col sm:flex-row py-2 border-b border-gray-200 last:border-b-0">
            <span className="text-gray-600 text-sm font-medium w-32 shrink-0">{label}:</span>
            <span className="text-sm text-gray-600 ml-0 sm:ml-4 mt-1 sm:mt-0">{value || "N/A"}</span>
        </div>
    );
}
function NoteDetail({ label, value }) {
    const formattedLines = value?.split('\n').filter(line => line.trim() !== '') || [];

    return (
        <div className="py-2 border-b border-gray-100">
            <span className="text-gray-700 font-semibold text-sm block mb-1">{label}</span>
            <ul className="pl-4 list-disc text-sm text-gray-600 space-y-1">
                {formattedLines.map((line, idx) => (
                    <li key={idx}>{line.trim()}</li>
                ))}
            </ul>
        </div>
    );
}

// function Timestamp({ label, value }) {
//     return (
//         <div className="flex flex-col">
//             <span className="uppercase tracking-wide text-[10px] text-gray-500 font-semibold mb-1">{label}</span>
//             <span className="font-medium text-gray-800 text-sm">{value ? new Date(value).toLocaleString() : "N/A"}</span>
//         </div>
//     );
// }

// function Workers({ label, value }) {
//     return (
//         <div className="flex flex-col">
//             <span className="uppercase tracking-wide text-[10px] text-gray-500 font-semibold mb-1">{label}</span>
//             <span className="font-medium text-gray-800 text-sm">{value}</span>
//         </div>
//     );
// }

function InfoBlock({ icon: Icon, label, value }) {
    return (
        <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition">
            <div className="p-2 rounded-md bg-gray-200 flex items-center justify-center">
                <Icon size={16} className="text-gray-600" />
            </div>
            <div className="flex flex-col">
                <span className="uppercase tracking-wide text-[10px] text-gray-500 font-semibold">
                    {label}
                </span>
                <span className="font-medium text-gray-800 text-sm">
                    {value || "N/A"}
                </span>
            </div>
        </div>
    );
}

export default OrderView;
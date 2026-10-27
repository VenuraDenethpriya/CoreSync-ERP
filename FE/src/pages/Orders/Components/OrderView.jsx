import { Separator } from "@/components/ui/separator";
import { useNavigate, useParams } from "react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import BreadCrumbs from "@/components/ui/BreadCrumbs";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { EditOrder } from "./EditOrder";
import { Badge } from "@/components/ui/badge";
import OrderTemplate from "./OrderPdf";
import { deleteOrder, featchOrderById, orderPaymentsRefund } from "@/api/orderApi";
import { CalendarDays, ChevronDown, ChevronUp, Clock, Download, ExternalLink, Pencil, Printer, Trash2, User, Users, FileText, LockIcon } from "lucide-react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { DeleteAlert } from "./OrderDeleteAlert";
import { Roles } from "@/const/const";
import { fetchProductById } from "@/api/productApi";
import { deleteInventoryAllocation, deleteInventoryUsage, featchInventoryAllocation, featchInventoryUsage, updateInventoryAllocationCount, updateInventoryUsageCount } from "@/api/inventoryApi";
import EditUsageCount from "./EditUsageCount";
import { ErrorState } from "@/components/Skeleton";
import { Button } from "@/components/ui/button";
import TCDropDown from "./T&CDropDown";
import CreditNotePdf from "./CreditNotePdf";
import { useReactToPrint } from "react-to-print";
import Barcode from "react-barcode";
import { flushSync } from "react-dom";
import DeliveryNotePdf from "./DeliveryNotePdf";
import autoTable from "jspdf-autotable";
import jsPDF from "jspdf";
import { PaginationComponent } from "@/components/Pagination";

// Dialog Components for the Split Invoice Modal
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AddUsage from "@/pages/Approvals/Components/AddUsage";

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
    const [itemAllocation, setItemAllocation] = useState([]);

    const [isOpen, setIsOpen] = useState(false);
    const [total, setTotal] = useState(0);
    const [limit, setLimit] = useState(10);
    const [offset, setOffset] = useState(0);
    const [limitUsage, setLimitUsage] = useState(5);
    const [offsetUsage, setOffsetUsage] = useState(0);

    const [allocationTotal, setAllocationTotal] = useState();
    const [allocationLimit, setAllocationLimit] = useState(10);
    const [allocationOffset, setAllocationOffset] = useState(0);

    const [currentEditItem, setCurrentEditItem] = useState(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isUsageLoading, setIsUsageLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const totalLoanAmount = orderData?.payments?.reduce((acc, payment) => acc + (payment.loan_amount || 0), 0) || 0;

    const [itemUsageData, setItemUsageData] = useState([]);
    const componentRef = useRef(null);
    const [printableItems, setPrintableItems] = useState([]);

    // --- Split Invoice Modal State ---
    const [invoiceItem, setInvoiceItem] = useState(null);
    const [invoiceItemIndex, setInvoiceItemIndex] = useState(0);
    const [customCustomerName, setCustomCustomerName] = useState("");
    const [customEmail, setCustomEmail] = useState("");
    const [customPhone1, setCustomPhone1] = useState("");
    const [customPhone2, setCustomPhone2] = useState("");
    const [customAddress, setCustomAddress] = useState("");
    const [customPrice, setCustomPrice] = useState(0);
    const [customQty, setCustomQty] = useState(1);

    // Handoff states to prevent nested modal locking
    const [splitOrderData, setSplitOrderData] = useState(null);
    const splitTCRef = useRef(null);

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
                toast.success("Order deleted successfully!", { position: "bottom-right" });
                navigate("/orders");
            }
        } catch (error) {
            console.error("Error deleting order:", error);
        }
    };

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
            } finally {
                setIsLoading(false);
                setIsError(false);
            }
        };

        fetchProductData();
    }, [orderData?.id, getToken, isLoaded]);

    const enrichedOrderData = useMemo(() => {
        if (!orderData || !orderData.order_items) return null;

        let batteryCount = 0;
        const groupedItemsMap = new Map();

        orderData.order_items.forEach((item) => {
            const product = productData?.find(p => p.id === item.product_id);
            const isBatteryPack = product && product.category?.toUpperCase() === 'BATTERY_PACK';

            let currentItemSerials = [];

            if (isBatteryPack && !item.serial_no) {
                batteryCount++;
                const sequence = batteryCount.toString().padStart(3, '0');
                const generatedBase = `${orderData.type}${orderData.order_no}BP-${sequence}`;

                const qty = item.quantity || 1;
                for (let i = 1; i <= qty; i++) {
                    currentItemSerials.push({ serial: `${generatedBase}/${i}`, id: item.id });
                }
            } else if (item.serial_no) {
                currentItemSerials.push({ serial: item.serial_no, id: item.id });
            }

            const currentQty = item.quantity || 1;
            const currentUnitPrice = parseFloat(item.unit_price) || 0;

            if (groupedItemsMap.has(item.product_id)) {
                const existingRow = groupedItemsMap.get(item.product_id);
                existingRow.quantity += currentQty;
                existingRow.subtotal = existingRow.quantity * currentUnitPrice;

                if (currentItemSerials.length > 0) {
                    existingRow.combined_serials = [...existingRow.combined_serials, ...currentItemSerials];
                }
            } else {
                groupedItemsMap.set(item.product_id, {
                    ...item,
                    product_name: product?.name || item.product_name,
                    quantity: currentQty,
                    subtotal: currentQty * currentUnitPrice,
                    combined_serials: currentItemSerials
                });
            }
        });

        const groupedItemsArray = Array.from(groupedItemsMap.values());
        return { ...orderData, order_items: groupedItemsArray };
    }, [orderData, productData]);

    // --- Split Invoice Handlers ---
    const openInvoiceModal = (item, index) => {
        setInvoiceItem(item);
        setInvoiceItemIndex(index);
        setCustomCustomerName(`${orderData?.first_name || ""} ${orderData?.last_name || ""}`.trim());
        setCustomEmail(orderData?.email || "");
        setCustomPhone1(orderData?.phone_no1 || "");
        setCustomPhone2(orderData?.phone_no2 || "");
        setCustomAddress(orderData?.address || "");
        setCustomPrice(parseFloat(item.unit_price) || 0);
        setCustomQty(parseFloat(item.quantity) || 1);
    };

    const invoiceSuffix = String.fromCharCode(65 + invoiceItemIndex); // 0 -> A, 1 -> B
    const customInvoiceNo = `${orderData?.type || ""}${orderData?.order_no || ""}-${invoiceSuffix}`;

    const customOrderDataForPdf = useMemo(() => {
        if (!orderData || !invoiceItem) return null;

        const names = customCustomerName.trim().split(" ");
        const fName = names[0] || "";
        const lName = names.slice(1).join(" ") || "";
        const newSubtotal = customPrice * customQty;
        const newVat = orderData.vat ? newSubtotal * 0.18 : 0;
        const newTotal = newSubtotal + newVat;

        return {
            ...orderData,
            first_name: fName,
            last_name: lName,
            email: customEmail,
            phone_no1: customPhone1,
            phone_no2: customPhone2,
            address: customAddress,
            order_no: `${orderData.order_no}-${invoiceSuffix}`,
            subtotal: newSubtotal,
            total: newTotal,
            discount: 0,
            additional_charges: [],
            order_items: [
                {
                    ...invoiceItem,
                    unit_price: customPrice,
                    quantity: customQty,
                    subtotal: newSubtotal
                }
            ]
        };
    }, [orderData, invoiceItem, customCustomerName, customEmail, customPhone1, customPhone2, customAddress, customPrice, customQty, invoiceSuffix]);

    const handleProceedToTC = () => {
        setSplitOrderData(customOrderDataForPdf);
        setInvoiceItem(null);

        setTimeout(() => {
            if (splitTCRef.current) {
                const btn = splitTCRef.current.querySelector('button');
                if (btn) btn.click();
            }
        }, 150);
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
        @page { size: 50mm 25mm; margin: 0mm !important; }
        html, body { margin: 0 !important; padding: 0 !important; width: 50mm; height: 25mm; }
        .print-wrapper { width: 100%; display: block; }
        .barcode-label { width: 50mm; height: 25mm; margin: 0; transform: translateX(2mm); padding: 1mm; box-sizing: border-box; page-break-after: always; overflow: hidden; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; }
        .barcode-label:last-child { page-break-after: auto; }
        .company-name { font-size: 8px; font-weight: 700; margin-bottom: 2px; width: 100%; text-align: center; }
        .barcode-container { width: 100%; display: flex; justify-content: center; align-items: center; }
        .item-code { font-size: 9px; font-weight: 700; margin-top: 1px; width: 100%; text-align: center; }
        svg { display: block !important; margin: 0 auto !important; width: 100% !important; max-width: 45mm !important; height: auto !important; max-height: 14mm !important; }
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
    }, [orderData?.id, getToken, isLoaded, limit, offset, limitUsage, offsetUsage]);

    const handleDeleteUsage = async (usageId, itemId, usageCount) => {
        try {
            const token = await getToken();
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
            const allocationData = {
                id: item.id,
                item_id: item.item_id,
                count: parseInt(newCount),
                old_count: item.count || item.usage_count
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

    const CoreSyncLogo = 'https://res.cloudinary.com/dgw1roazt/image/upload/v1751611906/logo-long_q8epm3.png';
    const CoreSyncEnergyLogo = 'https://res.cloudinary.com/dgw1roazt/image/upload/v1753696463/Renewa_Energy_tyin8p.png';

    const generatePaymentProof = (action = 'download', paymentItem = null) => {
        const logoUrl = orderData?.vat === true ? CoreSyncLogo : CoreSyncEnergyLogo;
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = logoUrl;

        img.onload = () => {
            const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: [80, 140] });

            const orderRef = `${orderData?.type || ""}${orderData?.order_no || ""}`;
            const customerName = `${orderData?.first_name || ""} ${orderData?.last_name || ""}`.trim() || "Customer";

            const logoWidth = 50;
            const logoHeight = 12;
            const logoX = (80 - logoWidth) / 2;
            const logoY = 4;

            doc.addImage(img, "PNG", logoX, logoY, logoWidth, logoHeight);

            doc.setTextColor(0, 0, 0);
            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");

            doc.text(paymentItem ? "PAYMENT RECEIPT" : "TOTAL PAYMENT SUMMARY", 40, 20, { align: "center" });

            doc.setLineWidth(0.3);
            doc.line(5, 24, 75, 24);

            doc.setFontSize(8);
            doc.setFont("helvetica", "bold");
            doc.text("Order Details:", 5, 30);

            doc.setFont("helvetica", "normal");
            doc.text(`Ref: ${orderRef}`, 5, 35);

            const safeName = customerName.length > 25 ? customerName.substring(0, 25) + "..." : customerName;
            doc.text(`Cust: ${safeName}`, 5, 40);

            const printDate = new Date().toLocaleDateString(undefined, {
                year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });
            doc.text(`Date: ${printDate}`, 5, 45);

            const tableColumn = ["Date", "Type", "Mode", "By", { content: "Amount", styles: { halign: "right" } }];
            const tableRows = [];
            let totalAmount = 0;

            if (paymentItem) {
                const isLoan = !!paymentItem.loan_amount;
                const amount = isLoan ? Number(paymentItem.loan_amount) : Number(paymentItem.amount);
                const date = paymentItem.paid_date ? new Date(paymentItem.paid_date).toLocaleDateString() : "-";
                const mode = paymentItem.payment_mode || "-";

                tableRows.push([
                    date,
                    isLoan ? "Loan" : paymentItem.payment_type,
                    isLoan ? "-" : mode,
                    paymentItem.created_by || "-",
                    amount.toLocaleString(undefined, { minimumFractionDigits: 2 })
                ]);
                totalAmount = amount;
            } else {
                const payments = orderData?.payments || [];

                const loanMetadataItem = payments.find(p => Number(p.loan_amount) > 0);
                if (loanMetadataItem) {
                    const loanAmt = Number(loanMetadataItem.loan_amount);
                    tableRows.push([
                        loanMetadataItem.paid_date ? new Date(loanMetadataItem.paid_date).toLocaleDateString() : "-",
                        "Loan",
                        "-",
                        loanMetadataItem.created_by || "-",
                        loanAmt.toLocaleString(undefined, { minimumFractionDigits: 2 })
                    ]);
                    totalAmount += loanAmt;
                }

                payments.forEach(item => {
                    if (item.payment_type !== "None" && Number(item.amount) > 0) {
                        const amt = Number(item.amount);
                        tableRows.push([
                            item.paid_date ? new Date(item.paid_date).toLocaleDateString() : "-",
                            item.payment_type,
                            item.payment_mode || "-",
                            item.created_by || "-",
                            amt.toLocaleString(undefined, { minimumFractionDigits: 2 })
                        ]);
                        totalAmount += amt;
                    }
                });

                tableRows.push([
                    { content: 'TOTAL (LKR)', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold' } },
                    { content: totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 }), styles: { fontStyle: 'bold' } }
                ]);
            }

            autoTable(doc, {
                startY: 48,
                head: [tableColumn],
                body: tableRows,
                theme: 'plain',
                margin: { left: 4, right: 4 },
                styles: {
                    font: "helvetica",
                    fontSize: 6,
                    cellPadding: 1.5,
                    textColor: [0, 0, 0],
                    halign: 'left'
                },
                headStyles: {
                    fontStyle: 'bold',
                    lineWidth: { bottom: 0.3 },
                    lineColor: [0, 0, 0],
                    halign: 'left'
                },
                bodyStyles: {
                    lineWidth: { bottom: 0.1 },
                    lineColor: [200, 200, 200]
                },
                columnStyles: {
                    0: { cellWidth: 15 },
                    1: { cellWidth: 13 },
                    2: { cellWidth: 12 },
                    3: { cellWidth: 14 },
                    4: { halign: 'right' }
                }
            });

            const pageHeight = doc.internal.pageSize.getHeight();
            let footerY = pageHeight - 38;

            doc.setLineWidth(0.3);
            doc.setLineDashPattern([1, 1], 0);
            doc.line(5, footerY, 75, footerY);
            doc.setLineDashPattern([], 0);

            footerY += 5;

            doc.setTextColor(0, 0, 0);
            doc.setFontSize(8);
            doc.setFont("helvetica", "bold");
            doc.text(orderData?.vat === true ? "CoreSync Private Limited" : "CoreSync Energy", 40, footerY, { align: "center" });

            footerY += 4;
            doc.setFontSize(7);
            doc.setFont("helvetica", "normal");
            doc.text("No 11, __________, Sril Lanka, Sri Lanka", 40, footerY, { align: "center" });

            footerY += 4;
            doc.text("Hotline: (+94) 74 302 0154", 40, footerY, { align: "center" });

            footerY += 4;
            doc.text("Email: CoreSync.energy@gmail.com", 40, footerY, { align: "center" });

            if (orderData?.vat) {
                footerY += 4;
                doc.text("VAT Reg No: 103466954 - 7000", 40, footerY, { align: "center" });
            }
            footerY += 6;
            doc.setFontSize(8);
            doc.text("Thank you for your business.", 40, footerY, { align: "center" });

            footerY += 4;
            doc.setFontSize(6);
            doc.setTextColor(100);
            doc.text("This is a computer-generated document.", 40, footerY, { align: "center" });

            const fileName = paymentItem ? `Receipt_${orderRef}_${new Date().getTime()}.pdf` : `Total_Payments_${orderRef}.pdf`;

            if (action === 'print') {
                doc.autoPrint();
                const blob = doc.output('blob');
                const blobURL = URL.createObjectURL(blob);
                window.open(blobURL, '_blank');
            } else {
                doc.save(fileName);
            }
        };

        img.onerror = () => {
            console.error("Failed to load receipt logo from Cloudinary.");
            toast.error("Failed to generate receipt. Logo could not be loaded.");
        };
    };

    const discountAmount = parseFloat(orderData?.discount) || 0;
    const subtotal = parseFloat(orderData?.subtotal) || 0;
    const additionalCharges = (orderData?.additional_charges || []).reduce((sum, item) => sum + (parseFloat(item.value) || 0), 0);
    const subTotalWithAdditionalCharges = subtotal + additionalCharges;
    const discountPercentage = subTotalWithAdditionalCharges > 0 ? (discountAmount / subTotalWithAdditionalCharges) * 100 : 0;
    const totalPaid = orderData?.payments?.map(payment => payment.amount).reduce((acc, amount) => acc + amount, 0) || 0;
    const vatAmount = orderData?.vat == true ? orderData?.total * 0.18 : 0;
    const netTotal = (orderData?.total || 0) + vatAmount;

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
            const response = await featchInventoryAllocation(token, { orderId, limit: allocationLimit, offset: allocationOffset });
            setItemAllocation(response?.data?.items || []);
            setAllocationTotal(response?.data.total || 0);
        } catch (error) {
            console.error("Error fetching item allocation:", error);
        }
    };

    useEffect(() => {
        if (orderId) {
            fetchAllocationData();
        }
    }, [orderId, getToken, allocationLimit, allocationOffset]);

    const handleDeleteAllocation = async (ID, item) => {
        try {
            const token = await getToken();
            const payload = {
                id: ID,
                item_id: item.item_id,
                count: item.count || item.usage_count,
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
    };

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
    };

    if (user?.publicMetadata?.role === Roles.WAREHOUSE_STAFF) {
        return (
            <div className="flex items-center justify-center min-h-[70vh] w-full px-4">
                <div className="bg-white shadow-sm rounded-2xl p-8 max-w-md text-center border border-red-100">
                    <div className="flex flex-col items-center justify-center gap-3">
                        <LockIcon className="w-12 h-12 text-red-500" />
                        <h1 className="text-xl font-bold text-gray-800">Access Denied</h1>
                        <p className="text-sm text-gray-500">
                            You are not authorized to access this page. Please contact your administrator if you believe this is a mistake.
                        </p>
                        <Button
                            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl"
                            onClick={() => navigate("/")}
                        >
                            Go to Dashboard
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="w-full space-y-6 animate-pulse">
                {/* Header Skeleton */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/70 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="h-8 w-48 bg-slate-200 rounded-xl"></div>
                        <div className="h-6 w-20 bg-slate-100 rounded-full"></div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5">
                        <div className="h-10 w-24 bg-slate-200 rounded-xl"></div>
                        <div className="h-10 w-28 bg-slate-200 rounded-xl"></div>
                        <div className="h-10 w-32 bg-blue-100 rounded-xl"></div>
                    </div>
                </div>

                {/* Customer Details Skeleton */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                    <div className="h-6 w-40 bg-slate-200 rounded-lg mb-5"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex justify-between items-center py-1.5">
                                <div className="h-4 w-28 bg-slate-200 rounded"></div>
                                <div className="h-4 w-40 bg-slate-100 rounded"></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Product Details Table Skeleton */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                    <div className="flex justify-between items-center mb-5">
                        <div className="h-6 w-40 bg-slate-200 rounded-lg"></div>
                    </div>
                    <div className="rounded-xl border border-slate-100 overflow-hidden mb-6">
                        <div className="bg-slate-50 px-4 py-3 grid grid-cols-5 gap-4">
                            <div className="h-3 w-24 bg-slate-200 rounded"></div>
                            <div className="h-3 w-20 bg-slate-200 rounded ml-auto"></div>
                            <div className="h-3 w-16 bg-slate-200 rounded ml-auto"></div>
                            <div className="h-3 w-20 bg-slate-200 rounded ml-auto"></div>
                            <div className="h-3 w-24 bg-slate-200 rounded ml-auto"></div>
                        </div>
                        {Array.from({ length: 2 }).map((_, i) => (
                            <div key={i} className="px-4 py-3 grid grid-cols-5 gap-4 border-t border-slate-100">
                                <div className="h-4 w-48 bg-slate-200 rounded"></div>
                                <div className="h-4 w-20 bg-slate-100 rounded ml-auto"></div>
                                <div className="h-4 w-12 bg-slate-100 rounded ml-auto"></div>
                                <div className="h-4 w-20 bg-slate-100 rounded ml-auto"></div>
                                <div className="h-8 w-24 bg-blue-100 rounded-xl ml-auto"></div>
                            </div>
                        ))}
                    </div>
                    {/* Totals Skeleton */}
                    <div className="pt-4 border-t border-slate-100 space-y-3">
                        <div className="flex justify-between">
                            <div className="h-4 w-20 bg-slate-200 rounded"></div>
                            <div className="h-4 w-24 bg-slate-200 rounded"></div>
                        </div>
                        <div className="flex justify-between">
                            <div className="h-4 w-24 bg-slate-200 rounded"></div>
                            <div className="h-4 w-24 bg-slate-100 rounded"></div>
                        </div>
                        <div className="flex justify-between pt-3 border-t border-slate-200">
                            <div className="h-5 w-24 bg-slate-300 rounded"></div>
                            <div className="h-5 w-32 bg-slate-300 rounded"></div>
                        </div>
                    </div>
                </div>

                {/* Payment Details Skeleton */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                    <div className="h-6 w-40 bg-slate-200 rounded-lg mb-5"></div>
                    <div className="rounded-xl border border-slate-100 overflow-hidden mb-6">
                        <div className="bg-slate-50 px-4 py-3 grid grid-cols-6 gap-4">
                            <div className="h-3 w-20 bg-slate-200 rounded"></div>
                            <div className="h-3 w-16 bg-slate-200 rounded"></div>
                            <div className="h-3 w-16 bg-slate-200 rounded"></div>
                            <div className="h-3 w-24 bg-slate-200 rounded"></div>
                            <div className="h-3 w-20 bg-slate-200 rounded"></div>
                            <div className="h-3 w-12 bg-slate-200 rounded ml-auto"></div>
                        </div>
                        {Array.from({ length: 2 }).map((_, i) => (
                            <div key={i} className="px-4 py-3 grid grid-cols-6 gap-4 border-t border-slate-100">
                                <div className="h-4 w-24 bg-slate-200 rounded"></div>
                                <div className="h-4 w-16 bg-slate-100 rounded"></div>
                                <div className="h-4 w-16 bg-slate-100 rounded"></div>
                                <div className="h-4 w-28 bg-slate-100 rounded"></div>
                                <div className="h-4 w-24 bg-slate-100 rounded"></div>
                                <div className="h-4 w-16 bg-slate-100 rounded ml-auto"></div>
                            </div>
                        ))}
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
            {/* Split Invoice Standard Radix Dialog */}
            <Dialog open={!!invoiceItem} onOpenChange={(open) => !open && setInvoiceItem(null)}>
                <DialogContent className="sm:max-w-2xl p-6 bg-white rounded-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-slate-800">Generate Split Invoice</DialogTitle>
                        <DialogDescription className="text-slate-500 font-medium pt-1">
                            Creating Invoice: <span className="text-blue-600 font-mono font-bold ml-1">{customInvoiceNo}</span>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-5 py-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2.5">
                                <Label className="text-slate-600 font-bold text-xs uppercase tracking-wider">Customer Name</Label>
                                <Input
                                    value={customCustomerName}
                                    onChange={(e) => setCustomCustomerName(e.target.value)}
                                    className="h-11 rounded-xl bg-slate-50 border-slate-200"
                                />
                            </div>
                            <div className="space-y-2.5">
                                <Label className="text-slate-600 font-bold text-xs uppercase tracking-wider">Email</Label>
                                <Input
                                    value={customEmail}
                                    onChange={(e) => setCustomEmail(e.target.value)}
                                    className="h-11 rounded-xl bg-slate-50 border-slate-200"
                                />
                            </div>
                            <div className="space-y-2.5">
                                <Label className="text-slate-600 font-bold text-xs uppercase tracking-wider">Phone 1</Label>
                                <Input
                                    value={customPhone1}
                                    onChange={(e) => setCustomPhone1(e.target.value)}
                                    className="h-11 rounded-xl bg-slate-50 border-slate-200"
                                />
                            </div>
                            <div className="space-y-2.5">
                                <Label className="text-slate-600 font-bold text-xs uppercase tracking-wider">Phone 2</Label>
                                <Input
                                    value={customPhone2}
                                    onChange={(e) => setCustomPhone2(e.target.value)}
                                    className="h-11 rounded-xl bg-slate-50 border-slate-200"
                                />
                            </div>
                            <div className="space-y-2.5 sm:col-span-2">
                                <Label className="text-slate-600 font-bold text-xs uppercase tracking-wider">Address</Label>
                                <Input
                                    value={customAddress}
                                    onChange={(e) => setCustomAddress(e.target.value)}
                                    className="h-11 rounded-xl bg-slate-50 border-slate-200"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                            <div className="space-y-2.5">
                                <Label className="text-slate-600 font-bold text-xs uppercase tracking-wider">Unit Price (LKR)</Label>
                                <Input
                                    type="number"
                                    value={customPrice}
                                    onChange={(e) => setCustomPrice(Number(e.target.value))}
                                    className="h-11 rounded-xl bg-slate-50 border-slate-200"
                                />
                            </div>
                            <div className="space-y-2.5">
                                <Label className="text-slate-600 font-bold text-xs uppercase tracking-wider">Quantity</Label>
                                <Input
                                    type="number"
                                    value={customQty}
                                    onChange={(e) => setCustomQty(Number(e.target.value))}
                                    className="h-11 rounded-xl bg-slate-50 border-slate-200"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-5 mt-4 border-t border-slate-100">
                        <Button variant="outline" className="h-10 rounded-xl px-5 font-semibold text-slate-600 border-slate-200" onClick={() => setInvoiceItem(null)}>Cancel</Button>
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 px-5 shadow-sm"
                            onClick={handleProceedToTC}
                        >
                            Continue
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Header Section */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/70 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
                        {orderData?.type} {orderData?.order_no}
                    </h1>
                    {getStatusBadge(orderData?.OrderStatus)}
                </div>

                {/* Action Buttons */}
                {user?.publicMetadata?.role == Roles.WAREHOUSE_STAFF || user.publicMetadata.role == Roles.READ_ONLY ? null : (
                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                        {isMobile ? (
                            <div className="w-full flex flex-col gap-2">
                                <TCDropDown
                                    className="w-full"
                                    orderData={enrichedOrderData}
                                    discountPercentage={discountPercentage}
                                    totalPaid={totalPaid}
                                    isClient={isClient}
                                    vatAmount={vatAmount}
                                    netTotal={netTotal}
                                />
                            </div>
                        ) : (
                            <div className="flex items-center gap-2.5">
                                {user?.publicMetadata?.role === Roles.WAREHOUSE_STAFF || user?.publicMetadata?.role === Roles.INVENTORY_MANAGER || user?.publicMetadata?.role === Roles.SALES_TEAM || user?.publicMetadata?.role === Roles.FINANCE_HEAD ? null : (
                                    <EditOrder orderData={enrichedOrderData} totalLoanAmount={totalLoanAmount} onUpdate={fetchOrderData} />
                                )}

                                {(user?.publicMetadata?.role === Roles.HEAD || user?.publicMetadata?.role === Roles.SUPER_ADMIN) && (
                                    <DeleteAlert handleDelete={handleDelete} orderData={orderData} type="order" />
                                )}

                                {(user?.publicMetadata?.role === Roles.HEAD || user?.publicMetadata?.role === Roles.SUPER_ADMIN || user?.publicMetadata?.role === Roles.INVENTORY_MANAGER || user?.publicMetadata?.role === Roles.OFFICE_STAFF) && (
                                    <PDFDownloadLink
                                        document={<DeliveryNotePdf orderData={enrichedOrderData} />}
                                        fileName={`Delivery Note-${orderData?.type + orderData?.order_no}.pdf`}
                                        className="inline-flex items-center justify-center rounded-xl text-sm font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 h-10 px-4 shadow-sm transition-colors"
                                    >
                                        {({ loading }) => loading ? "Generating..." : "Delivery Note"}
                                    </PDFDownloadLink>
                                )}

                                {user?.publicMetadata?.role !== Roles.WAREHOUSE_STAFF && user?.publicMetadata?.role !== Roles.INVENTORY_MANAGER && user?.publicMetadata?.role !== Roles.FINANCE_HEAD && (
                                    <TCDropDown
                                        orderData={enrichedOrderData}
                                        discountPercentage={discountPercentage}
                                        totalPaid={totalPaid}
                                        isClient={isClient}
                                        vatAmount={vatAmount}
                                        netTotal={netTotal}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="space-y-6">

                {/* Customer Details Card */}
                {user?.publicMetadata?.role !== Roles.WAREHOUSE_STAFF && (
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                        <h3 className="text-lg font-bold mb-5 text-slate-800">Customer Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
                            <DetailRow label="Name" value={`${orderData?.title || ""} ${orderData?.first_name || ""} ${orderData?.last_name || ""}`.trim()} />
                            <DetailRow label="Email" value={orderData?.email} />
                            <DetailRow label="Phone No. 1" value={orderData?.phone_no1} />
                            <DetailRow label="Phone No. 2" value={orderData?.phone_no2} />
                            <DetailRow label="Address" value={orderData?.address} />
                            {orderData?.po_no && <DetailRow label="PO No" value={orderData?.po_no} />}
                            {orderData?.vat_no && <DetailRow label="VAT No" value={orderData?.vat_no} />}
                            {orderData?.tin_no && <DetailRow label="TIN No" value={orderData?.tin_no} />}
                        </div>
                    </div>
                )}

                {/* Product Details Card */}
                {user?.publicMetadata?.role !== Roles.WAREHOUSE_STAFF && (
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                        <h3 className="text-lg font-bold mb-5 text-slate-800">Product Details</h3>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-100">
                                <thead>
                                    <tr className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                                        <th scope="col" className="px-4 py-2.5 text-left">Product Name</th>
                                        <th scope="col" className="px-4 py-2.5 text-right">Unit Price (LKR)</th>
                                        <th scope="col" className="px-4 py-2.5 text-right">Quantity</th>
                                        <th scope="col" className="px-4 py-2.5 text-right">Subtotal (LKR)</th>
                                        <th scope="col" className="px-4 py-2.5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {enrichedOrderData?.order_items?.map((item, index) => (
                                        <tr key={item.id} className="text-sm text-slate-700">
                                            <td className="px-4 py-3 font-semibold text-slate-800">
                                                <span
                                                    className="cursor-pointer hover:text-blue-600 transition-colors"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/products/${item.product_id}`);
                                                    }}
                                                >
                                                    {item.product_name}
                                                </span>
                                                {item.combined_serials && item.combined_serials.length > 0 && (
                                                    <span className="ml-2 text-slate-400 text-xs font-normal">
                                                        ({item.combined_serials.map((serialObj, sIdx) => (
                                                            <span key={sIdx}>
                                                                <span
                                                                    className="cursor-pointer hover:text-blue-600 transition-colors underline"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        navigate(`/orders/packs/${serialObj.id}`);
                                                                    }}
                                                                >
                                                                    {serialObj.serial}
                                                                </span>
                                                                {sIdx < item.combined_serials.length - 1 && ", "}
                                                            </span>
                                                        ))})
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium">
                                                {parseFloat(item.unit_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium">{parseFloat(item.quantity)}</td>
                                            <td className="px-4 py-3 text-right font-semibold text-slate-800">
                                                {parseFloat(item.subtotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 px-2.5 text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
                                                    onClick={() => openInvoiceModal(item, index)}
                                                >
                                                    <FileText className="w-3.5 h-3.5 mr-1" />
                                                    Split Invoice
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pricing Summary */}
                        <div className="mt-6 pt-4 border-t border-slate-100 space-y-2.5 text-sm">
                            <div className="flex justify-between font-semibold text-slate-700">
                                <span>Subtotal</span>
                                <span>LKR {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>

                            {orderData?.additional_charges?.map((charge, index) => (
                                <div key={index} className="flex justify-between text-slate-500 font-medium">
                                    <span>{charge.type}</span>
                                    <span>+ LKR {parseFloat(charge.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            ))}
                            {orderData?.discount && Number(orderData?.discount) > 0 && (
                                <div className="flex justify-between text-slate-500 font-medium">
                                    <span>Discount ({discountPercentage.toFixed(2)}%)</span>
                                    <span>- LKR {Number(orderData.discount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            )}
                            {orderData?.vat && (
                                <div className="flex justify-between text-slate-500 font-medium">
                                    <span>VAT (18%)</span>
                                    <span>+ LKR {vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-extrabold text-base text-slate-900 pt-3 border-t border-slate-200">
                                <span>Net Total</span>
                                <span>LKR {netTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Payment Details Card */}
                {user?.publicMetadata?.role !== Roles.WAREHOUSE_STAFF && (
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                        <h3 className="text-lg font-bold mb-5 text-slate-800">Payment Details</h3>
                        <div className="space-y-4">
                            <div className="grid sm:grid-cols-7 grid-cols-1 text-xs text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 pb-2">
                                <span>Paid Date</span>
                                <span>Type</span>
                                <span>Mode</span>
                                <span>Created By</span>
                                <span>Amount</span>
                                <span>Receipt</span>
                                <span className="text-right">Actions</span>
                            </div>

                            {(() => {
                                const payments = orderData?.payments || [];
                                const totalLoanAmount = payments.reduce((acc, item) => acc + (Number(item.loan_amount) || 0), 0);
                                const totalPaymentAmount = payments.filter(item => item.payment_type !== "None").reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
                                const grandTotalPaid = totalLoanAmount + totalPaymentAmount;
                                const loanMetadataItem = payments.find(p => Number(p.loan_amount) > 0);
                                const validPayments = payments.filter(p => p.payment_type !== "None" && (Number(p.amount) > 0 || Number(p.loan_amount) > 0));
                                const allPaymentsConfirmed = validPayments.length > 0 && validPayments.every(p => p.status === "Confirmed");

                                return (
                                    <>
                                        {totalLoanAmount > 0 && (
                                            <div className="grid sm:grid-cols-7 grid-cols-1 items-center text-sm text-slate-700 font-semibold border-b border-slate-100 py-3">
                                                <span>{loanMetadataItem?.paid_date ? new Date(loanMetadataItem.paid_date).toLocaleString() : "-"}</span>
                                                <span className="text-amber-600">Loan</span>
                                                <span>-</span>
                                                <span>{loanMetadataItem?.created_by || "-"}</span>
                                                <span>{totalLoanAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                <span>-</span>
                                                <span className="flex justify-end gap-1">
                                                    <Button
                                                        onClick={() => generatePaymentProof('print', loanMetadataItem)}
                                                        variant="ghost" size="sm" title="Print Receipt"
                                                        className="h-8 px-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 disabled:opacity-50"
                                                        disabled={loanMetadataItem?.status !== "Confirmed"}
                                                    >
                                                        <Printer className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        onClick={() => generatePaymentProof('download', loanMetadataItem)}
                                                        variant="ghost" size="sm" title="Download Receipt"
                                                        className="h-8 px-2 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 disabled:opacity-50"
                                                        disabled={loanMetadataItem?.status !== "Confirmed"}
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </Button>
                                                </span>
                                            </div>
                                        )}

                                        {payments.map((item) => {
                                            if (item.payment_type === "None" || Number(item.amount) <= 0) return null;
                                            return (
                                                <div key={item.id} className="grid sm:grid-cols-7 grid-cols-1 items-center text-sm text-slate-700 font-medium border-b border-slate-100 py-3 hover:bg-slate-50/50 transition-colors">
                                                    <span>{item.paid_date ? new Date(item.paid_date).toLocaleString() : "-"}</span>
                                                    <span>{item.payment_type}</span>
                                                    <span className="font-semibold text-slate-800">{item.payment_mode || "-"}</span>
                                                    <span>{item.created_by}</span>
                                                    <span>{Number(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                    <span>
                                                        {item.image ? (
                                                            <a href={item.image} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold text-xs">
                                                                View <ExternalLink size="13px" />
                                                            </a>
                                                        ) : (
                                                            <span className="text-slate-300">-</span>
                                                        )}
                                                    </span>
                                                    <span className="flex justify-end gap-1">
                                                        <Button
                                                            onClick={() => generatePaymentProof('print', item)}
                                                            variant="ghost" size="sm" title="Print Receipt"
                                                            className="h-8 px-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 disabled:opacity-50"
                                                            disabled={item.status !== "Confirmed"}
                                                        >
                                                            <Printer className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            onClick={() => generatePaymentProof('download', item)}
                                                            variant="ghost" size="sm" title="Download Receipt"
                                                            className="h-8 px-2 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 disabled:opacity-50"
                                                            disabled={item.status !== "Confirmed"}
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </Button>
                                                    </span>
                                                </div>
                                            );
                                        })}

                                        {grandTotalPaid > 0 && (
                                            <div className="flex flex-wrap gap-4 justify-between items-center pt-6 mt-4 border-t border-slate-200">
                                                <div className="flex flex-wrap gap-3">
                                                    <div className="text-slate-800 text-sm font-bold bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200/70 shadow-sm">
                                                        Total Paid: <span className="text-emerald-600 ml-1">LKR {grandTotalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                    </div>
                                                    <div className="text-slate-800 text-sm font-bold bg-rose-50 px-4 py-2.5 rounded-xl border border-rose-100 shadow-sm">
                                                        Remaining: <span className="text-rose-600 ml-1">LKR {(netTotal - grandTotalPaid).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-2.5 items-center">
                                                    <Button
                                                        onClick={() => generatePaymentProof('print')}
                                                        variant="outline" size="sm"
                                                        className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl h-10 px-4 text-xs font-semibold disabled:opacity-50"
                                                        disabled={!allPaymentsConfirmed}
                                                    >
                                                        <Printer className="w-4 h-4 mr-2" /> Print Summary
                                                    </Button>
                                                    <Button
                                                        onClick={() => generatePaymentProof('download')}
                                                        variant="outline" size="sm"
                                                        className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl h-10 px-4 text-xs font-semibold disabled:opacity-50"
                                                        disabled={!allPaymentsConfirmed}
                                                    >
                                                        <Download className="w-4 h-4 mr-2" /> Download Summary
                                                    </Button>
                                                    <Button
                                                        onClick={handleRefundClick}
                                                        className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm h-10 px-4 text-xs font-semibold"
                                                    >
                                                        Refund
                                                    </Button>
                                                    {isClient && (
                                                        <PDFDownloadLink
                                                            onClick={handleCreditNoteClick}
                                                            document={<CreditNotePdf orderData={orderData} />}
                                                            fileName={`Credit Note-${orderData?.type + orderData?.order_no}.pdf`}
                                                            className="inline-flex items-center justify-center rounded-xl text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 h-10 px-4 shadow-sm transition-colors"
                                                        >
                                                            {({ loading }) => loading ? "Generating..." : "Credit Note"}
                                                        </PDFDownloadLink>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                )}

                {/* Notes Card */}
                {user?.publicMetadata?.role !== Roles.WAREHOUSE_STAFF && (
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                        <h3 className="text-lg font-bold mb-4 text-slate-800">Notes</h3>
                        <div className="space-y-3">
                            {orderData?.order_items?.map((item) =>
                                item.note && <NoteDetail key={item.id} label={item.product_name} value={item.note} />
                            )}
                            {!orderData?.order_items?.some(item => item.note) && (
                                <p className="text-sm text-slate-400">No specific notes available for products.</p>
                            )}
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
                            type="order"
                            orderData={orderData}
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

                {/* QC & Delivery Proof Card */}
                {user?.publicMetadata?.role !== Roles.WAREHOUSE_STAFF && (
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                        <h3 className="text-lg font-bold mb-5 text-slate-800">QC & Delivery Proof</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
                            <div className="flex justify-between items-center py-1.5">
                                <span className="text-slate-500 text-sm font-semibold">QC Proof:</span>
                                {orderData?.qc_proof ? (
                                    <a href={orderData.qc_proof} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium">
                                        View Image <ExternalLink size="14px" className="inline ml-1" />
                                    </a>
                                ) : (
                                    <span className="text-slate-300 text-sm italic font-normal">Not uploaded</span>
                                )}
                            </div>
                            <div className="flex justify-between items-center py-1.5">
                                <span className="text-slate-500 text-sm font-semibold">Delivery Proof:</span>
                                {orderData?.delivery_proof ? (
                                    <a href={orderData.delivery_proof} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium">
                                        View Image <ExternalLink size="14px" className="inline ml-1" />
                                    </a>
                                ) : (
                                    <span className="text-slate-300 text-sm italic font-normal">Not uploaded</span>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Sale Details Card */}
                {user?.publicMetadata?.role !== Roles.WAREHOUSE_STAFF && (
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                        <h3 className="text-lg font-bold mb-5 text-slate-800">Sale Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
                            <DetailRow label="No." value={orderData?.sales_no} />
                            <DetailRow label="Type" value={orderData?.sales_type} />
                            <DetailRow label="Salesperson" value={orderData?.salesperson} />
                            <DetailRow
                                label="Commission"
                                value={orderData?.commission != null ? Number(orderData.commission).toLocaleString('en-US', { style: 'currency', currency: 'LKR' }) : undefined}
                            />
                            <DetailRow label="Description" value={orderData?.description} />
                            <DetailRow label="Recording" value={orderData?.recording_url} />
                        </div>
                    </div>
                )}

                {/* Workers & Timestamps Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Workers</h3>
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

                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Timestamps</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InfoBlock
                                icon={CalendarDays}
                                label="Created At"
                                value={orderData?.created_at ? new Date(orderData.created_at).toLocaleString() : undefined}
                            />
                            <InfoBlock
                                icon={Clock}
                                label="Last Updated"
                                value={orderData?.updated_at ? new Date(orderData.updated_at).toLocaleString() : undefined}
                            />
                        </div>
                    </div>
                </div>

            </div>

            {/* Invisible container for TCDropDown auto-triggering on split invoice */}
            <div className="absolute opacity-0 pointer-events-none w-0 h-0 overflow-hidden" ref={splitTCRef}>
                {splitOrderData && (
                    <TCDropDown
                        orderData={splitOrderData}
                        discountPercentage={0}
                        totalPaid={0}
                        isClient={isClient}
                        vatAmount={splitOrderData.vat ? splitOrderData.subtotal * 0.18 : 0}
                        netTotal={splitOrderData.total}
                    />
                )}
            </div>

            {isOpen && currentEditItem && (
                <EditUsageCount
                    isOpen={isOpen}
                    setIsOpen={setIsOpen}
                    item={currentEditItem}
                    handleEditCount={currentEditItem.type === "allocation" ? handleEditAllocationCount : handleEditUsageCount}
                />
            )}
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

function NoteDetail({ label, value }) {
    const formattedLines = value?.split('\n').filter(line => line.trim() !== '') || [];

    return (
        <div className="py-2 border-b border-slate-100 last:border-0">
            <span className="text-slate-800 font-semibold text-sm block mb-1">{label}</span>
            <ul className="pl-4 list-disc text-sm text-slate-600 space-y-1">
                {formattedLines.map((line, idx) => (
                    <li key={idx} className="break-words">{line.trim()}</li>
                ))}
            </ul>
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

export default OrderView;
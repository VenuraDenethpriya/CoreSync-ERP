import { useNavigate, useParams } from "react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { featchOrderById, updateOrderStatus } from "@/api/orderApi";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { fetchProductById } from "@/api/productApi";
import { featchInventoryAllocation } from "@/api/inventoryApi";
import { ErrorState } from "@/components/Skeleton"; 
import HardwareDropDown from "./HardwareDropDown";
import DesignDropDown from "./DesignDropDown";
import { PaginationComponent } from "@/components/Pagination";
import ItemAllocation from "./ItemAllocation";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function ApprovalsView() {
    const { isLoaded, getToken } = useAuth();
    const { user } = useUser();
    const { orderId } = useParams();

    const breadcrumbs = [
        { name: "Dashboard", link: "/" },
        { name: "Approvals", link: "/approvals" },
        { name: "", link: `/approvals/${orderId}` },
    ];

    const [orderData, setOrderData] = useState(null);
    const [isClient, setIsClient] = useState(false);
    const [productID, setProductID] = useState([]);
    const [showProductDetails, setShowProductDetails] = useState({});
    const [usageData, setUsageData] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [total, setTotal] = useState(0);
    const [limit, setLimit] = useState(10);
    const [offset, setOffset] = useState(0);
    const [currentEditItem, setCurrentEditItem] = useState(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [itemAllocation, setItemAllocation] = useState([]);
    const [refreshTrigger, setRefreshTrigger] = useState(false);

    const [ready, setReady] = useState(false);

    const togleProductDetails = (id) => {
        setShowProductDetails(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };
    const [productData, setProductData] = useState();

    const navigate = useNavigate();

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isLoaded) return;
        setIsLoading(true);
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
            } finally {
                setIsLoading(false);
                setIsError(false);
            }
        };
        fetchOrderData();
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

    const fetchAllocationData = async () => {
        try {
            const token = await getToken();
            const response = await featchInventoryAllocation(token, { orderId, limit, offset });
            setItemAllocation(response?.data?.items || []);
            setTotal(response?.data.total || 0);
        } catch (error) {
            console.error("Error fetching item allocation:", error);
        }
    }

    useEffect(() => {
        if (orderId) {
            fetchAllocationData();
        }
    }, [orderId, getToken, limit, offset]);

    const handleStatusChange = async () => {
        try {
            const token = await getToken();
            const response = await updateOrderStatus(token, {
                id: orderData.id,
                OrderStatus: "Pending",
                PaymentStatus: orderData.PaymentStatus
            });

            if (response.message === "success") {
                toast.success(`Order NO: ${orderData.type}${orderData.order_no} marked as Pending!`, { position: "bottom-right" });

                setOrderData(prev => ({
                    ...prev,
                    OrderStatus: "Pending"
                }));
            }
        } catch (error) {
            console.error("Error updating order status:", error);
            toast.error("Failed to update status");
        }
    };

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

            if (groupedItemsMap.has(item.product_id)) {
                const existingRow = groupedItemsMap.get(item.product_id);
                existingRow.quantity += (item.quantity || 1);
                existingRow.subtotal += (item.subtotal || 0);

                if (currentItemSerials.length > 0) {
                    existingRow.combined_serials = [...existingRow.combined_serials, ...currentItemSerials];
                }
            } else {
                groupedItemsMap.set(item.product_id, {
                    ...item,
                    product_name: product?.name || item.product_name,
                    quantity: item.quantity || 1,
                    combined_serials: currentItemSerials
                });
            }
        });

        const groupedItemsArray = Array.from(groupedItemsMap.values());
        return { ...orderData, order_items: groupedItemsArray };
    }, [orderData, productData]);

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
            case "Rejected":
                return <Badge className="rounded-full bg-rose-100 text-rose-700 hover:bg-rose-100 font-bold text-xs px-3 py-1 border-0">Rejected</Badge>;
            case "Discarded":
                return <Badge className="rounded-full bg-slate-100 text-slate-600 hover:bg-slate-100 font-bold text-xs px-3 py-1 border-0">Discarded</Badge>;
            default:
                return <Badge className="rounded-full bg-slate-100 text-slate-600 hover:bg-slate-100 font-bold text-xs px-3 py-1 border-0">{status || "No Status"}</Badge>;
        }
    };

    const discountAmount = parseFloat(orderData?.discount) || 0;
    const subtotal = parseFloat(orderData?.subtotal) || 0;
    const additionalCharges = (orderData?.additional_charges || []).reduce((sum, item) => sum + (parseFloat(item.value) || 0), 0);
    const subTotalWithAdditionalCharges = subtotal + additionalCharges;
    const discountPercentage = subTotalWithAdditionalCharges > 0 ? (discountAmount / subTotalWithAdditionalCharges) * 100 : 0;
    const vatAmount = orderData?.vat == true ? orderData?.total * 0.18 : 0;
    const netTotal = (orderData?.total || 0) + vatAmount;

    if (isLoading) {
        return (
            <div className="w-full space-y-6">
                {/* Header Skeleton */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/70 flex flex-col sm:flex-row justify-between items-center gap-4 animate-pulse">
                    <div className="flex items-center gap-4">
                        <div className="h-8 w-48 bg-slate-200 rounded-xl"></div>
                        <div className="h-6 w-20 bg-slate-100 rounded-full"></div>
                    </div>
                </div>

                {/* Product Details Table Skeleton */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70 animate-pulse">
                    <div className="flex justify-between items-center mb-5">
                        <div className="h-6 w-40 bg-slate-200 rounded-lg"></div>
                    </div>
                    <div className="rounded-xl border border-slate-100 overflow-hidden mb-6">
                        <div className="bg-slate-50 px-4 py-3 grid grid-cols-4 gap-4">
                            <div className="h-3 w-24 bg-slate-200 rounded"></div>
                            <div className="h-3 w-20 bg-slate-200 rounded ml-auto"></div>
                            <div className="h-3 w-16 bg-slate-200 rounded ml-auto"></div>
                            <div className="h-3 w-20 bg-slate-200 rounded ml-auto"></div>
                        </div>
                        {Array.from({ length: 2 }).map((_, i) => (
                            <div key={i} className="px-4 py-3 grid grid-cols-4 gap-4 border-t border-slate-100">
                                <div className="h-4 w-48 bg-slate-200 rounded"></div>
                                <div className="h-4 w-20 bg-slate-100 rounded ml-auto"></div>
                                <div className="h-4 w-12 bg-slate-100 rounded ml-auto"></div>
                                <div className="h-4 w-20 bg-slate-100 rounded ml-auto"></div>
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
                            <div className="h-5 w-28 bg-slate-300 rounded"></div>
                        </div>
                    </div>
                </div>

                {/* Notes Box Skeleton */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70 animate-pulse">
                    <div className="h-6 w-24 bg-slate-200 rounded-lg mb-4"></div>
                    <div className="h-4 w-full bg-slate-100 rounded mb-2"></div>
                    <div className="h-4 w-3/4 bg-slate-100 rounded"></div>
                </div>

                {/* Specifications Accordion Skeleton */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70 animate-pulse">
                    <div className="h-6 w-48 bg-slate-200 rounded-lg mb-5"></div>
                    <div className="space-y-3">
                        {Array.from({ length: 2 }).map((_, i) => (
                            <div key={i} className="h-14 w-full bg-slate-50 border border-slate-200/70 rounded-2xl"></div>
                        ))}
                    </div>
                </div>

                {/* Hardware & Design Request Skeleton */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70 animate-pulse">
                    <div className="h-6 w-56 bg-slate-200 rounded-lg mb-4"></div>
                    <div className="h-10 w-full bg-slate-100 rounded-xl"></div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70 animate-pulse">
                    <div className="h-6 w-48 bg-slate-200 rounded-lg mb-4"></div>
                    <div className="h-10 w-full bg-slate-100 rounded-xl"></div>
                </div>

                {/* Items Allocation Segment Skeleton */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70 animate-pulse">
                    <div className="flex justify-between items-center mb-5">
                        <div className="h-6 w-40 bg-slate-200 rounded-lg"></div>
                        <div className="h-10 w-32 bg-slate-200 rounded-xl"></div>
                    </div>
                    <div className="grid sm:grid-cols-5 grid-cols-1 gap-4 border-b border-slate-100 pb-2">
                        <div className="h-3 w-20 bg-slate-200 rounded"></div>
                        <div className="h-3 w-24 bg-slate-200 rounded"></div>
                        <div className="h-3 w-12 bg-slate-200 rounded"></div>
                        <div className="h-3 w-20 bg-slate-200 rounded"></div>
                        <div className="h-3 w-24 bg-slate-200 rounded"></div>
                    </div>
                    {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="grid sm:grid-cols-5 grid-cols-1 gap-4 py-3 border-b border-slate-100 items-center">
                            <div className="h-4 w-24 bg-slate-200 rounded"></div>
                            <div className="h-4 w-32 bg-slate-100 rounded"></div>
                            <div className="h-4 w-8 bg-slate-200 rounded"></div>
                            <div className="h-4 w-24 bg-slate-100 rounded"></div>
                            <div className="h-4 w-32 bg-slate-100 rounded"></div>
                        </div>
                    ))}
                    <div className="flex justify-between items-center pt-4 mt-2">
                        <div className="h-4 w-32 bg-slate-200 rounded"></div>
                        <div className="h-8 w-64 bg-slate-100 rounded-lg"></div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 pt-6 border-t border-slate-200">
                        <div className="flex items-center gap-3">
                            <div className="h-5 w-5 bg-slate-200 rounded"></div>
                            <div className="h-4 w-40 bg-slate-200 rounded"></div>
                        </div>
                        <div className="h-10 w-32 bg-blue-200 rounded-xl sm:ml-auto"></div>
                    </div>
                </div>

                {/* Timestamps Skeleton */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70 animate-pulse">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-x-16">
                        <div className="space-y-2">
                            <div className="h-3 w-20 bg-slate-200 rounded"></div>
                            <div className="h-4 w-36 bg-slate-100 rounded"></div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-3 w-24 bg-slate-200 rounded"></div>
                            <div className="h-4 w-36 bg-slate-100 rounded"></div>
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
                        {orderData?.type} {orderData?.order_no}
                    </h1>
                    {getStatusBadge(orderData?.OrderStatus)}
                </div>
            </div>

            <div className="space-y-6">
                
                {/* Product Details Table Wrapper */}
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
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {enrichedOrderData?.order_items?.map((item) => (
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
                                                    ({item.combined_serials.map((serialObj, index) => (
                                                        <span key={index}>
                                                            <span
                                                                className="cursor-pointer hover:text-blue-600 transition-colors underline"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    navigate(`/orders/packs/${serialObj.id}`);
                                                                }}
                                                            >
                                                                {serialObj.serial}
                                                            </span>
                                                            {index < item.combined_serials.length - 1 && ", "}
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

                {/* Notes Box */}
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

                {/* Specifications Accordion Box */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                    <h3 className="text-lg font-bold mb-5 text-slate-800">Product Specifications</h3>
                    <div className="space-y-3">
                        {productData?.filter((product, index, self) =>
                            index === self.findIndex((p) => p.id === product.id)
                        ).map((product) => (
                            <div key={product.id} className="border border-slate-200/70 rounded-2xl overflow-hidden shadow-sm">
                                <div
                                    className="flex items-center justify-between p-4 bg-slate-50/70 cursor-pointer transition-colors hover:bg-slate-100"
                                    onClick={() => togleProductDetails(product.id)}
                                >
                                    <h3 className="text-base font-bold text-slate-800 pr-2">
                                        {product.name}
                                    </h3>
                                    {showProductDetails[product.id] ? <ChevronUp className="h-5 w-5 shrink-0 text-slate-500" /> : <ChevronDown className="h-5 w-5 shrink-0 text-slate-500" />}
                                </div>

                                {showProductDetails[product.id] && (
                                    <div className="p-5 bg-white border-t border-slate-100 space-y-3">
                                        <InfoItem label="Category" value={product.category} />
                                        <InfoItem label="Base Price" value={product.base_price != null ? `LKR ${product.base_price}` : undefined} />
                                        {product?.category === 'SOLAR' && (
                                            <>
                                                <InfoItem label="Inverter" value={product.Inverter} />
                                                <InfoItem label="Capacity" value={product.capacity} />
                                                <InfoItem label="Solar Panel" value={product.PanelType} />
                                            </>
                                        )}
                                        {product?.category === 'BATTERY_PACK' && (
                                            <>
                                                <InfoItem label="Pack Type" value={product.type} />
                                                <InfoItem label="Model" value={product.model} />
                                                <InfoItem label="Capacity" value={product.capacity} />
                                                <InfoItem label="Voltage" value={product.voltage} />
                                                <InfoItem label="Cell Type" value={product.cell_type} />
                                                <InfoItem label="BMS Type" value={product.bms_type} />
                                                <InfoItem label="Monitor" value={product.monitor} />
                                            </>
                                        )}
                                        {product?.category === 'E_VEHICLE' && (
                                            <>
                                                <InfoItem label="Type" value={product.type} />
                                                <InfoItem label="Cell Type" value={product.cell_type} />
                                                <InfoItem label="Capacity" value={product.capacity} />
                                                <InfoItem label="BMS Type" value={product.bms_type} />
                                                <InfoItem label="Voltage" value={product.voltage != null ? `${product.voltage}V` : undefined} />
                                            </>
                                        )}
                                        {product?.category === 'OTHER' && <InfoItem label="Voltage" value={product.voltage != null ? `${product.voltage}V` : undefined} />}
                                        <InfoItem label="Specifications" value={product.Specifications} />
                                        <InfoItem label="Is Active" value={product.is_active ? "Yes" : "No"} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Hardware Request */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                    <h3 className="text-lg font-bold mb-5 text-slate-800">Hardware Request</h3>
                    <div className="w-full">
                        <HardwareDropDown />
                    </div>
                </div>

                {/* Design Request */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                    <h3 className="text-lg font-bold mb-5 text-slate-800">Design Request</h3>
                    <div className="w-full">
                        <DesignDropDown />
                    </div>
                </div>

                {/* Items Allocation Segment */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                    <div className="flex flex-col sm:flex-row gap-4 mb-5 sm:items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-800">Items Allocation</h3>
                        <ItemAllocation type="order" orderData={orderData} onSuccess={fetchAllocationData} />
                    </div>

                    <div className="space-y-3">
                        <div className="hidden sm:grid grid-cols-5 text-xs text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 pb-2">
                            <span>Item Code</span>
                            <span>Item Name</span>
                            <span>Count</span>
                            <span>Allocator</span>
                            <span>Time Stamp</span>
                        </div>
                        
                        {itemAllocation?.map((item) => (
                            <div key={item.id} className="flex flex-col sm:grid sm:grid-cols-5 text-sm sm:text-xs text-slate-700 font-medium gap-1 sm:gap-0 border-b border-slate-100 pb-3 sm:pb-3 last:border-0 items-center">
                                <div className="flex sm:block justify-between w-full"><span className="sm:hidden font-bold text-slate-400 text-xs">Item Code:</span> <span className="font-mono text-xs">{item.item_code}</span></div>
                                <div className="flex sm:block justify-between w-full"><span className="sm:hidden font-bold text-slate-400 text-xs">Item Name:</span> {item.item_name}</div>
                                <div className="flex sm:block justify-between w-full"><span className="sm:hidden font-bold text-slate-400 text-xs">Count:</span> <span className="font-bold">{item.usage_count}</span></div>
                                <div className="flex sm:block justify-between w-full"><span className="sm:hidden font-bold text-slate-400 text-xs">Allocator:</span> {item.user_name}</div>
                                <div className="flex sm:block justify-between w-full"><span className="sm:hidden font-bold text-slate-400 text-xs">Time Stamp:</span> <span className="text-slate-500 text-xs">{new Date(item.created_at).toLocaleString()}</span></div>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 mt-4 border-t border-slate-100">
                        <div className="text-xs text-slate-500 font-medium">Total: {total || 0} Allocations.</div>
                        <div className="w-full sm:w-auto flex justify-center"><PaginationComponent total={total} limit={limit} offset={offset} setOffset={setOffset} /></div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-6 pt-6 border-t border-slate-200">
                        <div className="flex items-center gap-3">
                            <Checkbox id="terms" checked={ready === true} onCheckedChange={(checked) => setReady(checked === true)} />
                            <Label htmlFor="terms" className="font-semibold text-sm text-slate-700 cursor-pointer">Site readiness confirmed</Label>
                        </div>
                        <Button type="button" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm px-8 h-10 w-full sm:w-auto sm:ml-auto" onClick={handleStatusChange} disabled={!ready}>Submit</Button>
                    </div>
                </div>

                {/* Timestamps */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                    <div className="text-xs sm:text-sm text-slate-600 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-x-16">
                        <Timestamp label="Created At" value={orderData?.created_at} />
                        <Timestamp label="Last Updated At" value={orderData?.updated_at} />
                    </div>
                </div>

            </div>
        </div>
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

function InfoItem({ label, value }) {
    return (
        <div className="flex flex-col sm:flex-row py-2 border-b border-slate-100 last:border-b-0">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider w-full sm:w-32 shrink-0">{label}:</span>
            <span className="text-sm text-slate-800 font-medium ml-0 sm:ml-4 mt-0.5 sm:mt-0 break-words">{value || "N/A"}</span>
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

function Timestamp({ label, value }) {
    return (
        <div className="flex flex-col">
            <span className="uppercase tracking-wider text-[10px] text-slate-400 font-bold mb-1">{label}</span>
            <span className="font-semibold text-slate-700 text-sm">{value ? new Date(value).toLocaleString() : "N/A"}</span>
        </div>
    );
}

export default ApprovalsView;
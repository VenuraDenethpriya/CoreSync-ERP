import { Separator } from "@/components/ui/separator";
import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import BreadCrumbs from "@/components/ui/BreadCrumbs";
import { Badge } from "@/components/ui/badge";
import { featchOrderById, updateOrderStatus } from "@/api/orderApi";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { fetchProductById } from "@/api/productApi";
import { featchInventoryAllocation } from "@/api/inventoryApi";
import { ErrorState, SkeletonDetailRow, SkeletonSummaryRow, SkeletonTableRow } from "@/components/Skeleton";
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
    const [limit, setLimit] = useState(10)
    const [offset, setOffset] = useState(0)
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
    }, [orderData, getToken, isLoaded]);


    const fetchAllocationData = async () => {
        try {
            const token = await getToken()
            const response = await featchInventoryAllocation(token, { orderId, limit, offset })
            setItemAllocation(response?.data?.items || [])
            setTotal(response?.data.total || 0)
        } catch (error) {
            console.error("Error fetching item allocation:", error)
        }
    }

    useEffect(() => {
        if (orderId) {
            fetchAllocationData()
        }
    }, [orderId, getToken, limit, offset])

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


    if (isLoading) {
        return (
            <>
                
                <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4 mx-3 sm:mx-16"></div>

                <div className="sm:p-8 p-4 space-y-6 bg-gray-50 min-h-screen">
                    
                    <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                        <div className="h-10 w-48 bg-gray-200 rounded animate-pulse sm:text-4xl text-2xl"></div>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                            <div className="h-9 w-28 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-9 w-28 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-9 w-28 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                    </div>

                    
                    <div className="space-y-4">
                        <div className="h-8 w-36 bg-gray-200 rounded animate-pulse text-2xl font-semibold"></div>
                        <Separator className="my-4 bg-gray-200 h-1 animate-pulse" />
                    </div>

                    
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

                    
                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                        
                        <div className="h-7 w-48 bg-gray-200 rounded animate-pulse mb-5 text-xl font-bold"></div>

                        
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
                                    
                                    <SkeletonTableRow />
                                    <SkeletonTableRow />
                                    <SkeletonTableRow />
                                    <SkeletonTableRow />
                                    <SkeletonTableRow />
                                </tbody>
                            </table>
                        </div>

                        
                        <div className="mt-6 pt-4 border-t border-gray-200 space-y-3 text-sm sm:text-base">
                            
                            <SkeletonSummaryRow />

                            
                            <SkeletonSummaryRow />
                            <SkeletonSummaryRow />

                            
                            <SkeletonSummaryRow />

                            
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
            <BreadCrumbs breadcrumbs={breadcrumbs} />
            <div className="sm:p-8 p-4 space-y-6 bg-gray-50 min-h-screen mx-8">

                {/* Header Section */}
                <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <h1 className="sm:text-4xl text-md font-extrabold text-gray-800">
                            {orderData?.type} {orderData?.order_no}
                        </h1>
                        {getStatusBadge(orderData?.OrderStatus)}
                    </div>
                </div>

                {/* Overview Section */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-semibold text-gray-700">Overview</h2>
                    <Separator className="my-4 bg-gray-300" />

                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                        <h3 className="text-xl font-bold mb-5 text-gray-700">Product Details</h3>
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
                                    {orderData?.order_items?.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 hover:cursor-pointer" onClick={() => navigate(`/products/${item.product_id}`)}>
                                                {item.product_name}
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
                    </div>

                    {/*Additional Details */}
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
                                                        <InfoItem label="Voltage(V)" value={`${product.voltage}V`} />
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
                        <h3 className="text-xl font-bold mb-5 text-gray-700">Hardware Request</h3>
                        <div className="flex flex-col space-y-4">
                            <form action="">
                                <HardwareDropDown />
                            </form>

                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                        <h3 className="text-xl font-bold mb-5 text-gray-700">Design Request</h3>
                        <div className="flex flex-col space-y-4">
                            <form action="">
                                <DesignDropDown />
                            </form>

                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                        <div className="flex gap-6 mb-5 items-center">
                            <h3 className="text-xl font-bold text-gray-700">Items Allocation</h3>
                            <ItemAllocation
                                type="order"
                                orderData={orderData}
                                onSuccess={fetchAllocationData}
                            />
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
                            {
                                itemAllocation?.map((item) => (
                                    <div key={item.id} className="grid sm:grid-cols-6  grid-cols-1 text-xs text-gray-500 font-semibold border-b pb-1">
                                        <span>{item.item_code}</span>
                                        <span>{item.item_name}</span>
                                        <span className="pl-5">{item.usage_count}</span>
                                        <span>{item.user_name}</span>
                                        <span>{new Date(item.created_at).toLocaleString()}</span>
                                    </div>
                                ))
                            }
                        </div>
                        <div>
                            <div>

                            </div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between sm:space-x-2 py-4">
                                <div className="text-sm text-muted-foreground mb-2 sm:mb-0">
                                    Total: {total} Allocations.
                                </div>
                                <div className="flex justify-center">
                                    <PaginationComponent total={total} limit={limit} offset={offset} setOffset={setOffset} />
                                </div>
                            </div>
                            <div className="flex items-center gap-3 mt-6">
                                <Checkbox id="terms" value="ready" checked={ready === true} onCheckedChange={(checked) => setReady(checked)}></Checkbox>
                                <Label htmlFor="terms" className="font-normal">Site readiness confirmed</Label>
                                <Button type="button" className="bg-blue-800 hover:bg-blue-900 ml-2" onClick={handleStatusChange} disabled={!ready}>Submit</Button>
                            </div>
                        </div>

                    </div>


                    {/* Timestamps */}
                    <div className="flex justify-end mt-8">
                        <div className="bg-gray-100 rounded-xl p-5 text-xs sm:text-sm text-gray-600 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-x-16">
                            <Timestamp label="Created At" value={orderData?.created_at} />
                            <Timestamp label="Last Updated At" value={orderData?.updated_at} />
                        </div>
                    </div>
                </div>


            </div>
        </>

    );
}

function DetailRow({ label, value }) {
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

function Timestamp({ label, value }) {
    return (
        <div className="flex flex-col">
            <span className="uppercase tracking-wide text-[10px] text-gray-500 font-semibold mb-1">{label}</span>
            <span className="font-medium text-gray-800 text-sm">{value ? new Date(value).toLocaleString() : "N/A"}</span>
        </div>
    );
}


export default ApprovalsView;
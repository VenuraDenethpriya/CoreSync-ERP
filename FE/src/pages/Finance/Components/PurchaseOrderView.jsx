import { Roles } from "@/const/const";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ErrorState } from "@/components/Skeleton"; 
import { Button } from "@/components/ui/button";
import { PurchaseOrderDeleteAlert } from "./PurchaseOrderDeleteAlert";
import { fechPurchaseOrderById } from "@/api/finance";
import { LockIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

function PurchaseOrderView() {
    const { getToken } = useAuth();
    const { user } = useUser();
    const { purchaseId } = useParams();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const [purchaseData, setPurchaseData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const fetchPurchaseData = async () => {
        try {
            setIsLoading(true);
            const token = await getToken();
            const response = await fechPurchaseOrderById(token, purchaseId);
            const data = response?.data || null;
            setPurchaseData(data);
        } catch (error) {
            console.error("Error fetching purchase data:", error);
            setIsError(true);
            setErrorMessage("Failed to fetch purchase data.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (purchaseId) {
            fetchPurchaseData();
        }
    }, [purchaseId]);

    const formatCurrency = (amount) => {
        if (amount === undefined || amount === null) return "N/A";
        return new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-GB", {
            year: "numeric",
            month: "short",
            day: "2-digit"
        });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "Pending":
                return <Badge className="rounded-full bg-amber-100 text-amber-700 hover:bg-amber-100 font-bold text-xs px-3 py-1 border-0">Pending</Badge>;
            case "Confirmed":
                return <Badge className="rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-100 font-bold text-xs px-3 py-1 border-0">Confirmed</Badge>;
            case "Rejected":
                return <Badge className="rounded-full bg-rose-100 text-rose-700 hover:bg-rose-100 font-bold text-xs px-3 py-1 border-0">Rejected</Badge>;
            default:
                return <Badge className="rounded-full bg-slate-100 text-slate-600 hover:bg-slate-100 font-bold text-xs px-3 py-1 border-0">{status || "No Status"}</Badge>;
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
                        <Button className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl" onClick={() => navigate("/")}>Go to Dashboard</Button>
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
                    {!isMobile && (
                        <div className="flex items-center gap-2.5">
                            <div className="h-10 w-10 bg-slate-200 rounded-xl"></div> {/* Delete Alert Button */}
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    {/* Primary Details Skeleton */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                        <div className="h-6 w-40 bg-slate-200 rounded-lg mb-5"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="flex justify-between items-center py-1.5">
                                    <div className="h-4 w-28 bg-slate-200 rounded"></div>
                                    <div className="h-4 w-32 bg-slate-100 rounded"></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Purchase Details Skeleton */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70 overflow-x-auto">
                        <div className="h-6 w-40 bg-slate-200 rounded-lg mb-5"></div>
                        <div className="space-y-2 min-w-[700px]">
                            <div className="grid grid-cols-6 gap-4 border-b border-slate-100 pb-2">
                                <div className="h-3 w-16 bg-slate-200 rounded"></div>
                                <div className="h-3 w-24 bg-slate-200 rounded"></div>
                                <div className="h-3 w-16 bg-slate-200 rounded"></div>
                                <div className="h-3 w-24 bg-slate-200 rounded"></div>
                                <div className="h-3 w-28 bg-slate-200 rounded"></div>
                                <div className="h-3 w-32 bg-slate-200 rounded"></div>
                            </div>
                            
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="grid grid-cols-6 gap-4 py-3 border-b border-slate-100 items-center">
                                    <div className="h-4 w-24 bg-slate-200 rounded"></div>
                                    <div className="h-4 w-32 bg-slate-100 rounded"></div>
                                    <div className="h-4 w-10 bg-slate-100 rounded"></div>
                                    <div className="h-4 w-24 bg-slate-200 rounded"></div>
                                    <div className="h-4 w-28 bg-slate-100 rounded"></div>
                                    <div className="h-4 w-36 bg-slate-100 rounded"></div>
                                </div>
                            ))}

                            <div className="grid grid-cols-6 py-4 mt-2 border-t border-slate-200 items-center">
                                <div className="col-span-3 flex justify-end pr-8">
                                    <div className="h-4 w-40 bg-slate-200 rounded"></div>
                                </div>
                                <div className="h-5 w-32 bg-slate-300 rounded"></div>
                                <div className="col-span-2"></div>
                            </div>
                        </div>
                    </div>

                    {/* Timestamps Skeleton */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="flex flex-col space-y-2">
                                    <div className="h-3 w-20 bg-slate-200 rounded"></div>
                                    <div className="h-4 w-36 bg-slate-100 rounded"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (isError) return <ErrorState errorMessage={errorMessage} />;

    const totalAmount = purchaseData?.items?.reduce((sum, item) => {
        return sum + ((item.qty || 0) * (item.estimated_cost || 0));
    }, 0) || 0;

    return (
        <div className="w-full space-y-6">
            {/* Header */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/70 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
                        {purchaseData?.purchase_no}
                    </h1>
                    {getStatusBadge(purchaseData?.status)}
                </div>

                {isMobile ? null : (
                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                        {user?.publicMetadata?.role === Roles.WAREHOUSE_STAFF || 
                         user?.publicMetadata?.role === Roles.INVENTORY_MANAGER || 
                         user?.publicMetadata?.role === Roles.HR_HEAD || 
                         user?.publicMetadata?.role === Roles.SALES_TEAM ||
                         user?.publicMetadata?.role === Roles.READ_ONLY ? null : (
                            <PurchaseOrderDeleteAlert purchaseData={purchaseData} />
                        )}
                    </div>
                )}
            </div>

            <div className="space-y-6">
                {/* Primary Details */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                    <h3 className="text-lg font-bold mb-5 text-slate-800">Primary Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
                        <DetailRow label="Department" value={purchaseData?.department} />
                        <DetailRow label="Date" value={formatDate(purchaseData?.date)} />
                        <DetailRow label="Requested By" value={purchaseData?.requested_by} />
                        <DetailRow label="Payment Status" value={purchaseData?.money_transaction ? "Done" : "Pending"} />
                    </div>
                </div>

                {/* Purchase Details */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70 overflow-x-auto">
                    <h3 className="text-lg font-bold mb-5 text-slate-800">Purchase Details</h3>

                    <div className="space-y-2 min-w-[700px]">
                        <div className="grid grid-cols-6 text-xs text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 pb-2">
                            <span>Item</span>
                            <span>Description</span>
                            <span>Quantity</span>
                            <span>Estimated Cost</span>
                            <span>Vendor/Supplier</span>
                            <span>Reason for Purchase</span>
                        </div>

                        {purchaseData?.items && purchaseData.items.length > 0 ? (
                            <>
                                {purchaseData.items.map((item, index) => (
                                    <div key={index} className="grid grid-cols-6 text-sm text-slate-700 py-3 border-b border-slate-100 items-center">
                                        <span className="font-semibold text-slate-800">{item.item_name}</span>
                                        <span className="text-slate-500 pr-2">{item.description || "-"}</span>
                                        <span className="font-medium">{item.qty}</span>
                                        <span className="font-semibold text-slate-800">{formatCurrency(item.estimated_cost)}</span>
                                        <span className="text-slate-600">{item.supplier || "-"}</span>
                                        <span className="text-slate-500">{item.reason || "-"}</span>
                                    </div>
                                ))}

                                <div className="grid grid-cols-6 text-sm text-slate-800 py-4 mt-2 border-t border-slate-200 items-center">
                                    <span className="col-span-3 font-bold text-right pr-8 text-slate-600 uppercase tracking-wider text-xs">
                                        Total Estimated Cost:
                                    </span>
                                    <span className="font-extrabold text-base text-slate-900">
                                        {formatCurrency(totalAmount)}
                                    </span>
                                    <span className="col-span-2"></span>
                                </div>
                            </>
                        ) : (
                            <div className="py-6 text-center text-sm text-slate-400">
                                No items found in this purchase order.
                            </div>
                        )}
                    </div>
                </div>

                {/* Timestamps */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                    <div className="text-xs sm:text-sm text-slate-600 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <InfoField label="Created At" value={purchaseData?.created_at} isDate={true} />
                        <InfoField label="Created By" value={purchaseData?.created_by} />
                        <InfoField label="Updated At" value={purchaseData?.Updated_at} isDate={true} />
                        <InfoField label="Updated By" value={purchaseData?.Updated_by} />
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

function InfoField({ label, value, isDate = false }) {
    const displayValue = value
        ? (isDate ? new Date(value).toLocaleString() : value)
        : "N/A";

    return (
        <div className="flex flex-col">
            <span className="uppercase tracking-wider text-[10px] text-slate-400 font-bold mb-1">{label}</span>
            <span className="font-semibold text-slate-700 text-sm">{displayValue}</span>
        </div>
    );
}

export default PurchaseOrderView;
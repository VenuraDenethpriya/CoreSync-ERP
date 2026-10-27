import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { EditBatteryPackQuote } from "./EditBatteryPackQuote";
import { deleteQuote, fetchQuoteById } from "@/api/quoteApi";
import { Badge } from "@/components/ui/badge";
import { useAuth, useUser } from "@clerk/clerk-react";
import { DeleteAlert } from "./QuoteDeleteAlert";
import { Roles } from "@/const/const";
import { ErrorState } from "@/components/Skeleton";
import TCDropDown from "./T&CDialog";
import { LockIcon } from "lucide-react";

function BatteryPackQuoteView() {
    const { getToken } = useAuth();
    const { user } = useUser();
    const { quoteId } = useParams();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const [quoteData, setQuoteData] = useState(null);
    const [isClient, setIsClient] = useState(false);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        setIsClient(true);
    }, []);

    const fetchQuoteData = async () => {
        try {
            const token = await getToken();
            const response = await fetchQuoteById(token, quoteId);
            setQuoteData(response.data);
        } catch (error) {
            console.error("Error refreshing quote data:", error);
            toast.error("Failed to refresh data");
        }
    };

    useEffect(() => {
        setIsLoading(true);
        fetchQuoteData().then(() => setIsLoading(false));
    }, [getToken, quoteId]);

    const handleDelete = async () => {
        try {
            const token = await getToken();
            const response = await deleteQuote(token, quoteId);
            if (response.message == "success") {
                toast.success("Quote deleted successfully!", { position: "bottom-right" });
                navigate("/quotes");
            }
            navigate("/quotes");
        } catch (error) {
            console.error("Error deleting quote:", error);
        }
    };

    const discountAmount = parseFloat(quoteData?.discount) || 0;
    const subtotal = parseFloat(quoteData?.subtotal) || 0;
    const additionalCharges = (quoteData?.additional_charges || []).reduce((sum, item) => sum + (parseFloat(item.value) || 0), 0);
    const subTotalWithAdditionalCharges = subtotal + additionalCharges;
    const discountPercentage = subTotalWithAdditionalCharges > 0 ? (discountAmount / subTotalWithAdditionalCharges) * 100 : 0;
    const vatAmount = quoteData?.vat == true ? quoteData?.total * 0.18 : 0;
    const netTotal = (quoteData?.total || 0) + vatAmount;

    const getStatusBadge = (status) => {
        switch (status) {
            case "Confirmed":
                return <Badge className="rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-100 font-bold text-xs px-3 py-1 border-0">Confirmed</Badge>;
            case "Submitted":
                return <Badge className="rounded-full bg-blue-100 text-blue-700 hover:bg-blue-100 font-bold text-xs px-3 py-1 border-0">Submitted</Badge>;
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
            <div className="w-full space-y-6">
                {/* Header Skeleton */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/70 flex flex-col sm:flex-row justify-between items-center gap-4 animate-pulse">
                    <div className="flex items-center gap-4">
                        <div className="h-8 w-48 bg-slate-200 rounded-xl"></div>
                        <div className="h-6 w-20 bg-slate-100 rounded-full"></div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5">
                        <div className="h-10 w-24 bg-slate-200 rounded-xl"></div>
                        <div className="h-10 w-24 bg-rose-100 rounded-xl"></div>
                        <div className="h-10 w-28 bg-slate-200 rounded-xl"></div>
                    </div>
                </div>

                {/* Customer Details Skeleton */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70 animate-pulse">
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
                                <div className="h-4 w-32 bg-slate-200 rounded"></div>
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

                {/* Notes Skeleton */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70 animate-pulse">
                    <div className="h-6 w-24 bg-slate-200 rounded-lg mb-4"></div>
                    <div className="h-4 w-full bg-slate-100 rounded mb-2"></div>
                    <div className="h-4 w-3/4 bg-slate-100 rounded"></div>
                </div>

                {/* Sale Details Skeleton */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70 animate-pulse">
                    <div className="h-6 w-32 bg-slate-200 rounded-lg mb-5"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex justify-between items-center py-1.5">
                                <div className="h-4 w-24 bg-slate-200 rounded"></div>
                                <div className="h-4 w-32 bg-slate-100 rounded"></div>
                            </div>
                        ))}
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
                        {quoteData?.type}{quoteData?.quote_no}
                    </h1>
                    {getStatusBadge(quoteData?.status)}
                </div>

                {/* Action Buttons */}
                {user?.publicMetadata?.role == Roles.INVENTORY_MANAGER || user?.publicMetadata?.role == Roles.READ_ONLY ? null : (
                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                        {isMobile ? (
                            <TCDropDown quoteData={quoteData} discountPercentage={discountPercentage} isClient={isClient} vatAmount={vatAmount} netTotal={netTotal} />
                        ) : (
                            <div className="flex items-center gap-2.5">
                                {user?.publicMetadata?.role === Roles.SALES_TEAM || user?.publicMetadata?.role === Roles.FINANCE_HEAD ? null : (
                                    <EditBatteryPackQuote quoteData={quoteData} onUpdate={fetchQuoteData} />
                                )}

                                {(user?.publicMetadata?.role === Roles.HEAD || user?.publicMetadata?.role === Roles.SUPER_ADMIN) && (
                                    <DeleteAlert handleDelete={handleDelete} quoteData={quoteData} />
                                )}
                                {(user?.publicMetadata?.role === Roles.HEAD || user?.publicMetadata?.role === Roles.SUPER_ADMIN || user?.publicMetadata?.role === Roles.OFFICE_STAFF) && (
                                    <TCDropDown quoteData={quoteData} discountPercentage={discountPercentage} isClient={isClient} vatAmount={vatAmount} netTotal={netTotal} />
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="space-y-6">
                {/* Customer Details Card */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                    <h3 className="text-lg font-bold mb-5 text-slate-800">Customer Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
                        <DetailRow label="Name" value={`${quoteData?.title || ""} ${quoteData?.first_name || ""} ${quoteData?.last_name || ""}`.trim()} />
                        <DetailRow label="Email" value={quoteData?.email} />
                        <DetailRow label="Phone No. 1" value={quoteData?.phone_no1} />
                        <DetailRow label="Phone No. 2" value={quoteData?.phone_no2} />
                        <DetailRow label="Address" value={quoteData?.address} />
                        {quoteData?.PoNo && <DetailRow label="PO No" value={quoteData?.PoNo} />}
                        {quoteData?.vat_no && <DetailRow label="VAT No" value={quoteData?.vat_no} />}
                        {quoteData?.tin_no && <DetailRow label="TIN No" value={quoteData?.tin_no} />}
                    </div>
                </div>

                {/* Product Details Card */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                    <div className="flex justify-between items-center mb-5">
                        <h3 className="text-lg font-bold text-slate-800">Product Details</h3>
                        {quoteData?.is_catalog && <Badge className="rounded-full bg-amber-100 text-amber-700 hover:bg-amber-100 font-bold text-xs px-3 py-1 border-0">Catalog</Badge>}
                    </div>

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
                                {quoteData?.items?.map((item) => (
                                    <tr key={item.id} className="text-sm text-slate-700">
                                        <td className="px-4 py-3 font-semibold text-slate-800">{item.product_name}</td>
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

                        {quoteData?.additional_charges?.map((charge, index) => (
                            <div key={index} className="flex justify-between text-slate-500 font-medium">
                                <span>{charge.type}</span>
                                <span>LKR {parseFloat(charge.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                        ))}

                        <div className="flex justify-between text-slate-500 font-medium">
                            <span>Discount ({discountPercentage.toFixed(2)}%)</span>
                            <span>- LKR {discountAmount > 0 ? discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}</span>
                        </div>

                        {quoteData?.vat && (
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

                {/* Notes Card */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                    <h3 className="text-lg font-bold mb-4 text-slate-800">Notes</h3>
                    <div className="space-y-3">
                        {quoteData?.items?.map((item) =>
                            item.note && <NoteDetail key={item.id} label={item.product_name} value={item.note} />
                        )}
                        {!quoteData?.items?.some(item => item.note) && (
                            <p className="text-sm text-slate-400">No specific notes available for products.</p>
                        )}
                    </div>
                </div>

                {/* Sale Details Card */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                    <h3 className="text-lg font-bold mb-5 text-slate-800">Sale Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
                        <DetailRow label="No." value={quoteData?.sales_no} />
                        <DetailRow label="Type" value={quoteData?.sales_type} />
                        <DetailRow label="Salesperson" value={quoteData?.salesperson} />
                        <DetailRow
                            label="Commission"
                            value={quoteData?.commission != null ? Number(quoteData.commission).toLocaleString('en-US', { style: 'currency', currency: 'LKR' }) : undefined}
                        />
                        <DetailRow label="Description" value={quoteData?.description} />
                        <DetailRow label="Recording" value={quoteData?.recording_url} />
                    </div>
                </div>

                {/* Timestamps */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                    <div className="text-xs sm:text-sm text-slate-600 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-x-16">
                        <Timestamp label="Created At" value={quoteData?.created_at} />
                        <Timestamp label="Last Updated At" value={quoteData?.updated_at} />
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

function NoteDetail({ label, value }) {
    const formattedLines = value?.split('\n').filter(line => line.trim() !== '') || [];

    return (
        <div className="py-2 border-b border-slate-100 last:border-0">
            <span className="text-slate-800 font-semibold text-sm block mb-1">{label}</span>
            <ul className="pl-4 list-disc text-sm text-slate-600 space-y-1">
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
            <span className="uppercase tracking-wider text-[10px] text-slate-400 font-bold mb-1">{label}</span>
            <span className="font-semibold text-slate-700 text-sm">{value ? new Date(value).toLocaleString() : "N/A"}</span>
        </div>
    );
}

export default BatteryPackQuoteView;
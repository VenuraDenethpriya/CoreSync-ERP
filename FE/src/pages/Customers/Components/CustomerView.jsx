import { EditCustomer } from "./EditCustomer";
import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { DeleteAlert } from "./CustomerDeleteAlert";
import { toast } from "sonner";
import { PDFDownloadLink } from "@react-pdf/renderer";
import CustomerTemplate from "./CustomerPdf";
import { deleteCustomer, getCustomerById } from "@/api/customerApi";
import { Copy, ExternalLink } from "lucide-react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { ErrorState } from "@/components/Skeleton";
import { createAuditLog } from "@/api/settingApi";
import { Roles } from "@/const/const";

function CustomerView() {
    const { user } = useUser();
    const { getToken } = useAuth();
    const { customerId } = useParams();

    const breadcrumbs = [
        { name: "Dashboard", link: "/" },
        { name: "Customers", link: "/customers" },
        { name: " ", link: `/customers/${customerId}` },
    ];

    const [customerData, setCustomerData] = useState({});
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const fetchCustomerData = async () => {
        try {
            const token = await getToken();
            const res = await getCustomerById(token, customerId);
            const customer = res.data;
            setCustomerData({
                ...customer,
                name: `${customer.first_name} ${customer.last_name}`.trim(),
            });
        } catch (error) {
            setIsError(true);
            setErrorMessage("Error fetching customer data: " + error.message);
            toast.error("Couldn't load customer", { position: "bottom-right" });
        }
    };

    useEffect(() => {
        setIsLoading(true);
        fetchCustomerData().finally(() => {
            setIsLoading(false);
            setIsError(false);
        });
    }, [customerId, getToken]);

    const handleDelete = async () => {
        try {
            const token = await getToken();
            const response = await deleteCustomer(token, customerId);
            if (response.message === "success") {
                toast.success("Customer deleted successfully!", { position: "bottom-right" });
                navigate("/customers");
            }
        } catch (error) {
            toast.error("Error deleting customer! Please try again.", { position: "bottom-right" });
        }
    };

    const totals = customerData.orders?.reduce(
        (acc, order) => {
            acc.total += order.total;
            acc.paid += order.paid_amount;
            acc.remaining += order.total - order.paid_amount;
            return acc;
        },
        { total: 0, paid: 0, remaining: 0 }
    );

    const handleDownloadLog = async () => {
        try {
            const token = await getToken();
            await createAuditLog(token, {
                action: "PDF Downloaded",
                status_code: 200,
                user: user.id,
                description: `${user.firstName} ${user.lastName} downloaded the customer's ${customerData?.name || "Unknown Customer"} report as a PDF file.`,
            });
        } catch (error) {
            console.error("Failed to log download action:", error);
        }
    };

    if (isLoading) {
        return (
            <div className="w-full space-y-6 animate-pulse">
                {/* Header Skeleton */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/70 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="h-8 w-64 bg-slate-200 rounded-xl"></div>
                    {!isMobile && user?.publicMetadata?.role !== Roles.READ_ONLY && (
                        <div className="flex items-center gap-2.5">
                            <div className="h-10 w-24 bg-slate-200 rounded-xl"></div>
                            <div className="h-10 w-24 bg-rose-100 rounded-xl"></div>
                            <div className="h-10 w-28 bg-slate-200 rounded-xl"></div>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    {/* Customer Details Skeleton */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                        <div className="h-6 w-40 bg-slate-200 rounded-lg mb-5"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="flex justify-between items-center py-1.5">
                                    <div className="h-4 w-28 bg-slate-200 rounded"></div>
                                    <div className="h-4 w-40 bg-slate-100 rounded mt-2 sm:mt-0"></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quote Details Skeleton */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                        <div className="h-6 w-32 bg-slate-200 rounded-lg mb-5"></div>
                        <div className="space-y-2">
                            <div className="grid grid-cols-2 pb-2 border-b border-slate-100">
                                <div className="h-3 w-20 bg-slate-200 rounded"></div>
                                <div className="h-3 w-16 bg-slate-200 rounded"></div>
                            </div>
                            {Array.from({ length: 2 }).map((_, i) => (
                                <div key={i} className="grid grid-cols-2 py-2.5 border-b border-slate-100">
                                    <div className="h-4 w-32 bg-slate-200 rounded"></div>
                                    <div className="h-4 w-24 bg-slate-100 rounded"></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Details Skeleton */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70 overflow-x-auto">
                        <div className="h-6 w-32 bg-slate-200 rounded-lg mb-5"></div>
                        <div className="min-w-[850px] space-y-2">
                            <div className="grid grid-cols-6 pb-2 border-b border-slate-100">
                                <div className="h-3 w-20 bg-slate-200 rounded"></div>
                                <div className="h-3 w-24 bg-slate-200 rounded"></div>
                                <div className="h-3 w-28 bg-slate-200 rounded hidden sm:block"></div>
                                <div className="h-3 w-24 bg-slate-200 rounded ml-auto"></div>
                                <div className="h-3 w-20 bg-slate-200 rounded ml-auto"></div>
                                <div className="h-3 w-28 bg-slate-200 rounded ml-auto"></div>
                            </div>
                            {Array.from({ length: 2 }).map((_, i) => (
                                <div key={i} className="grid grid-cols-6 py-3 border-b border-slate-100 items-center">
                                    <div className="h-4 w-24 bg-slate-200 rounded"></div>
                                    <div className="h-4 w-20 bg-slate-100 rounded"></div>
                                    <div className="h-4 w-24 bg-slate-100 rounded hidden sm:block"></div>
                                    <div className="h-4 w-20 bg-slate-100 rounded ml-auto"></div>
                                    <div className="h-4 w-16 bg-slate-100 rounded ml-auto"></div>
                                    <div className="h-4 w-20 bg-slate-100 rounded ml-auto"></div>
                                </div>
                            ))}
                            {/* Totals Row Skeleton */}
                            <div className="grid grid-cols-6 py-4 mt-2 border-t border-slate-200 items-center">
                                <div className="col-span-3 flex justify-end pr-8">
                                    <div className="h-4 w-16 bg-slate-200 rounded"></div>
                                </div>
                                <div className="h-5 w-24 bg-emerald-200 rounded ml-auto"></div>
                                <div className="h-5 w-20 bg-emerald-200 rounded ml-auto"></div>
                                <div className="h-5 w-24 bg-emerald-200 rounded ml-auto"></div>
                            </div>
                        </div>
                    </div>

                    {/* Timestamps Skeleton */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-x-16">
                            {Array.from({ length: 2 }).map((_, i) => (
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

    if (isError) {
        return <ErrorState errorMessage={errorMessage} />;
    }

    return (
        <div className="w-full space-y-6">
            {/* Header */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/70 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">{customerData.name}</h1>
                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    {
                        user.publicMetadata.role == Roles.READ_ONLY ? null : (
                            <>
                                <EditCustomer customerData={customerData} onUpdate={fetchCustomerData} />
                                <DeleteAlert handleDelete={handleDelete} customerData={customerData} />
                                <PDFDownloadLink
                                    document={<CustomerTemplate customerData={customerData} />}
                                    fileName={`Customer-Report-${customerData.name}.pdf`}
                                    className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 h-10 px-4 py-2 transition-colors"
                                    onClick={handleDownloadLog}
                                >
                                    {({ loading }) => (loading ? "Generating..." : "Download")}
                                </PDFDownloadLink>
                            </>
                        )
                    }
                </div>
            </div>

            <div className="space-y-6">
                {/* Customer Details */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                    <h3 className="text-lg font-bold mb-5 text-slate-800">Customer Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
                        <DetailRow label="Title" value={customerData.title} />
                        <DetailRow label="Email" value={customerData.email} />
                        <DetailRow label="First Name" value={customerData.first_name} />
                        <DetailRow label="Last Name" value={customerData.last_name} />
                        <DetailRow label="Phone No 1." value={customerData.phone_no1} />
                        <DetailRow label="Phone No 2." value={customerData.phone_no2} />
                        <DetailRow label="Address" value={customerData.address} />
                        <DetailRow label="VAT No" value={customerData.vat_no} />
                    </div>
                </div>

                {/* Quote Details */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                    <h3 className="text-lg font-bold mb-5 text-slate-800">Quote Details</h3>
                    {customerData.quotes?.length > 0 ? (
                        <div className="space-y-2">
                            <div className="grid grid-cols-2 text-xs text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 pb-2">
                                <span>Quote No.</span>
                                <span>Status</span>
                            </div>
                            {customerData.quotes.map((quote) => (
                                <div key={quote.id} className="grid grid-cols-2 text-sm items-center py-2.5 border-b border-slate-100 last:border-0">
                                    <span className="text-slate-800 font-medium flex items-center">
                                        {`${quote.quote_type}${quote.quote_no}`}
                                        <ExternalLink size="16px" className="ml-4 text-blue-600 hover:text-blue-800 cursor-pointer" onClick={() => { navigate(`/quotes/${quote.id}`) }} />
                                    </span>
                                    <span className={`font-semibold ${quote.status === "Submitted" ? "text-emerald-600" : quote.status === "Rejected" ? "text-rose-600" : "text-slate-600"}`}>
                                        {quote.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400">No quotes available.</p>
                    )}
                </div>

                {/* Order Details */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70 overflow-x-auto">
                    <h3 className="text-lg font-bold mb-5 text-slate-800">Order Details</h3>
                    {customerData.orders?.length > 0 ? (
                        <div className="min-w-[850px] space-y-2">
                            <div className="grid grid-cols-6 text-xs text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 pb-2">
                                <span>Order No.</span>
                                <span>Order Status</span>
                                <span className="hidden sm:block">Payment Status</span>
                                <span className="text-right">Net Total (LKR)</span>
                                <span className="text-right">Paid (LKR)</span>
                                <span className="text-right">Remaining (LKR)</span>
                            </div>
                            {customerData.orders.map((order) => (
                                <div key={order.id} className="grid grid-cols-6 text-sm items-center py-3 border-b border-slate-100 last:border-0">
                                    <span className="text-slate-800 font-medium flex items-center">
                                        {`${order.order_type}${order.order_no}`}
                                        <ExternalLink size="16px" className="ml-4 text-blue-600 hover:text-blue-800 cursor-pointer" onClick={() => { navigate(`/orders/${order.id}`) }} />
                                    </span>
                                    <span className="text-slate-600 font-medium">{order.order_status}</span>
                                    <span className={`font-semibold hidden sm:block ${order.payment_status === "Paid" ? "text-emerald-600" : "text-slate-800"}`}>
                                        {order.payment_status}
                                    </span>
                                    <span className="text-slate-700 text-right font-medium">{order.total.toLocaleString()}</span>
                                    <span className="text-slate-700 text-right font-medium">{order.paid_amount.toLocaleString()}</span>
                                    <span className="text-slate-700 text-right font-medium">{(order.total - order.paid_amount).toLocaleString()}</span>
                                </div>
                            ))}

                            <div className="grid grid-cols-6 items-center text-sm font-bold bg-emerald-50/50 border border-emerald-100 py-3 px-3 rounded-xl mt-4">
                                <span className="text-emerald-900 col-span-2">Totals</span>
                                <span className="hidden sm:block"></span>
                                <span className="text-emerald-900 text-right">{totals?.total.toLocaleString()}</span>
                                <span className="text-emerald-900 text-right">{totals?.paid.toLocaleString()}</span>
                                <span className="text-emerald-900 text-right">{totals?.remaining.toLocaleString()}</span>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400">No orders available.</p>
                    )}
                </div>

                {/* Timestamps */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                    <div className="text-xs sm:text-sm text-slate-600 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-x-16">
                        <Timestamp label="Created At" value={customerData.created_at} />
                        <Timestamp label="Last Updated At" value={customerData.updated_at} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function DetailRow({ label, value }) {
    const handleCopy = () => {
        if (value) {
            navigator.clipboard.writeText(value);
            toast.success("Phone number copied!", { position: "bottom-right" });
        }
    };

    const isPhoneField = label === "Phone No 1." || label === "Phone No 2.";

    return (
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline py-1.5">
            <span className="text-slate-500 text-sm font-semibold">{label}:</span>
            <span className="text-sm text-slate-800 font-medium mt-1 sm:mt-0 flex items-center gap-1.5">
                {value || "N/A"}
                {isPhoneField && value && (
                    <Copy
                        size={15}
                        className="cursor-pointer text-slate-400 hover:text-slate-700 transition-colors"
                        onClick={handleCopy}
                    />
                )}
            </span>
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

export default CustomerView;
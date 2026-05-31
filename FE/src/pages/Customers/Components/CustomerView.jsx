import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { EditCustomer } from "./EditCustomer";
import { useNavigate, useParams } from "react-router";
import React, { useEffect, useState, useRef } from "react";
import { DeleteAlert } from "./CustomerDeleteAlert";
import { toast } from "sonner";
import BreadCrumbs from "@/components/ui/BreadCrumbs";
import { PDFDownloadLink } from "@react-pdf/renderer";
import CustomerTemplate from "./CustomerPdf";
import { deleteCustomer, getCustomerById } from "@/api/customerApi";
import { Copy, ExternalLink } from "lucide-react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { ErrorState, SkeletonDetailRow, SkeletonUsageRow, SkeletonUsageRow3 } from "@/components/Skeleton";
import { createAuditLog } from "@/api/settingApi";

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
    const pdfRef = useRef();
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

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

    // 2. Initial Load
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
                description: `${user.firstName} ${user.lastName} downloaded the customer's  ${customerData?.name || "Unknown Customer"} report as a PDF file.`,
            });
        } catch (error) {
            console.error("Failed to log download action:", error);
        }
    };

    if (isLoading) {
        return (
            <>
                {/* Breadcrumbs Skeleton */}
                <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4 mx-3 sm:mx-16"></div>

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
                                <SkeletonDetailRow />
                                <SkeletonDetailRow />
                            </div>
                            <div>
                                <SkeletonDetailRow />
                                <SkeletonDetailRow />
                                <SkeletonDetailRow />
                                <SkeletonDetailRow />
                            </div>
                        </div>
                    </div>

                    {/* Items Usage Skeleton */}
                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                        <div className="flex gap-6 mb-5 items-center">
                            <div className="h-7 w-36 bg-gray-200 rounded animate-pulse text-xl font-bold"></div>
                        </div>

                        <div className="space-y-2">
                            {/* Usage header */}
                            <div className="grid sm:grid-cols-3 grid-cols-1 text-xs text-gray-500 font-semibold border-b pb-1">
                                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                            </div>

                            {/* Multiple usage rows */}
                            {Array.from({ length: 5 }).map((_, i) => (
                                <SkeletonUsageRow3 key={i} />
                            ))}


                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                        <div className="flex gap-6 mb-5 items-center">
                            <div className="h-7 w-36 bg-gray-200 rounded animate-pulse text-xl font-bold"></div>
                        </div>

                        <div className="space-y-2">
                            {/* Usage header */}
                            <div className="grid sm:grid-cols-3 grid-cols-1 text-xs text-gray-500 font-semibold border-b pb-1">
                                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                            </div>

                            {/* Multiple usage rows */}
                            {Array.from({ length: 5 }).map((_, i) => (
                                <SkeletonUsageRow3 key={i} />
                            ))}


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
            <BreadCrumbs breadcrumbs={breadcrumbs} />
            <div className="sm:p-8 p-4 space-y-6 bg-gray-50 min-h-screen">
                <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <h1 className="sm:text-4xl text-2xl font-extrabold text-gray-800">{customerData.name}</h1>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                        <EditCustomer customerData={customerData} onUpdate={fetchCustomerData} />
                        <DeleteAlert handleDelete={handleDelete} customerData={customerData} />
                        <PDFDownloadLink
                            document={<CustomerTemplate customerData={customerData} />}
                            fileName={`Customer-Report-${customerData.name}.pdf`}
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium
                                               ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2
                                               focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50
                                               border border-blue-700 bg-blue-700 text-blue-50 hover:bg-blue-800
                                               h-9 px-4 py-2"
                            onClick={handleDownloadLog}
                        >
                            {({ loading }) =>
                                loading ? "Generating..." : "Download"
                            }
                        </PDFDownloadLink>
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-2xl font-semibold text-gray-700">Overview</h2>
                    <Separator className="my-4 bg-gray-300" />
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                    <h3 className="text-xl font-bold mb-5 text-gray-700">Customer Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
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

                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                    <h3 className="text-xl font-bold mb-5 text-gray-700">Quote Details</h3>
                    {customerData.quotes?.length > 0 ? (
                        <div className="space-y-2">
                            <div className="grid grid-cols-2 text-xs text-gray-500 font-semibold border-b pb-1">
                                <span>Quote No.</span>
                                <span>Status</span>
                            </div>
                            {customerData.quotes.map((quote) => (
                                <div
                                    key={quote.id}
                                    className="grid grid-cols-2 text-sm items-center py-2 border-b"
                                >
                                    <span className="text-gray-800 flex">{`${quote.quote_type}${quote.quote_no}`} <ExternalLink size="16px" className="ml-8 flex items-center text-blue-600 hover:underline cursor-pointer" onClick={() => { navigate(`/quotes/${quote.id}`) }} /></span>
                                    <span
                                        className={`font-medium ${quote.status === "Submitted"
                                            ? "text-green-700"
                                            : quote.status === "Rejected"
                                                ? "text-red-700"
                                                : "text-gray-700"
                                            }`}
                                    >
                                        {quote.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">No quotes available.</p>
                    )}
                </div>


                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                    <h3 className="text-xl font-bold mb-5 text-gray-700">Order Details</h3>
                    {customerData.orders?.length > 0 ? (
                        <>
                            <div className="space-y-2">
                                <div className="grid grid-cols-6  text-xs text-gray-500 font-semibold border-b pb-1">
                                    <span>Order No.</span>
                                    <span>Order Status</span>
                                    <span className="hidden sm:block">Payment Status</span>
                                    <span>Net Total (LKR)</span>
                                    <span>Paid Amount (LKR)</span>
                                    <span>Remaining Amount (LKR)</span>
                                </div>
                                {customerData.orders.map((order) => (
                                    <div
                                        key={order.id}
                                        className="grid grid-cols-6 text-sm items-center py-2 border-b"
                                    >
                                        <span className="text-gray-800 flex">{`${order.order_type}${order.order_no}`}<ExternalLink size="16px" className="ml-8 flex items-center text-blue-600 hover:underline cursor-pointer" onClick={() => { navigate(`/orders/${order.id}`) }} /></span>
                                        <span className="text-gray-700">{order.order_status}</span>
                                        <span
                                            className={`font-medium hidden sm:block ${order.payment_status === "Paid"
                                                ? "text-green-700"
                                                : "text-black"
                                                }`}
                                        >
                                            {order.payment_status}
                                        </span>
                                        <span className="text-gray-700 text-right mr-28">{order.total.toLocaleString()}</span>
                                        <span className="text-gray-700 text-right mr-24">{order.paid_amount.toLocaleString()}</span>
                                        <span className="text-gray-700 text-right mr-14">{(order.total - order.paid_amount).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="grid sm:grid-cols-6 grid-cols-2 items-center text-sm font-semibold bg-green-50 border-t border-green-200 py-3 px-2 rounded-b-lg">
                                <span className="text-green-800 col-span-2 sm:col-span-1">Totals</span>
                                <span className="hidden sm:block"></span>
                                <span className="hidden sm:block"></span>
                                <span className="text-green-800 text-right mr-28">{totals?.total.toLocaleString()}</span>
                                <span className="text-green-800 text-right mr-[90px]">{totals?.paid.toLocaleString()}</span>
                                <span className="text-green-800 text-right mr-12">{totals?.remaining.toLocaleString()}</span>
                            </div>


                        </>

                    ) : (
                        <p className="text-sm text-gray-500">No orders available.</p>
                    )}
                </div>

                {/* Timestamps */}
                <div className="flex justify-end mt-8">
                    <div className="bg-gray-100 rounded-xl p-5 text-xs sm:text-sm text-gray-600 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-x-16">
                        <Timestamp label="Created At" value={customerData.created_at} />
                        <Timestamp label="Last Updated At" value={customerData.updated_at} />
                    </div>
                </div>
            </div>
        </>
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
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline py-1">
            <span className="text-gray-600 text-sm font-medium">{label}:</span>
            <span className="text-sm text-gray-600 mt-1 sm:mt-0 flex items-center gap-1">
                {value || "N/A"}
                {isPhoneField && value && (
                    <Copy
                        size={16}
                        className="cursor-pointer text-gray-500 hover:text-black"
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
            <span className="uppercase tracking-wide text-[10px] text-gray-500 font-semibold mb-1">{label}</span>
            <span className="font-medium text-gray-800 text-sm">{value ? new Date(value).toLocaleString() : "N/A"}</span>
        </div>
    );
}

export default CustomerView;

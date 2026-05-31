import { Separator } from "@/components/ui/separator";
import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import BreadCrumbs from "@/components/ui/BreadCrumbs";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { EditBatteryPackQuote } from "./EditBatteryPackQuote";
import BatteryPackQuoteDetailsTemplate from "./BatteryPackQuotePdf";
import { deleteQuote, fetchQuoteById } from "@/api/quoteApi";
import { Badge } from "@/components/ui/badge";
import { useAuth, useUser } from "@clerk/clerk-react";
import { DeleteAlert } from "./QuoteDeleteAlert";
import { Roles } from "@/const/const";
import { ErrorState, SkeletonDetailRow, SkeletonSummaryRow, SkeletonTableRow } from "@/components/Skeleton";
import TCDialog from "./T&CDialog";
import TCDropDown from "./T&CDialog";
import { createAuditLog } from "@/api/settingApi";

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
    const breadcrumbs = [
        { name: "Dashboard", link: "/" },
        { name: "Quotes", link: "/quotes" },
        { name: " ", link: `/quotes/${quoteId}` },
    ];

    const [quoteData, setQuoteData] = useState(null);
    const [isClient, setIsClient] = useState(false);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        setIsClient(true);
    }, []);

    // useEffect(() => {
    //     const fetchQuoteData = async () => {
    //         try {
    //             setIsLoading(true);
    //             const token = await getToken();
    //             const response = await fetchQuoteById(token, quoteId);
    //             setQuoteData(response.data);
    //         } catch (error) {
    //             setIsError(true);
    //             setErrorMessage("Error fetching quote data: " + error.message);
    //             console.error("Error fetching quote data:", error);
    //         } finally {
    //             setIsLoading(false);
    //             setIsError(false);
    //         }
    //     };
    //     fetchQuoteData();
    // }, [getToken, quoteId]);

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
    const discountPercentage = (discountAmount / subTotalWithAdditionalCharges) * 100;
    const vatAmount = quoteData?.vat == true ? quoteData?.total * 0.18 : 0;
    console.log('vatAmount', vatAmount)
    const netTotal = quoteData?.total + vatAmount;


    const getStatusBadge = (status) => {
        switch (status) {
            case "Confirmed":
                return <Badge className="rounded-full bg-green-500 hover:bg-green-600 text-white px-3 py-1 text-sm">Confirmed</Badge>;
            case "Submitted":
                return <Badge className="rounded-full bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 text-sm">Submitted</Badge>;
            case "Drafted":
                return <Badge className="rounded-full bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 text-sm">Drafted</Badge>;
            case "Rejected":
                return <Badge className="rounded-full bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-sm">Rejected</Badge>;
            case "Discarded":
                return <Badge className="rounded-full bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 text-sm">Discarded</Badge>;
            default:
                return null;
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
                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
                    <div className="flex items-center gap-4">
                        <h1 className="sm:text-4xl text-md font-extrabold text-gray-800">
                            {quoteData?.type}{quoteData?.quote_no}
                        </h1>
                        {getStatusBadge(quoteData?.status)}
                    </div>

                    {/* Action Buttons */}
                   
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                            {
                                isMobile ? <TCDropDown quoteData={quoteData} discountPercentage={discountPercentage} isClient={isClient} vatAmount={vatAmount} netTotal={netTotal} />
                                    : <div className="gap-4 flex">
                                        <EditBatteryPackQuote quoteData={quoteData} onUpdate={fetchQuoteData} />
                                        
                                            <DeleteAlert handleDelete={handleDelete} quoteData={quoteData} />
                                      
                                        <TCDropDown quoteData={quoteData} discountPercentage={discountPercentage} isClient={isClient} vatAmount={vatAmount} netTotal={netTotal} />
                                    </div>
                            }

                            {/* {isClient && (
                                <PDFDownloadLink
                                    document={<BatteryPackQuoteDetailsTemplate quoteData={quoteData} discountPercentage={discountPercentage} />}
                                    fileName={`${quoteData.type + quoteData.quote_no}.pdf`}
                                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium
                                               ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2
                                               focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50
                                               border border-blue-700 bg-blue-700 text-blue-50 hover:bg-blue-800
                                               h-9 px-4 py-2"
                                >
                                    {({ loading }) =>
                                        loading ? "Generating..." : "Download"
                                    }
                                </PDFDownloadLink>
                            )} */}
                        </div>
                   
                </div>

                {/* Overview Section */}
                <div className="space-y-4 sm:pl-6">
                    <h2 className="text-2xl font-semibold text-gray-700">Overview</h2>
                    <Separator className="my-4 bg-gray-300" />

                    {/* Customer Details Card */}
                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                        <h3 className="text-xl font-bold mb-5 text-gray-700">Customer Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                            <DetailRow label="Name" value={`${quoteData?.title} ${quoteData?.first_name} ${quoteData?.last_name}`} />
                            <DetailRow label="Email" value={quoteData?.email} />
                            <DetailRow label="Phone No. 1" value={quoteData?.phone_no1} />
                            <DetailRow label="Phone No. 2" value={quoteData?.phone_no2} />
                            <DetailRow label="Address" value={quoteData?.address} />

                            {
                                quoteData?.PoNo ? <DetailRow label="PO No" value={quoteData?.PoNo} /> : null
                            }
                            {
                                quoteData?.vat_no ? <DetailRow label="VAT No" value={quoteData?.vat_no} /> : null
                            }

                        </div>
                    </div>

                    {/* Product Details Card */}
                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold mb-5 text-gray-700">Product Details</h3>
                            {quoteData?.is_catalog ? <Badge className="rounded-full bg-orange-400 hover:bg-yellow-600 text-white px-3 py-1 text-sm">Catalog</Badge> : null}
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
                                    {quoteData?.items?.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
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

                        {/* Pricing Summary */}
                        <div className="mt-6 pt-4 border-t border-gray-200 space-y-3 text-sm sm:text-base">
                            {/* Subtotal */}
                            <div className="flex flex-wrap justify-between font-semibold text-gray-800">
                                <span>Subtotal</span>
                                <span className="text-right min-w-[100px]">LKR {parseFloat(quoteData?.subtotal).toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}
                                </span>
                            </div>

                            {/* Additional Charges */}
                            {quoteData?.additional_charges?.map((charge, index) => (
                                <div key={index} className="flex justify-between text-gray-600">
                                    <span>{charge.type}</span>
                                    <span className="text-right min-w-[100px]">LKR {parseFloat(charge.value).toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    })}
                                    </span>
                                </div>
                            ))}

                            {/* Discount (%) */}
                            <div className="flex flex-wrap justify-between text-gray-600">
                                <span>Discount ({discountPercentage.toFixed(2)}%)</span>
                                <span className="text-right min-w-[100px]">
                                    - LKR {quoteData?.discount && Number(quoteData.discount) > 0
                                        ? Number(quoteData.discount).toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })
                                        : "0.00"}
                                </span>
                            </div>

                            {/* Discount Amount */}
                            {/* {quoteData.discount && Number(quoteData.discount) > 0 && (
                                <div className="flex justify-between text-red-500 font-medium">
                                    <span>Discount Amount</span>
                                    <span className="text-right min-w-[100px]">
                                        - LKR {quoteData.discount && Number(quoteData.discount) > 0
                                            ? Number(quoteData.discount).toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })
                                            : "0.00"}
                                    </span>
                                </div>
                            )} */}
                            {
                                !quoteData?.vat ? null : <div className="flex justify-between text-sm text-gray-600">
                                    <span>VAT (18%)</span>
                                    <span>
                                        + LKR {vatAmount.toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </span>
                                </div>
                            }

                            {/* Total Payable */}
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

                    {/* Additional Details Card  */}
                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                        <h3 className="text-xl font-bold mb-5 text-gray-700">Notes</h3>
                        <div className="flex flex-col space-y-4">
                            {
                                quoteData?.items?.map((item) =>
                                    item.note && <NoteDetail key={item.id} label={item.product_name} value={item.note} />
                                )
                            }
                            {
                                !quoteData?.items?.some(item => item.note) && (
                                    <p className="text-gray-500 col-span-full">No specific notes available for products.</p>
                                )
                            }
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                        <h3 className="text-xl font-bold mb-5 text-gray-700">Sale Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                            <DetailRow label="No." value={quoteData?.sales_no} />
                            <DetailRow label="Type" value={quoteData?.sales_type} />
                            <DetailRow label="Salesperson" value={quoteData?.salesperson} />
                            <DetailRow
                                label="Commission"
                                value={quoteData?.commission.toLocaleString('en-US', {
                                    style: 'currency',
                                    currency: 'LKR',
                                })}
                            />

                            <DetailRow label="Description" value={quoteData?.description} />
                            <DetailRow label="Recording" value={quoteData?.recording_url} />
                        </div>
                    </div>


                    {/* Timestamps */}
                    <div className="flex sm:justify-end mt-8">
                        <div className="bg-gray-100 rounded-xl p-5 text-xs sm:text-sm text-gray-600 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-x-16">
                            <Timestamp label="Created At" value={quoteData?.created_at} />
                            <Timestamp label="Last Updated At" value={quoteData?.updated_at} />
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


export default BatteryPackQuoteView;
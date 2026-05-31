import { Separator } from "@/components/ui/separator";
import { useNavigate, useParams } from "react-router";
import React, { useEffect, useState, useRef } from "react";
import { DeleteAlert } from "./DeleteAlert";
import { toast } from "sonner";
import BreadCrumbs from "@/components/ui/BreadCrumbs";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { useAuth, useUser } from "@clerk/clerk-react";
import { ErrorState, SkeletonDetailRow, SkeletonUsageRow3 } from "@/components/Skeleton";
import SaleTemplate from "./SalesPdf";
import { deleteSale, getSaleById } from "@/api/saleApi";
import { EditSale } from "./EditSales";
import { createAuditLog } from "@/api/settingApi";
import { Badge } from "@/components/ui/badge";

function SaleView() {
    const { user } = useUser();
    const { getToken } = useAuth();
    const { saleId } = useParams();
    console.log("sale", saleId)


    const breadcrumbs = [
        { name: "Dashboard", link: "/" },
        { name: "Sales", link: "/sales" },
        { name: " ", link: `/sales/${saleId}` },
    ];

    const [saleData, setSaleData] = useState({});
    const navigate = useNavigate();
    const pdfRef = useRef();
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // useEffect(() => {
    //     const fetchSaleData = async () => {
    //         try {
    //             setIsLoading(true);
    //             const token = await getToken();
    //             const res = await getSaleById(token, saleId);
    //             const sale = res.data;
    //             setSaleData(sale);
    //         } catch (error) {
    //             setIsError(true);
    //             setErrorMessage("Error fetching sale data: " + error.message);
    //             toast.error("Couldn't load sale data", { position: "bottom-right" });
    //         } finally {
    //             setIsLoading(false);
    //             setIsError(false);
    //         }
    //     };

    //     fetchSaleData();
    // }, [saleId, getToken]);

    const fetchSaleData = async () => {
        try {
            const token = await getToken();
            const res = await getSaleById(token, saleId);
            setSaleData(res.data);
        } catch (error) {
            setIsError(true);
            setErrorMessage("Error fetching sale data: " + error.message);
            toast.error("Couldn't load sale data", { position: "bottom-right" });
        }
    };

    useEffect(() => {
        setIsLoading(true);
        fetchSaleData().finally(() => setIsLoading(false));
    }, [saleId, getToken]);

    const handleDelete = async () => {
        try {
            const token = await getToken();
            const response = await deleteSale(token, saleId);
            if (response.message === "success") {
                toast.success("Sale deleted successfully!", { position: "bottom-right" });
                navigate("/sales");
            }
        } catch (error) {
            toast.error("Error deleting sales data! Please try again.", { position: "bottom-right" });
        }
    };

    const handleDownloadLog = async () => {
        try {
            const token = await getToken();
            await createAuditLog(token, {
                action: "PDF Downloaded",
                status_code: 200,
                user: user.id,
                description: `${user.firstName} ${user.lastName} downloaded the sale no ${saleData?.sale_no} report as a PDF file.`,
            });
        } catch (error) {
            console.error("Failed to log download action:", error);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "Confirmed":
                return <Badge className="rounded-full bg-green-600 hover:bg-green-800 text-white px-3 py-1 text-sm">Confirmed</Badge>;
            case "Quoted":
                return <Badge className="rounded-full bg-blue-600 hover:bg-blue-800 text-white px-3 py-1 text-sm">Quoted</Badge>;
            default:
                return <Badge className="rounded-full bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 text-sm">No Status</Badge>;
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
                    <div className="flex items-center gap-4">
                         <h1 className="sm:text-4xl text-2xl font-extrabold text-gray-800">{saleData.sale_no}</h1>
                        {getStatusBadge(saleData?.status)}
                    </div>
                   
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                        <EditSale saleData={saleData} onUpdate={fetchSaleData} />
                        <DeleteAlert handleDelete={handleDelete} saleData={saleData} />
                        <PDFDownloadLink
                            document={<SaleTemplate saleData={saleData} />}
                            fileName={`Sales-Report-${saleData.customer_phone}.pdf`}
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
                    <h3 className="text-xl font-bold mb-5 text-gray-700">Sales Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                        <DetailRow label="Salesperson" value={saleData.salesperson} />
                        <DetailRow label="Type" value={saleData.type} />
                        <DetailRow
                            label="Commission"
                            value={`LKR ${(saleData.commission || 0).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}`}
                        />
                        <DetailRow
                            label="Date"
                            value={new Date(saleData.date).toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                timeZone: 'Asia/Colombo'
                            })}
                        />
                        <DetailRow label="Customer Name" value={saleData.customer_name} />
                        <DetailRow label="Customer Phone No." value={saleData.customer_phone} />
                        <DetailRow label="Recording" value={saleData.recording_url} />
                        <DetailRow label="Description" value={saleData.description} />
                    </div>
                </div>


                {/* Timestamps */}
                <div className="flex justify-end mt-8">
                    <div className="bg-gray-100 rounded-xl p-5 text-xs sm:text-sm text-gray-600 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-x-16">
                        <Timestamp label="Updated By" value={saleData.updated_by} />
                        <Timestamp label="Created At" value={saleData.created_at} isDate />
                        <Timestamp label="Last Updated At" value={saleData.updated_at} isDate />
                    </div>
                </div>
            </div>
        </>
    );
}


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

function Timestamp({ label, value, isDate }) {
    return (
        <div className="flex flex-col">
            <span className="uppercase tracking-wide text-[10px] text-gray-500 font-semibold mb-1">{label}</span>
            <span className="font-medium text-gray-800 text-sm">{value ? (isDate ? new Date(value).toLocaleString() : value) : "N/A"}</span>
        </div>
    );
}

export default SaleView;

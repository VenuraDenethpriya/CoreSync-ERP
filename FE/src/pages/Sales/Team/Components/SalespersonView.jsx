import { Separator } from "@/components/ui/separator";
import { useNavigate, useParams } from "react-router";
import React, { useEffect, useState, useRef } from "react";
import { DeleteAlert } from "./DeleteAlert";
import { toast } from "sonner";
import BreadCrumbs from "@/components/ui/BreadCrumbs";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { useAuth, useUser } from "@clerk/clerk-react";
import { ErrorState, SkeletonDetailRow, SkeletonUsageRow3 } from "@/components/Skeleton";
import SaleTemplate from "./SalespersonPdf";
import { deleteSalesperson, fetchSalesByDateRange, getSalespersonById } from "@/api/salespersonApi";
import { EditSalesperson } from "./EditSalesperson";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { createAuditLog } from "@/api/settingApi";

function SalespersonView() {
    const { user } = useUser();
    const { getToken } = useAuth();
    const { salespersonId } = useParams();
    console.log("salesperson", salespersonId)


    const breadcrumbs = [
        { name: "Dashboard", link: "/" },
        { name: "team", link: "/salesperson" },
        { name: " ", link: `/sales/salespersons/${salespersonId}` },
    ];

    const [salespersonData, setSalespersonData] = useState({});
    const navigate = useNavigate();
    const pdfRef = useRef();
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // --- Date Range States ---
    const [dateRange, setDateRange] = useState({
        from: null,
        to: null,
    });

    // Range API Data
    const [rangeData, setRangeData] = useState({
        total_sales_no: 0,
        total_commission: 0,
    });

    // Loading & error
    const [rangeLoading, setRangeLoading] = useState(false);
    const [rangeError, setRangeError] = useState(null);

    // useEffect(() => {
    //     const fetchSalespersonData = async () => {
    //         try {
    //             setIsLoading(true);
    //             const token = await getToken();
    //             const res = await getSalespersonById(token, salespersonId);
    //             const salesperson = res.data;
    //             setSalespersonData(salesperson);
    //         } catch (error) {
    //             setIsError(true);
    //             setErrorMessage("Error fetching salesperson data: " + error.message);
    //             toast.error("Couldn't load salesperson data", { position: "bottom-right" });
    //         } finally {
    //             setIsLoading(false);
    //             setIsError(false);
    //         }
    //     };

    //     fetchSalespersonData();
    // }, [salespersonId, getToken]);

    const fetchSalespersonData = async () => {
        try {
            // Optional: setIsLoading(true) if you want to show loading skeleton during update
            const token = await getToken();
            const res = await getSalespersonById(token, salespersonId);
            const salesperson = res.data;
            setSalespersonData(salesperson);
        } catch (error) {
            setIsError(true);
            setErrorMessage("Error fetching salesperson data: " + error.message);
            toast.error("Couldn't load salesperson data", { position: "bottom-right" });
        }
    };

    // 2. Initial Load
    useEffect(() => {
        setIsLoading(true);
        fetchSalespersonData().finally(() => {
            setIsLoading(false);
            setIsError(false);
        });
    }, [salespersonId, getToken]);

    const handleDelete = async () => {
        try {
            const token = await getToken();
            const response = await deleteSalesperson(token, salespersonId);
            if (response.message === "success") {
                toast.success("Salesperson deleted successfully!", { position: "bottom-right" });
                navigate("/sales");
            }
        } catch (error) {
            toast.error("Error deleting salesperson data! Please try again.", { position: "bottom-right" });
        }
    };

    const handleFetchRangeData = async (range) => {
        if (!range?.from || !range?.to) return;

        try {
            setRangeLoading(true);
            const token = await getToken();
            const fromDate = range.from.toISOString().split("T")[0];
            const toDate = range.to.toISOString().split("T")[0];

            const data = await fetchSalesByDateRange(token, salespersonId, fromDate, toDate);

            setRangeData({
                total_sales_no: data.data?.total_sales_no || 0,
                total_commission: data.data?.total_commission || 0,
            });

            setRangeError(null);
        } catch (error) {
            console.error(error);
            setRangeError("Failed to load data");
        } finally {
            setRangeLoading(false);
        }
    };

    const handleDownloadLog = async () => {
        try {
            const token = await getToken();
            await createAuditLog(token, {
                action: "PDF Downloaded",
                status_code: 200,
                user: user.id,
                description: `${user.firstName} ${user.lastName} downloaded the salesperson's  ${salespersonData?.first_name} ${salespersonData?.last_name} report as a PDF file.`,
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
                    <h1 className="sm:text-4xl text-2xl font-extrabold text-gray-800">{salespersonData.first_name} {salespersonData.last_name}</h1>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                        <EditSalesperson salespersonData={salespersonData} onUpdate={fetchSalespersonData} />
                        <DeleteAlert handleDelete={handleDelete} salespersonData={salespersonData} />
                        <PDFDownloadLink
                            document={<SaleTemplate salespersonData={salespersonData} />}
                            fileName={`Salesperson-Report-${salespersonData.first_name} ${salespersonData.last_name}.pdf`}
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
                    <h3 className="text-xl font-bold mb-5 text-gray-700">Salesperson Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                        <DetailRow label="Email" value={salespersonData.email} />
                        <DetailRow label="Phone No." value={salespersonData.phone} />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                    <div className="flex justify-between">
                        <h3 className="text-xl font-bold mb-5 text-gray-700">Sales Details</h3>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-[260px] justify-start text-left font-normal">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateRange.from && dateRange.to
                                        ? `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`
                                        : "Pick a date range"}
                                </Button>
                            </PopoverTrigger>

                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="range"
                                    selected={dateRange}
                                    onSelect={(range) => {
                                        setDateRange(range);
                                        handleFetchRangeData(range);
                                    }}
                                    numberOfMonths={2}
                                    classNames={{
                                        head_cell: "w-8 font-normal text-[0.8rem]",
                                        cell: "h-8 w-8 text-center p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                        day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100",
                                    }}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                        {dateRange?.from && dateRange?.to && (
                            <>
                                <DetailRow
                                    label={`Sales count from ${dateRange.from.toLocaleDateString()} to ${dateRange.to.toLocaleDateString()}`}
                                    value={rangeData.total_sales_no}
                                />
                                <DetailRow
                                    label={`Commission from ${dateRange.from.toLocaleDateString()} to ${dateRange.to.toLocaleDateString()}`}
                                    value={`LKR ${rangeData.total_commission.toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}`}
                                />
                            </>
                        )}

                        <DetailRow
                            label="Total sales for last month"
                            value={salespersonData.total_sales_no_last_month || "0"}
                        />
                        <DetailRow
                            label="Total commission for last month"
                            value={`LKR ${(salespersonData.total_commission_last_month || 0).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}`}
                        />
                        <DetailRow
                            label="Total sales"
                            value={salespersonData.total_sales_no || "0"}
                        />
                        <DetailRow
                            label="Total commission"
                            value={`LKR ${(salespersonData.total_commission || 0).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}`}
                        />
                    </div>

                </div>


                {/* Timestamps */}
                <div className="flex justify-end mt-8">
                    <div className="bg-gray-100 rounded-xl p-5 text-xs sm:text-sm text-gray-600 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-x-16">
                        <Timestamp label="Updated By" value={salespersonData.created_by} />
                        <Timestamp label="Created At" value={salespersonData.created_at} isDate />
                        <Timestamp label="Last Updated At" value={salespersonData.updated_at} isDate />
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


function Timestamp({ label, value, isDate }) {
    return (
        <div className="flex flex-col">
            <span className="uppercase tracking-wide text-[10px] text-gray-500 font-semibold mb-1">{label}</span>
            <span className="font-medium text-gray-800 text-sm">{value ? (isDate ? new Date(value).toLocaleString() : value) : "N/A"}</span>
        </div>
    );
}

export default SalespersonView;

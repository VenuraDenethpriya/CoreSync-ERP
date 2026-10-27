import { useNavigate, useParams } from "react-router";
import { useEffect, useState, useRef } from "react";
import { DeleteAlert } from "./DeleteAlert";
import { toast } from "sonner";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { useAuth, useUser } from "@clerk/clerk-react";
import { ErrorState } from "@/components/Skeleton";
import SaleTemplate from "./SalesPdf";
import { deleteSale, getSaleById } from "@/api/saleApi";
import { EditSale } from "./EditSales";
import { createAuditLog } from "@/api/settingApi";
import { Badge } from "@/components/ui/badge";
import { Roles } from "@/const/const";

function SaleView() {
    const { user } = useUser();
    const { getToken } = useAuth();
    const { saleId } = useParams();

    const [saleData, setSaleData] = useState({});
    const navigate = useNavigate();
    const pdfRef = useRef();
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
                return <Badge className="rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-100 font-bold text-xs px-3 py-1 border-0">Confirmed</Badge>;
            case "Quoted":
                return <Badge className="rounded-full bg-blue-100 text-blue-700 hover:bg-blue-100 font-bold text-xs px-3 py-1 border-0">Quoted</Badge>;
            default:
                return <Badge className="rounded-full bg-slate-100 text-slate-600 hover:bg-slate-100 font-bold text-xs px-3 py-1 border-0">No Status</Badge>;
        }
    };

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
                            <div className="h-10 w-24 bg-slate-200 rounded-xl"></div>
                            <div className="h-10 w-24 bg-rose-100 rounded-xl"></div>
                            <div className="h-10 w-28 bg-slate-200 rounded-xl"></div>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    {/* Sales Details Card Skeleton */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                        <div className="h-6 w-32 bg-slate-200 rounded-lg mb-5"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                            {/* 6 standard rows */}
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="flex justify-between items-center py-1.5">
                                    <div className="h-4 w-28 bg-slate-200 rounded"></div>
                                    <div className="h-4 w-32 bg-slate-100 rounded"></div>
                                </div>
                            ))}
                            
                            {/* Recording Audio Row (col-span-2) */}
                            <div className="md:col-span-2 flex flex-col sm:flex-row sm:justify-between sm:items-center py-2">
                                <div className="h-4 w-24 bg-slate-200 rounded mb-2 sm:mb-0"></div>
                                <div className="h-10 w-full sm:w-80 bg-slate-100 rounded-lg"></div>
                            </div>

                            {/* Description Row (col-span-2) */}
                            <div className="md:col-span-2 flex justify-between items-center py-1.5">
                                <div className="h-4 w-28 bg-slate-200 rounded"></div>
                                <div className="h-4 w-64 bg-slate-100 rounded"></div>
                            </div>
                        </div>
                    </div>

                    {/* Timestamps Skeleton */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-x-16">
                            {Array.from({ length: 3 }).map((_, i) => (
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
        return (
            <ErrorState errorMessage={errorMessage} />
        );
    }

    return (
        <div className="w-full space-y-6">
            {/* Header */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/70 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">{saleData.sale_no}</h1>
                    {getStatusBadge(saleData?.status)}
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    {
                        user.publicMetadata.role == Roles.READ_ONLY ? null : (
                            <>
                                <EditSale saleData={saleData} onUpdate={fetchSaleData} />
                                <DeleteAlert handleDelete={handleDelete} saleData={saleData} />
                                <PDFDownloadLink
                                    document={<SaleTemplate saleData={saleData} />}
                                    fileName={`Sales-Report-${saleData.customer_phone || 'Customer'}.pdf`}
                                    className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 h-10 px-4 py-2 transition-colors"
                                    onClick={handleDownloadLog}
                                >
                                    {({ loading }) =>
                                        loading ? "Generating..." : "Download"
                                    }
                                </PDFDownloadLink>
                            </>
                        )
                    }
                </div>
            </div>

            <div className="space-y-6">
                {/* Sales Details */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                    <h3 className="text-lg font-bold mb-5 text-slate-800">Sales Details</h3>
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
                            value={saleData.date ? new Date(saleData.date).toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                timeZone: 'Asia/Colombo'
                            }) : undefined}
                        />
                        <DetailRow label="Customer Name" value={saleData.customer_name} />
                        <DetailRow label="Customer Phone No." value={saleData.customer_phone} />
                        <div className="md:col-span-2">
                            <DetailRow label="Recording" value={saleData.recording_url} />
                        </div>
                        <div className="md:col-span-2">
                            <DetailRow label="Description" value={saleData.description} />
                        </div>
                    </div>
                </div>

                {/* Timestamps */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                    <div className="text-xs sm:text-sm text-slate-600 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-x-16">
                        <Timestamp label="Updated By" value={saleData.updated_by} />
                        <Timestamp label="Created At" value={saleData.created_at} isDate />
                        <Timestamp label="Last Updated At" value={saleData.updated_at} isDate />
                    </div>
                </div>
            </div>
        </div>
    );
}

function DetailRow({ label, value }) {
    if (label.toLowerCase() === "recording" && value) {
        return (
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2">
                <span className="text-slate-500 text-sm font-semibold">{label}:</span>
                <div className="flex items-center gap-2 mt-1 sm:mt-0">
                    <audio controls className="h-10 w-full sm:w-80">
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

function Timestamp({ label, value, isDate }) {
    return (
        <div className="flex flex-col">
            <span className="uppercase tracking-wider text-[10px] text-slate-400 font-bold mb-1">{label}</span>
            <span className="font-semibold text-slate-700 text-sm">{value ? (isDate ? new Date(value).toLocaleString() : value) : "N/A"}</span>
        </div>
    );
}

export default SaleView;
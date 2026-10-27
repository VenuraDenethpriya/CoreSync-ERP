import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { DeleteAlert } from "./DeleteAlert";
import { toast } from "sonner";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { useAuth, useUser } from "@clerk/clerk-react";
import { ErrorState } from "@/components/Skeleton";
import SaleTemplate from "./SalespersonPdf";
import { deleteSalesperson, fetchSalesByDateRange, getSalespersonById } from "@/api/salespersonApi";
import { EditSalesperson } from "./EditSalesperson";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Trash2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { createAuditLog } from "@/api/settingApi";
import { subMonths } from "date-fns";
import AddTarget from "./AddTarget";
import { deleteSalesTarget, fetchSalesTargetBySalesperson } from "@/api/saleApi";
import { Roles } from "@/const/const";

function SalespersonView() {
    const { user } = useUser();
    const { getToken } = useAuth();
    const { salespersonId } = useParams();

    const [salespersonData, setSalespersonData] = useState({});
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [targets, setTargets] = useState([]);

    const [dateRange, setDateRange] = useState({ from: null, to: null });
    const [rangeData, setRangeData] = useState({ total_sales_no: 0, total_commission: 0 });
    const [targetDateRange, setTargetDateRange] = useState({
        from: subMonths(new Date(), 12),
        to: new Date(),
    });
    const [rangeLoading, setRangeLoading] = useState(false);

    const fetchSalespersonData = async () => {
        try {
            const token = await getToken();
            const res = await getSalespersonById(token, salespersonId);
            setSalespersonData(res.data);
        } catch (error) {
            setIsError(true);
            setErrorMessage("Error fetching salesperson data: " + error.message);
            toast.error("Couldn't load salesperson data", { position: "bottom-right" });
        }
    };

    useEffect(() => {
        setIsLoading(true);
        fetchSalespersonData().finally(() => {
            setIsLoading(false);
            setIsError(false);
        });
    }, [salespersonId, getToken]);

    const fetchTargets = async (range = targetDateRange) => {
        if (!range?.from || !range?.to) return;
        try {
            setRangeLoading(true);
            const token = await getToken();
            const fromDate = range.from.toISOString().split("T")[0];
            const toDate = range.to.toISOString().split("T")[0];
            const res = await fetchSalesTargetBySalesperson(token, salespersonId, fromDate, toDate);
            const fetchedTargets = res.data?.targets || [];
            fetchedTargets.sort((a, b) => (b.year - a.year) || (b.month - a.month));
            setTargets(fetchedTargets);
        } catch (error) {
            console.error("Failed to load targets", error);
            toast.error("Failed to load targets");
        } finally {
            setRangeLoading(false);
        }
    };

    useEffect(() => {
        if (salespersonId) fetchTargets(targetDateRange);
    }, [salespersonId, targetDateRange, getToken]);

    const handleDelete = async () => {
        try {
            const token = await getToken();
            const response = await deleteSalesperson(token, salespersonId);
            if (response.message === "success") {
                toast.success("Salesperson deleted successfully!", { position: "bottom-right" });
                navigate("/sales");
            }
        } catch (error) {
            toast.error("Error deleting salesperson data!", { position: "bottom-right" });
        }
    };

    const handleDeleteSalesTarget = async (salesTargetId) => {
        try {
            const token = await getToken();
            const response = await deleteSalesTarget(token, salesTargetId);
            if (response.message === "success") {
                toast.success("Sales target deleted successfully!", { position: "bottom-right" });
                fetchTargets(targetDateRange);
            }
        } catch (error) {
            toast.error("Error deleting sales target data!", { position: "bottom-right" });
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
        } catch (error) {
            console.error(error);
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
                description: `${user.firstName} ${user.lastName} downloaded the salesperson's ${salespersonData?.first_name} ${salespersonData?.last_name} report.`,
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
                    <div className="h-8 w-48 bg-slate-200 rounded-xl"></div>
                    <div className="flex flex-wrap items-center gap-2.5">
                        <div className="h-10 w-24 bg-slate-200 rounded-xl"></div>
                        <div className="h-10 w-24 bg-rose-100 rounded-xl"></div>
                        <div className="h-10 w-28 bg-slate-200 rounded-xl"></div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Salesperson Details Skeleton */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                        <div className="h-6 w-48 bg-slate-200 rounded-lg mb-5"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
                            {Array.from({ length: 2 }).map((_, i) => (
                                <div key={i} className="flex justify-between items-center py-1.5">
                                    <div className="h-4 w-24 bg-slate-200 rounded"></div>
                                    <div className="h-4 w-32 bg-slate-100 rounded"></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sales Statistics Skeleton */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-4">
                            <div className="h-6 w-36 bg-slate-200 rounded-lg"></div>
                            <div className="h-10 w-full sm:w-[260px] bg-slate-200 rounded-xl"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="flex justify-between items-center py-1.5">
                                    <div className="h-4 w-40 bg-slate-200 rounded"></div>
                                    <div className="h-4 w-20 bg-slate-100 rounded"></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sales Targets Skeleton */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-4">
                            <div className="h-6 w-32 bg-slate-200 rounded-lg"></div>
                            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                                <div className="h-10 w-full sm:w-[260px] bg-slate-200 rounded-xl"></div>
                                <div className="h-10 w-full sm:w-24 bg-slate-200 rounded-xl"></div>
                            </div>
                        </div>
                        <div className="overflow-hidden mb-2">
                            <div className="border-b border-slate-100 px-2 py-3 grid grid-cols-6 gap-4">
                                <div className="h-3 w-12 bg-slate-200 rounded"></div>
                                <div className="h-3 w-12 bg-slate-200 rounded"></div>
                                <div className="h-3 w-20 bg-slate-200 rounded"></div>
                                <div className="h-3 w-20 bg-slate-200 rounded"></div>
                                <div className="h-3 w-24 bg-slate-200 rounded"></div>
                                <div className="h-3 w-8 bg-slate-200 rounded ml-auto"></div>
                            </div>
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="px-2 py-3 grid grid-cols-6 gap-4 border-b border-slate-100 items-center">
                                    <div className="h-4 w-10 bg-slate-100 rounded"></div>
                                    <div className="h-4 w-12 bg-slate-100 rounded"></div>
                                    <div className="h-4 w-24 bg-slate-100 rounded"></div>
                                    <div className="h-4 w-24 bg-slate-100 rounded"></div>
                                    <div className="h-4 w-24 bg-slate-100 rounded"></div>
                                    <div className="h-8 w-8 bg-rose-100 rounded-lg ml-auto"></div>
                                </div>
                            ))}
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
    
    if (isError) return <ErrorState errorMessage={errorMessage} />;

    return (
        <div className="w-full space-y-6">
            {/* Header */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/70 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
                    {salespersonData.first_name} {salespersonData.last_name}
                </h1>
                {
                    user.publicMetadata.role == Roles.READ_ONLY ? null : (
                        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                            <EditSalesperson salespersonData={salespersonData} onUpdate={fetchSalespersonData} />
                            <DeleteAlert handleDelete={handleDelete} salespersonData={salespersonData} />
                            <PDFDownloadLink
                                document={<SaleTemplate salespersonData={salespersonData} />}
                                fileName={`Salesperson-Report-${salespersonData.first_name}-${salespersonData.last_name}.pdf`}
                                className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 h-10 px-4 py-2 transition-colors"
                                onClick={handleDownloadLog}
                            >
                                {({ loading }) => loading ? "Generating..." : "Download"}
                            </PDFDownloadLink>
                        </div>
                    )
                }

            </div>

            <div className="space-y-6">
                {/* Salesperson Details */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                    <h3 className="text-lg font-bold mb-5 text-slate-800">Salesperson Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
                        <DetailRow label="Email" value={salespersonData.email} />
                        <DetailRow label="Phone No." value={salespersonData.phone} />
                    </div>
                </div>

                {/* Sales Details with Date Filter */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-4">
                        <h3 className="text-lg font-bold text-slate-800">Sales Statistics</h3>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full sm:w-[260px] justify-start text-left font-normal rounded-xl border-slate-200">
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
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
                        {dateRange?.from && dateRange?.to && (
                            <>
                                <DetailRow label="Sales Count (Range)" value={rangeData.total_sales_no} />
                                <DetailRow label="Commission (Range)" value={`LKR ${rangeData.total_commission.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} />
                            </>
                        )}
                        <DetailRow label="Total Sales (Last Month)" value={salespersonData.total_sales_no_last_month || "0"} />
                        <DetailRow label="Commission (Last Month)" value={`LKR ${(salespersonData.total_commission_last_month || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`} />
                        <DetailRow label="Total Sales" value={salespersonData.total_sales_no || "0"} />
                        <DetailRow label="Total Commission" value={`LKR ${(salespersonData.total_commission || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`} />
                    </div>
                </div>

                {/* Sales Targets */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-4">
                        <h3 className="text-lg font-bold text-slate-800">Sales Targets</h3>
                        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full sm:w-[260px] justify-start text-left font-normal rounded-xl border-slate-200">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {targetDateRange.from && targetDateRange.to
                                            ? `${targetDateRange.from.toLocaleDateString()} - ${targetDateRange.to.toLocaleDateString()}`
                                            : "Pick a date range"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="range" selected={targetDateRange} onSelect={(range) => { if (range?.from && range?.to) { setTargetDateRange(range); fetchTargets(range); } }} numberOfMonths={1} />
                                </PopoverContent>
                            </Popover>
                            <AddTarget salespersonId={salespersonId} fetchTargets={fetchTargets} />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase border-b border-slate-100">
                                <tr>
                                    <th className="py-3 px-2">Month</th>
                                    <th className="py-3 px-2">Year</th>
                                    <th className="py-3 px-2">Target (LKR)</th>
                                    <th className="py-3 px-2">Sales (LKR)</th>
                                    <th className="py-3 px-2">Commission (LKR)</th>
                                    <th className="py-3 px-2 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {Array.isArray(targets) && targets.map((t) => (
                                    <tr key={t.id}>
                                        <td className="py-3 px-2">{t.month}</td>
                                        <td className="py-3 px-2">{t.year}</td>
                                        <td className="py-3 px-2">LKR {(t.target || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td className="py-3 px-2">LKR {(t.sale || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td className="py-3 px-2">LKR {(t.Commission || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td className="py-3 px-2 text-right">
                                            <Button variant="ghost" size="icon" className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg" onClick={() => handleDeleteSalesTarget(t.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Timestamps */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                    <div className="text-xs sm:text-sm text-slate-600 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-x-16">
                        <Timestamp label="Updated By" value={salespersonData.created_by} />
                        <Timestamp label="Created At" value={salespersonData.created_at} isDate />
                        <Timestamp label="Last Updated At" value={salespersonData.updated_at} isDate />
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

function Timestamp({ label, value, isDate }) {
    return (
        <div className="flex flex-col">
            <span className="uppercase tracking-wider text-[10px] text-slate-400 font-bold mb-1">{label}</span>
            <span className="font-semibold text-slate-700 text-sm">{value ? (isDate ? new Date(value).toLocaleString() : value) : "N/A"}</span>
        </div>
    );
}

export default SalespersonView;
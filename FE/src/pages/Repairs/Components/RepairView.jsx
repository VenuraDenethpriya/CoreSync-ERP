import { useNavigate, useParams } from "react-router";
import { useEffect, useState, useMemo } from "react";
import { DeleteAlert } from "./DeleteAlert";
import { toast } from "sonner";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { useAuth, useUser } from "@clerk/clerk-react";
import { ErrorState } from "@/components/Skeleton";
import { createAuditLog } from "@/api/settingApi";
import RepairTemplate from "./RepairPdf";
import { EditRepair } from "./EditRepair";
import { deleteRepair, featchRepairUsage, fetchRepairById } from "@/api/repair";
import { PaginationComponent } from "@/components/Pagination";
import { ChevronDown, ChevronUp, LockIcon } from "lucide-react";
import { Roles } from "@/const/const";
import { Button } from "@/components/ui/button";
import AddUsage from "@/pages/Approvals/Components/AddUsage";

function RepairView() {
    const { isLoaded, getToken } = useAuth();
    const { user } = useUser();
    const { repairId } = useParams();

    const [repairData, setRepairData] = useState({});
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [isUsageLoading, setIsUsageLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [total, setTotal] = useState(0);
    const [limitUsage, setLimitUsage] = useState(5);
    const [offsetUsage, setOffsetUsage] = useState(0);
    const [expandedUsageId, setExpandedUsageId] = useState(null);
    const [itemUsageData, setItemUsageData] = useState([]);

    const toggleUsageRow = (id) => {
        setExpandedUsageId(expandedUsageId === id ? null : id);
    };

    const fetchRepairData = async () => {
        try {
            const token = await getToken();
            const res = await fetchRepairById(token, repairId);
            setRepairData(res.data);
        } catch (error) {
            setIsError(true);
            setErrorMessage("Error fetching repair data: " + error.message);
            toast.error("Couldn't load repair data", { position: "bottom-right" });
        }
    };

    useEffect(() => {
        setIsLoading(true);
        fetchRepairData().finally(() => setIsLoading(false));
    }, [repairId, getToken]);

    const handleDelete = async () => {
        try {
            const token = await getToken();
            const response = await deleteRepair(token, repairId);
            if (response === true) {
                toast.success("Repair deleted successfully!", { position: "bottom-right" });
                navigate("/repairs");
            }
        } catch (error) {
            toast.error("Error deleting repair data!", { position: "bottom-right" });
        }
    };

    const handleDownloadLog = async () => {
        try {
            const token = await getToken();
            await createAuditLog(token, {
                action: "PDF Downloaded",
                status_code: 200,
                user: user.id,
                description: `${user.firstName} ${user.lastName} downloaded the repair Job no ${repairData?.job_no} report as a PDF file.`,
            });
        } catch (error) {
            console.error("Failed to log download action:", error);
        }
    };

    const fetchUsageData = async () => {
        if (!repairData?.repair_id) return;
        try {
            setIsUsageLoading(true);
            setExpandedUsageId(null);
            const token = await getToken();
            const response = await featchRepairUsage(token, { jobId: repairData.repair_id, limit: limitUsage, offset: offsetUsage });
            setItemUsageData(response?.data?.items || []);
            setTotal(response?.data?.total || 0);
        } catch (error) {
            console.error("Error fetching usage data:", error);
            setItemUsageData([]);
        } finally {
            setIsUsageLoading(false);
        }
    };

    useEffect(() => {
        if (repairData?.repair_id) fetchUsageData();
    }, [repairData, getToken, isLoaded, limitUsage, offsetUsage]);

    const groupedUsageItems = useMemo(() => {
        if (!itemUsageData || itemUsageData.length === 0) return [];
        const groups = {};
        const allItems = itemUsageData.flatMap(batch =>
            (batch.items || []).map(child => ({
                ...child,
                user_name: child.user_name || batch.user_name,
                inventory_id: batch.inventory_id || batch.id,
                inventory_code: batch.inventory_code,
                inventory_name: batch.inventory_name
            }))
        );

        allItems.forEach(item => {
            const key = item.inventory_id || "unknown";
            if (!groups[key]) {
                groups[key] = {
                    key_id: key,
                    display_name: item.inventory_name || item.inventory_code || "Unknown Item",
                    display_code: item.inventory_code,
                    total_usage: 0,
                    user_name: item.user_name,
                    last_updated: item.created_at,
                    details: []
                };
            }
            groups[key].total_usage += 1;
            groups[key].details.push(item);
            if (new Date(item.created_at) > new Date(groups[key].last_updated)) {
                groups[key].last_updated = item.created_at;
            }
        });
        return Object.values(groups);
    }, [itemUsageData]);

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
                    <div className="h-8 w-48 bg-slate-200 rounded-xl"></div>
                    <div className="flex flex-wrap items-center gap-2.5">
                        <div className="h-10 w-24 bg-slate-200 rounded-xl"></div>
                        <div className="h-10 w-24 bg-rose-100 rounded-xl"></div>
                        <div className="h-10 w-28 bg-slate-200 rounded-xl"></div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Repair Details Skeleton */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                        <div className="h-6 w-32 bg-slate-200 rounded-lg mb-5"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="flex justify-between items-center py-1.5">
                                    <div className="h-4 w-28 bg-slate-200 rounded"></div>
                                    <div className="h-4 w-40 bg-slate-100 rounded"></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Items Usage Skeleton */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                        <div className="flex justify-between items-center mb-5">
                            <div className="h-6 w-32 bg-slate-200 rounded-lg"></div>
                            <div className="h-10 w-24 bg-slate-200 rounded-xl"></div>
                        </div>
                        <div className="grid sm:grid-cols-5 grid-cols-1 gap-4 border-b border-slate-100 pb-2 pl-2">
                            <div className="h-3 w-20 bg-slate-200 rounded"></div>
                            <div className="h-3 w-24 bg-slate-200 rounded"></div>
                            <div className="h-3 w-20 bg-slate-200 rounded"></div>
                            <div className="h-3 w-16 bg-slate-200 rounded"></div>
                            <div className="h-3 w-24 bg-slate-200 rounded"></div>
                        </div>
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="grid sm:grid-cols-5 grid-cols-1 gap-4 py-3 pl-2 border-b border-slate-100 items-center">
                                <div className="h-4 w-24 bg-slate-200 rounded"></div>
                                <div className="h-4 w-32 bg-slate-100 rounded"></div>
                                <div className="h-4 w-12 bg-slate-200 rounded"></div>
                                <div className="h-4 w-20 bg-slate-100 rounded"></div>
                                <div className="h-4 w-28 bg-slate-100 rounded"></div>
                            </div>
                        ))}
                        <div className="flex justify-between items-center pt-4 mt-2">
                            <div className="h-4 w-32 bg-slate-200 rounded"></div>
                            <div className="h-8 w-64 bg-slate-100 rounded-lg"></div>
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
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">{repairData.job_no}</h1>
                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    {
                        user.publicMetadata.role == Roles.READ_ONLY ? null : (
                            <>
                                <EditRepair repairData={repairData} onUpdate={fetchRepairData} />
                                <DeleteAlert handleDelete={handleDelete} repairData={repairData} />
                                <PDFDownloadLink
                                    document={<RepairTemplate repairData={repairData} />}
                                    fileName={`${repairData.job_no}.pdf`}
                                    className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 h-10 px-4 py-2 transition-colors"
                                    onClick={handleDownloadLog}
                                >
                                    {({ loading }) => loading ? "Generating..." : "Download"}
                                </PDFDownloadLink>
                            </>
                        )
                    }

                </div>
            </div>

            <div className="space-y-6">
                {/* Overview */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                    <h3 className="text-lg font-bold mb-5 text-slate-800">Repair Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                        <DetailRow label="Order NO" value={repairData.order_no} />
                        <DetailRow label="Price" value={`LKR ${Number(repairData.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`} />
                        <DetailRow label="Due Date" value={repairData.due_date ? new Date(repairData.due_date).toLocaleString() : undefined} />
                        <DetailRow label="Customer Name" value={repairData.customer_name} />
                        <DetailRow label="Customer Phone No." value={repairData.customer_phone} />
                        <DetailRow label="Assignee" value={repairData.asignee} />
                        <div className="md:col-span-2">
                            <DetailRow label="Description" value={repairData.description} />
                        </div>
                    </div>
                </div>

                {/* Items Usage */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                    <div className="flex gap-6 mb-5 items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-800">Items Usage</h3>
                        <AddUsage
                            type="job"
                            jobData={repairData}
                            onUpdate={fetchUsageData}
                        />
                    </div>

                    {isUsageLoading ? (
                        <div className="space-y-2 animate-pulse">
                            {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-slate-100 rounded-xl w-full"></div>)}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="grid sm:grid-cols-5 grid-cols-1 text-xs text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 pb-2 pl-2">
                                <span>Item Code</span>
                                <span>Item Name</span>
                                <span>Total Usage</span>
                                <span>User</span>
                                <span>Time Stamp</span>
                            </div>

                            {groupedUsageItems.length === 0 && <div className="text-sm text-slate-400 py-4 text-center">No usage history found.</div>}

                            {groupedUsageItems.map((group, index) => (
                                <div key={`${group.key_id}-${index}`} className="border-b border-slate-100 last:border-0">
                                    <div
                                        className={`grid sm:grid-cols-5 grid-cols-1 text-xs text-slate-700 font-medium py-3 pl-2 items-center cursor-pointer transition-colors hover:bg-slate-50/80 rounded-xl ${expandedUsageId === group.key_id ? 'bg-blue-50/50' : ''}`}
                                        onClick={() => toggleUsageRow(group.key_id)}
                                    >
                                        <span>{group.display_code}</span>
                                        <span>{group.display_name}</span>
                                        <span className="font-bold text-blue-600">{group.total_usage}</span>
                                        <span>{group.user_name}</span>
                                        <span className="flex justify-between items-center w-full pr-4">
                                            {group.last_updated ? new Date(group.last_updated).toLocaleString() : "N/A"}
                                            <div className="p-1 rounded-full hover:bg-slate-200 text-slate-400">
                                                {expandedUsageId === group.key_id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </div>
                                        </span>
                                    </div>

                                    {expandedUsageId === group.key_id && (
                                        <div className="bg-slate-50 p-4 border-t border-slate-100 rounded-xl my-2">
                                            <p className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Used Item Codes ({group.details?.length || 0})</p>
                                            <div className="max-h-[100px] overflow-y-auto pr-2 custom-scrollbar">
                                                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                                    {group.details?.map((subItem, idx) => (
                                                        <div key={`${subItem.usage_id}-${idx}`} className="bg-white border border-slate-200/70 rounded-xl px-2.5 py-1.5 text-xs font-mono text-slate-700 text-center shadow-sm h-9 flex items-center justify-center">
                                                            {subItem.item_code || "No Code"}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            <div className="flex flex-col sm:flex-row items-center justify-between py-4 mt-2 w-full gap-4 border-t border-slate-100">
                                <div className="text-sm text-slate-500 w-full sm:w-auto text-center sm:text-left whitespace-nowrap">
                                    Total Records: {total}
                                </div>
                                <div className="w-full sm:w-auto flex justify-center sm:justify-end shrink-0 overflow-x-auto">
                                    <PaginationComponent total={total} limit={limitUsage} offset={offsetUsage} setOffset={setOffsetUsage} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Timestamps */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                    <div className="text-xs sm:text-sm text-slate-600 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-x-16">
                        <Timestamp label="Updated By" value={repairData.created_by} />
                        <Timestamp label="Created At" value={repairData.created_at} isDate />
                        <Timestamp label="Last Updated At" value={repairData.updated_at} isDate />
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

export default RepairView;
import { Separator } from "@/components/ui/separator";
import { useNavigate, useParams } from "react-router";
import React, { useEffect, useState, useRef, useMemo } from "react";
import { DeleteAlert } from "./DeleteAlert";
import { toast } from "sonner";
import BreadCrumbs from "@/components/ui/BreadCrumbs";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { useAuth, useUser } from "@clerk/clerk-react";
import { ErrorState, SkeletonDetailRow, SkeletonUsageRow3 } from "@/components/Skeleton";
import { deleteSale, getSaleById } from "@/api/saleApi";
import { createAuditLog } from "@/api/settingApi";
import RepairTemplate from "./RepairPdf";
import { EditRepair } from "./EditRepair";
import { deleteRepair, featchRepairUsage, fetchRepairById } from "@/api/repair";
import { PaginationComponent } from "@/components/Pagination";
import { ChevronDown, ChevronUp } from "lucide-react";

function RepairView() {
    const { isLoaded, getToken } = useAuth();
    const { user } = useUser();
    // const { getToken } = useAuth();

    const { repairId } = useParams();
    console.log("repair", repairId)


    const breadcrumbs = [
        { name: "Dashboard", link: "/" },
        { name: "Repairs", link: "/repairs" },
        { name: " ", link: `/repairs/${repairId}` },
    ];

    const [repairData, setRepairData] = useState({});
    const navigate = useNavigate();
    const pdfRef = useRef();

    const [isLoading, setIsLoading] = useState(true);
    const [isUsageLoading, setIsUsageLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [total, setTotal] = useState(0);
    const [limitUsage, setLimitUsage] = useState(5)
    const [offsetUsage, setOffsetUsage] = useState(0)
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
            console.error("Delete Error:", error);
            toast.error("Error deleting repair data! Please try again.", { position: "bottom-right" });
        }
    };

    const handleDownloadLog = async () => {
        try {
            const token = await getToken();
            await createAuditLog(token, {
                action: "PDF Downloaded",
                status_code: 200,
                user: user.id,
                description: `${user.firstName} ${user.lastName} downloaded the repair JOb no ${repairData?.job_no} report as a PDF file.`,
            });
        } catch (error) {
            console.error("Failed to log download action:", error);
        }
    };

    const fetchUsageData = async () => {
        if (!repairData) return;
        try {
            setIsUsageLoading(true);
            setExpandedUsageId(null);

            const token = await getToken();
            const response = await featchRepairUsage(token, { jobId: repairData.repair_id, limit: limitUsage, offset: offsetUsage });

            const items = response?.data?.items || [];
            const totalCount = response?.data?.total || 0;

            setItemUsageData(items);
            setTotal(totalCount);
        } catch (error) {
            console.error("Error fetching usage data:", error);
            setItemUsageData([]);
        } finally {
            setIsUsageLoading(false);
        }
    };

    useEffect(() => {
        fetchUsageData();
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
                    <h1 className="sm:text-4xl text-2xl font-extrabold text-gray-800">{repairData.job_no}</h1>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                        <EditRepair repairData={repairData} onUpdate={fetchRepairData} />
                        <DeleteAlert handleDelete={handleDelete} repairData={repairData} />
                        <PDFDownloadLink
                            document={<RepairTemplate repairData={repairData} />}
                            fileName={`${repairData.job_no}.pdf`}
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
                    <h3 className="text-xl font-bold mb-5 text-gray-700">Repair Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                        <DetailRow label="Order NO" value={repairData.order_no} />
                        <DetailRow
                            label="Price"
                            value={`LKR ${(repairData.price || 0).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}`}
                        />
                        <DetailRow
                            label="Due Date"
                            value={new Date(repairData.due_date).toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                timeZone: 'Asia/Colombo'
                            })}
                        />
                        <DetailRow label="Customer Name" value={repairData.customer_name} />
                        <DetailRow label="Customer Phone No." value={repairData.customer_phone} />
                        <DetailRow label="Description" value={repairData.description} />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                    <div className="flex gap-6 mb-5 items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-700">Items Usage</h3>
                        {/* <AddUsage
                                                type="order"
                                                orderData={orderData}
                                                onUpdate={fetchUsageData}
                                            /> */}
                    </div>

                    {isUsageLoading ? (
                        <div className="space-y-2 animate-pulse">
                            {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-gray-100 rounded w-full"></div>)}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {/* Table Header */}
                            <div className="grid sm:grid-cols-5 grid-cols-1 text-xs text-gray-500 font-semibold border-b pb-1 pl-2">
                                <span>Item Code</span>
                                <span>Item Name</span>
                                <span>Total Usage</span>
                                <span>User</span>
                                <span>Time Stamp</span>
                            </div>

                            {groupedUsageItems.length === 0 && <div className="text-sm text-gray-500 py-2">No usage history found.</div>}

                            {groupedUsageItems.map((group, index) => (
                                <div key={`${group.key_id}-${index}`} className="border-b last:border-0">

                                    {/* Parent Row (Clickable) */}
                                    <div
                                        className={`grid sm:grid-cols-5 grid-cols-1 text-xs text-gray-600 font-medium py-3 pl-2 items-center cursor-pointer transition-colors hover:bg-gray-50 ${expandedUsageId === group.key_id ? 'bg-blue-50/50' : ''}`}
                                        onClick={() => toggleUsageRow(group.key_id)}
                                    >
                                        <span>{group.display_code}</span>
                                        <span>{group.display_name}</span>


                                        <span className="font-bold text-blue-700">{group.total_usage}</span>
                                        <span>{group.user_name}</span>

                                        <span className="flex justify-between items-center w-full pr-4">
                                            {group.last_updated ? new Date(group.last_updated).toLocaleString() : "N/A"}

                                            <div className="p-1 rounded-full hover:bg-gray-200 text-gray-400">
                                                {expandedUsageId === group.key_id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </div>
                                        </span>
                                    </div>

                                    {/* Expanded Detail Rows (GRID VIEW with SCROLL) */}
                                    {expandedUsageId === group.key_id && (
                                        <div className="bg-gray-50 p-4 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
                                            <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                                                Used Item Codes ({group.details?.length || 0})
                                            </p>

                                            {/* SCROLLABLE CONTAINER: Max Height ~2 rows (~90px), Scroll Y enabled */}
                                            <div className="max-h-[100px] overflow-y-auto pr-2 custom-scrollbar">
                                                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                                    {group.details?.map((subItem, idx) => (
                                                        <div
                                                            key={`${subItem.usage_id}-${idx}`}
                                                            className="bg-white border border-gray-200 rounded px-2 py-1 flex items-center justify-between shadow-sm group h-8"
                                                        >
                                                            <span className="text-xs font-mono text-gray-700 font-medium truncate w-full" title={subItem.item_code}>
                                                                {subItem.item_code || "No Code"}
                                                            </span>

                                                            {/* {user?.publicMetadata.role !== Roles.WAREHOUSE_STAFF && (
                                                                                    <Trash2
                                                                                        size={14}
                                                                                        className="cursor-pointer text-red-400 hover:text-red-600 flex-shrink-0 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            handleDeleteUsage(subItem.usage_id, subItem.item_id, 1);
                                                                                        }}
                                                                                        title="Remove this specific item code"
                                                                                    />
                                                                                )} */}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between sm:space-x-2 py-4 mt-2">
                        <div className="text-sm text-muted-foreground mb-2 sm:mb-0">
                            Total Records: {total}
                        </div>
                        <div className="flex justify-center">
                            <PaginationComponent total={total} limit={limitUsage} offset={offsetUsage} setOffset={setOffsetUsage} />
                        </div>
                    </div>
                </div>


                {/* Timestamps */}
                <div className="flex justify-end mt-8">
                    <div className="bg-gray-100 rounded-xl p-5 text-xs sm:text-sm text-gray-600 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-x-16">
                        <Timestamp label="Updated By" value={repairData.created_by} />
                        <Timestamp label="Created At" value={repairData.created_at} isDate />
                        <Timestamp label="Last Updated At" value={repairData.updated_at} isDate />
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

export default RepairView;

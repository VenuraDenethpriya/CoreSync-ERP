import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth, useUser } from "@clerk/clerk-react";
import { ErrorState } from "@/components/Skeleton"; 
import { Roles } from "@/const/const";
import { DeleteAlert } from "./SiteDeleteAlert";
import { deleteSite, fetchSiteById } from "@/api/siteApi";
import { Badge } from "@/components/ui/badge";
import { EditSite } from "./EditSite";

function SitsView() {
    const { getToken } = useAuth();
    const { user } = useUser();
    const { siteId } = useParams();
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
        { name: "Site", link: "/sites" },
        { name: " ", link: `/sites/${siteId}` },
    ];

    const [siteData, setSiteData] = useState({});

    const handleSiteUpdate = (updatedFields) => {
        setSiteData((prev) => ({
            ...prev,
            ...updatedFields
        }));
    };

    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const fetchSiteData = async () => {
            try {
                setIsLoading(true);
                const token = await getToken();
                const response = await fetchSiteById(token, siteId);
                setSiteData(response.data);
            } catch (error) {
                setIsError(true);
                setErrorMessage("Error fetching site data: " + error.message);
                console.error("Error fetching site data:", error);
            } finally {
                setIsLoading(false);
                setIsError(false);
            }
        };
        fetchSiteData();
    }, [getToken, siteId]);

    const handleDelete = async () => {
        try {
            const token = await getToken();
            await deleteSite(token, siteId);
            toast.error("Site deleted successfully!", { position: "bottom-right" });
            navigate("/approvals");
        } catch (error) {
            console.error("Error deleting product:", error);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "Pending":
                return <Badge className="rounded-full bg-rose-100 text-rose-700 hover:bg-rose-100 font-bold text-xs px-3 py-1 border-0">Pending</Badge>;
            case "Balancing":
                return <Badge className="rounded-full bg-slate-100 text-slate-600 hover:bg-slate-100 font-bold text-xs px-3 py-1 border-0">Balancing</Badge>;
            case "Delivered":
                return <Badge className="rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-100 font-bold text-xs px-3 py-1 border-0">Delivered</Badge>;
            case "Completed":
                return <Badge className="rounded-full bg-blue-100 text-blue-700 hover:bg-blue-100 font-bold text-xs px-3 py-1 border-0">Completed</Badge>;
            case "Drafted":
                return <Badge className="rounded-full bg-amber-100 text-amber-700 hover:bg-amber-100 font-bold text-xs px-3 py-1 border-0">Drafted</Badge>;
            default:
                return <Badge className="rounded-full bg-slate-100 text-slate-600 hover:bg-slate-100 font-bold text-xs px-3 py-1 border-0">{status || "No Status"}</Badge>;
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
                        </div>
                    )}
                </div>

                {/* Site Details Card Skeleton */}
                <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 border border-slate-200/70">
                    <div className="h-6 w-32 bg-slate-200 rounded-lg mb-6"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={`site-skel-${i}`} className="flex flex-col">
                                <div className="h-3 w-24 bg-slate-200 rounded mb-2.5"></div>
                                <div className="h-5 w-48 bg-slate-100 rounded"></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Product Details Card Skeleton */}
                <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 border border-slate-200/70">
                    <div className="h-6 w-40 bg-slate-200 rounded-lg mb-6"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={`prod-skel-${i}`} className="flex flex-col">
                                <div className="h-3 w-28 bg-slate-200 rounded mb-2.5"></div>
                                <div className="h-5 w-56 bg-slate-100 rounded"></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Timestamps Skeleton */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-x-16">
                        <div className="flex flex-col">
                            <div className="h-3 w-20 bg-slate-200 rounded mb-2.5"></div>
                            <div className="h-4 w-36 bg-slate-100 rounded"></div>
                        </div>
                        <div className="flex flex-col">
                            <div className="h-3 w-24 bg-slate-200 rounded mb-2.5"></div>
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
                        {siteData?.order_no || "Site Details"}
                    </h1>
                    {getStatusBadge(siteData?.status)}
                </div>

                {!isMobile && (
                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                        {user?.publicMetadata?.role !== Roles.INVENTORY_MANAGER && user?.publicMetadata?.role !== Roles.FINANCE_HEAD && (
                            <>
                                <EditSite siteData={siteData} onUpdate={handleSiteUpdate} />
                                <DeleteAlert handleDelete={handleDelete} siteData={siteData} />
                            </>
                        )}
                    </div>
                )}
            </div>

            <div className="space-y-6">
                
                {/* Site Details Card */}
                <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 border border-slate-200/70">
                    <h3 className="text-lg font-bold mb-5 text-slate-800">Site Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12">
                        <DetailRow label="Order No" value={siteData?.order_no} />
                        <DetailRow
                            label="Date/Time"
                            value={siteData?.date ? `${new Date(siteData.date).toLocaleDateString()} (${siteData.start_time} - ${siteData.end_time})` : undefined}
                        />
                        <DetailRow label="Assignees" value={siteData?.assginee?.join(", ")} />
                        <DetailRow label="Location" value={siteData?.location} />
                    </div>
                </div>

                {/* Product Details Card */}
                <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 border border-slate-200/70">
                    <h3 className="text-lg font-bold mb-5 text-slate-800">Product Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12">
                        <DetailRow label="Capacity" value={siteData?.capacity ? `${siteData.capacity} kW` : undefined} />
                        <DetailRow label="Panel Type" value={siteData?.panel_type} />
                        <DetailRow label="Inverter" value={siteData?.inverter} />
                        <DetailRow label="Description" value={siteData?.description} />
                        <DetailRow label="Solar Type" value={siteData?.solar_type} />
                    </div>
                </div>

                {/* Timestamps */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                    <div className="text-xs sm:text-sm text-slate-600 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-x-16">
                        <Timestamp label="Created At" value={siteData?.created_at} />
                        <Timestamp label="Last Updated At" value={siteData?.updated_at} />
                    </div>
                </div>

            </div>
        </div>
    );
}

function DetailRow({ label, value }) {
    return (
        <div className="flex flex-col py-1.5">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{label}</span>
            <span className="text-sm text-slate-800 font-semibold">{value || <span className="text-slate-300 italic font-normal">Not provided</span>}</span>
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

export default SitsView;
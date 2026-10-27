import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router";
import { useEffect, useState, useRef } from "react";
import { deleteProduct, fetchProductById } from "@/api/productApi";
import { DeleteAlert } from "./DeleteAlert";
import { toast } from "sonner";
import EVTemplate from "./ServicePdf";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Roles } from "@/const/const";
import { ErrorState } from "@/components/Skeleton";
import { EditEV } from "./EditEV";
import { createAuditLog } from "@/api/settingApi";
import { LockIcon } from "lucide-react";

function EVView({ initialData }) {
    const { getToken } = useAuth();
    const { user } = useUser();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const { productId } = useParams();


    const [productData, setProductData] = useState(initialData || {});


    const [isLoading, setIsLoading] = useState(!initialData || Object.keys(initialData).length === 0);

    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();
    const pdfRef = useRef();

    const handleProductUpdate = (updatedFields) => {
        setProductData((prev) => ({
            ...prev,
            ...updatedFields
        }));
    };

    useEffect(() => {
        if (initialData?.id) {
            setProductData(initialData);
            setIsLoading(false);
            return;
        }

        const fetchProductData = async () => {
            try {
                setIsLoading(true);
                const token = await getToken();
                const response = await fetchProductById(token, productId);
                setProductData(response.data);
            } catch (error) {
                setIsError(true);
                setErrorMessage("Error fetching product data: " + error.message);
                console.error("Error fetching product data:", error);
            } finally {
                setIsLoading(false);
                setIsError(false);
            }
        };

        if (productId) {
            fetchProductData();
        }
    }, [initialData?.id, productId, getToken]);

    const handleDelete = async () => {
        try {
            const token = await getToken();
            await deleteProduct(token, productId);
            toast.success("E-Vehicle product deleted successfully!", { position: "bottom-right" });
            navigate("/products");
        } catch (error) {
            console.error("Error deleting product:", error);
            toast.error("Error deleting product!");
        }
    };

    const handleDownloadLog = async () => {
        try {
            const token = await getToken();
            await createAuditLog(token, {
                action: "PDF Downloaded",
                status_code: 200,
                user: user.id,
                description: `${user.firstName} ${user.lastName} downloaded the ${productData?.name} report as a PDF file.`,
            });
        } catch (error) {
            console.error("Failed to log download action:", error);
        }
    };

    if (user?.publicMetadata?.role === Roles.WAREHOUSE_STAFF || user?.publicMetadata?.role === Roles.SALES_TEAM || user?.publicMetadata?.role === Roles.HR_HEAD) {
        return (
            <div className="flex items-center justify-center min-h-[70vh] w-full px-4">
                <div className="bg-white shadow-sm rounded-2xl p-8 max-w-md text-center border border-red-100">
                    <div className="flex flex-col items-center justify-center gap-3">
                        <LockIcon className="w-12 h-12 text-red-500" />
                        <h1 className="text-xl font-bold text-gray-800">Access Denied</h1>
                        <p className="text-sm text-gray-500">
                            You are not authorized to access this page. Please contact your administrator if you believe this is a mistake.
                        </p>
                        <Button
                            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl"
                            onClick={() => navigate("/")}
                        >
                            Go to Dashboard
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="w-full space-y-6">
                {/* Header Skeleton */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/70 flex flex-col sm:flex-row justify-between items-center gap-4 animate-pulse">
                    <div className="h-8 w-64 bg-slate-200 rounded-xl"></div>
                    <div className="flex flex-wrap items-center gap-2.5">
                        <div className="h-10 w-24 bg-slate-200 rounded-xl"></div>
                        <div className="h-10 w-24 bg-rose-100 rounded-xl"></div>
                        <div className="h-10 w-28 bg-slate-200 rounded-xl"></div>
                    </div>
                </div>

                {/* Primary Details Skeleton */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70 animate-pulse">
                    <div className="h-6 w-40 bg-slate-200 rounded-lg mb-5"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
                        <div className="flex justify-between items-center py-1.5">
                            <div className="h-4 w-28 bg-slate-200 rounded"></div>
                            <div className="h-4 w-32 bg-slate-100 rounded"></div>
                        </div>
                        <div className="flex justify-between items-center py-1.5">
                            <div className="h-4 w-24 bg-slate-200 rounded"></div>
                            <div className="h-4 w-28 bg-slate-100 rounded"></div>
                        </div>
                    </div>
                </div>

                {/* Product Details Skeleton (Tailored for EV: 3 rows left, 4 rows right) */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70 animate-pulse">
                    <div className="h-6 w-40 bg-slate-200 rounded-lg mb-5"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
                        <div className="space-y-3">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex justify-between items-center py-1.5">
                                    <div className="h-4 w-24 bg-slate-200 rounded"></div>
                                    <div className="h-4 w-32 bg-slate-100 rounded"></div>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-3">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="flex justify-between items-center py-1.5">
                                    <div className="h-4 w-28 bg-slate-200 rounded"></div>
                                    <div className="h-4 w-24 bg-slate-100 rounded"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Timestamps Skeleton */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70 animate-pulse">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-x-16">
                        <div className="space-y-2">
                            <div className="h-3 w-20 bg-slate-200 rounded"></div>
                            <div className="h-4 w-36 bg-slate-100 rounded"></div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-3 w-24 bg-slate-200 rounded"></div>
                            <div className="h-4 w-36 bg-slate-100 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <ErrorState errorMessage={errorMessage} />
        )
    }

    return (
        <div className="w-full space-y-6">
            {/* Header */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/70 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">{productData.name}</h1>
                {
                    isMobile ? null : <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                        {
                            user.publicMetadata.role == Roles.READ_ONLY ? null : <EditEV productData={productData} onUpdate={handleProductUpdate} />
                        }

                        {
                            user.publicMetadata.role == Roles.INVENTORY_MANAGER || user.publicMetadata.role == Roles.READ_ONLY ? null : <DeleteAlert handleDelete={handleDelete} productData={productData} />
                        }

                        {
                            user.publicMetadata.role == Roles.INVENTORY_MANAGER || user.publicMetadata.role == Roles.READ_ONLY ? null : <PDFDownloadLink
                                document={<EVTemplate productData={productData} />}
                                fileName={`E-Vehicle-Report-${productData.name}.pdf`}
                                className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 h-10 px-4 py-2 transition-colors"
                                onClick={handleDownloadLog}
                            >
                                {({ loading }) =>
                                    loading ? "Generating..." : "Download"
                                }
                            </PDFDownloadLink>
                        }
                    </div>
                }
            </div>

            <div className="space-y-6">
                {/* Primary Details */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                    <h3 className="text-lg font-bold mb-5 text-slate-800">Primary Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
                        <DetailRow label="Product Category" value={productData.category} />
                        <DetailRow label="Base Price" value={`LKR ${Number(productData.base_price || 0).toLocaleString()}`} />
                    </div>
                </div>

                {/* Product Details */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                    <h3 className="text-lg font-bold mb-5 text-slate-800">Product Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
                        <div className="space-y-3">
                            <DetailRow label="Vehicle Type" value={productData.type} />
                            <DetailRow label="Cell Type" value={productData.cell_type} />
                            <DetailRow label="BMS Type" value={productData.bms_type} />
                        </div>
                        <div className="space-y-3">
                            <DetailRow label="Battery Capacity" value={productData.capacity ? productData.capacity + " Ah" : undefined} />
                            <DetailRow label="Battery Voltage" value={productData.voltage ? productData.voltage + " V" : undefined} />
                            <DetailRow label="Is Active" value={productData.is_active ? "Yes" : "No"} />
                            <DetailRow label="Specification" value={productData.Specifications} />
                        </div>
                    </div>
                </div>

                {/* Timestamps */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                    <div className="text-xs sm:text-sm text-slate-600 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-x-16">
                        <Timestamp label="Created At" value={productData.created_at} />
                        <Timestamp label="Last Updated At" value={productData.updated_at} />
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

function Timestamp({ label, value }) {
    return (
        <div className="flex flex-col">
            <span className="uppercase tracking-wider text-[10px] text-slate-400 font-bold mb-1">{label}</span>
            <span className="font-semibold text-slate-700 text-sm">{value ? new Date(value).toLocaleString() : "N/A"}</span>
        </div>
    );
}

export default EVView;
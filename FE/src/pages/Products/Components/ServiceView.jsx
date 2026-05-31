import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { EditBatteryPack } from "./EditBatteryPack";
import { useNavigate, useParams } from "react-router";
import { useEffect, useState, useRef } from "react";
import { deleteProduct, fetchProductById } from "@/api/productApi";
import { DeleteAlert } from "./DeleteAlert";
import { toast } from "sonner";
import BreadCrumbs from "@/components/ui/BreadCrumbs";
import BatteryPackDetailsTemplate from "./BatteryPackPdf";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Roles } from "@/const/const";
import { ErrorState, SkeletonDetailRow } from "@/components/Skeleton";
import { EditEV } from "./EditEV";
import EVTemplate from "./ServicePdf";
import { EditService } from "./EditService";
import ServiceTemplate from "./ServicePdf";
import { createAuditLog } from "@/api/settingApi";

function ServiceView() {
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
    const breadcrumbs = [
        { name: "Dashboard", link: "/" },
        { name: "Products", link: "/products" },
        { name: " ", link: `/products/${productId}` },
    ];

    const [productData, setProductData] = useState({});

    const handleProductUpdate = (updatedFields) => {
        setProductData((prev) => ({
            ...prev,
            ...updatedFields
        }));
    };

    const navigate = useNavigate();
    const pdfRef = useRef();
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
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
        fetchProductData();
    }, [productId]);


    const handleDelete = async () => {
        try {
            const token = await getToken();
            await deleteProduct(token, productId);
            toast.error("Service deleted successfully!", { position: "bottom-right" });
            navigate("/products");
        } catch (error) {
            console.error("Error deleting product:", error);
        }
    };

    const handleDownloadLog = async () => {
        try {
            const token = await getToken();
            await createAuditLog(token, {
                action: "PDF Downloaded",
                status_code: 200,
                user: user.id,
                description: `${user.firstName} ${user.lastName} downloaded the  ${productData?.name} report as a PDF file.`,
            });
        } catch (error) {
            console.error("Failed to log download action:", error);
        }
    };

    if (isLoading) {
        return (
            <>
                {/* Breadcrumbs Skeleton */}
                <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>

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
            {isMobile ? (
                null
            ) : <BreadCrumbs breadcrumbs={breadcrumbs} />}
            <div className="sm:p-8 p-4 space-y-6 bg-gray-50 min-h-screen">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <h1 className="sm:text-4xl text-2xl font-extrabold text-gray-800">{productData.name}</h1>
                    {
                        isMobile ? null : <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                            <EditService productData={productData} onUpdate={handleProductUpdate} />
                            
                               <DeleteAlert handleDelete={handleDelete} productData={productData} />
                          

                            <PDFDownloadLink
                                document={<ServiceTemplate productData={productData} />}
                                fileName={`Service-Report-${productData.name}.pdf`}
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
                    }

                </div>

                <div className="space-y-4 sm:pl-6">
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-700">Overview</h2>
                        <Separator className="my-4 bg-gray-300" />
                    </div>

                    {/* Primary Details */}
                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                        <h3 className="text-xl font-bold mb-5 text-gray-700">Primary Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                            <DetailRow label="Product Category" value={productData.category} />
                            <DetailRow label="Base Price" value={`LKR ${Number(productData.base_price).toLocaleString()}`} />
                        </div>
                    </div>

                    {/* Product Details */}
                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                        <h3 className="text-xl font-bold mb-5 text-gray-700">Product Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                            <div className="space-y-2">
                                <DetailRow label="Specification" value={productData.Specifications} />
                            </div>
                            <div className="space-y-2">
                                <DetailRow label="Is Active" value={productData.is_active ? "Yes" : "No"} />
                            </div>
                        </div>
                    </div>


                    {/* Timestamps */}
                    <div className="flex justify-end mt-8">
                        <div className="bg-gray-100 rounded-xl p-5 text-xs sm:text-sm text-gray-600 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-x-16">
                            <Timestamp label="Created At" value={productData.created_at} />
                            <Timestamp label="Last Updated At" value={productData.updated_at} />
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

function Timestamp({ label, value }) {
    return (
        <div className="flex flex-col">
            <span className="uppercase tracking-wide text-[10px] text-gray-500 font-semibold mb-1">{label}</span>
            <span className="font-medium text-gray-800 text-sm">{value ? new Date(value).toLocaleString() : "N/A"}</span>
        </div>
    );
}

export default ServiceView;

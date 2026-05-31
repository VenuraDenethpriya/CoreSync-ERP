import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { deleteProduct, fetchProductById } from "@/api/productApi";
import { toast } from "sonner";
import { EditSolar } from "./EditSolar";
import { SolarDeleteAlert } from "./SolarDeleteAlert";
import BreadCrumbs from "@/components/ui/BreadCrumbs";
import { PDFDownloadLink } from "@react-pdf/renderer";
import SolarDetailsTemplate from "./SolarPdf";

function SolarQuoteView() {
    const { productId } = useParams();

    const breadcrumbs = [
        { name: "Dashboard", link: "/" },
        { name: "Products", link: "/products" },
        { name: " ", link: `/products/${productId}` },
    ];

    const [productData, setProductData] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProductData = async () => {
            try {
                const response = await fetchProductById(productId);
                setProductData(response.data);
            } catch (error) {
                console.error("Error fetching product data:", error);
            }
        };
        fetchProductData();
    }, [productId]);

    const handleDelete = async () => {
        try {
            await deleteProduct(productId);
            toast.error("Solar product deleted successfully!", { position: "bottom-right" });
            navigate("/products");
        } catch (error) {
            console.error("Error deleting product:", error);
        }
    };

    return (
        <>
            <BreadCrumbs breadcrumbs={breadcrumbs} />
            <div className="p-1  sm:p-8 space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <h1 className="text-2xl sm:text-3xl font-bold break-words">{productData.name}</h1>
                    <div className="flex gap-2 sm:gap-3">
                        <EditSolar productData={productData} />
                        <SolarDeleteAlert handleDelete={handleDelete} productData={productData} />
                        <PDFDownloadLink
                            document={<SolarDetailsTemplate productData={productData} />}
                            fileName={`Battery-Pack-Report-${productData.name}.pdf`}
                        >
                            {({ blob, url, loading, error }) => (
                                <Button
                                    className="border-2 border-blue-950 hover:bg-blue-950 hover:text-white transition-all ease-in"
                                    variant="outline"
                                    disabled={loading}
                                >
                                    {loading ? 'Generating...' : 'Download'}
                                </Button>
                            )}
                        </PDFDownloadLink>
                    </div>
                </div>

                <div>
                    <h2 className="text-lg font-semibold">Overview</h2>
                    <Separator className="my-2" />
                </div>

                {/* Primary Details */}
                <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
                    <h3 className="text-md font-bold mb-4">Primary Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <DetailRow label="Product Category" value={productData.category} />
                        <DetailRow label="Base Price" value={`Rs. ${productData.base_price}`} />
                    </div>
                </div>

                {/* Product Details */}
                <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
                    <h3 className="text-md font-bold mb-4">Product Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-3">
                            <DetailRow label="Inverter" value={productData.Inverter} />
                            <DetailRow label="Capacity" value={`${productData.capacity} kW`} />
                            <DetailRow label="Solar Panel" value={productData.PanelType} />
                        </div>
                        <div className="space-y-3">
                            <DetailRow label="Is Active" value={productData.is_active ? "Yes" : "No"} />
                            <DetailRow label="Specification" value={productData.Specifications} />
                        </div>
                    </div>
                </div>

                {/* Timestamps */}
                <div className="flex justify-center sm:justify-end">
                    <div className="bg-gray-50 rounded-xl p-4 text-xs sm:text-sm text-gray-600 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-x-12 w-full sm:w-auto">
                        <Timestamp label="Created At" value={productData.created_at} />
                        <Timestamp label="Updated At" value={productData.updated_at} />
                    </div>
                </div>
            </div>
        </>
    );
}

function DetailRow({ label, value }) {
    return (
        <div className="flex flex-col sm:flex-row justify-between gap-1 sm:gap-2 items-start sm:items-center break-all">
            <span className="text-gray-600">{label}</span>
            <span className="font-medium text-gray-900">{value || "-"}</span>
        </div>
    );
}

function Timestamp({ label, value }) {
    return (
        <div className="flex flex-col">
            <span className="uppercase tracking-wide text-[10px] text-gray-500 font-semibold">{label}</span>
            <span className="font-medium text-gray-800">{value ? new Date(value).toLocaleString() : "-"}</span>
        </div>
    );
}

export default SolarQuoteView;

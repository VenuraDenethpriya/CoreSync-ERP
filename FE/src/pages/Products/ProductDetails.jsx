import { useParams } from "react-router-dom";
import BattryPackView from "./Components/BatteryPackView";
import SolarView from "./Components/SolarView";
import { useEffect, useState } from "react";
import { fetchProductById } from "@/api/productApi";
import OtherView from "./Components/OtherView";
import { useAuth } from "@clerk/clerk-react";
import { ErrorState, SkeletonDetailRow } from "@/components/Skeleton";
import { Separator } from "@/components/ui/separator";
import EVView from "./Components/EVView";
import ServiceView from "./Components/ServiceView";

function ProductDetails() {
    const getAuth = useAuth();
    const productId = useParams().productId;
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const fetchProductData = async () => {
            try {
                setIsLoading(true);
                const token = await getAuth.getToken();
                const response = await fetchProductById(token, productId);
                setData(response.data);
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

     if (isLoading) {
            return (
                <>
                    {/* Breadcrumbs Skeleton */}
                    <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4 mx-3"></div>
    
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
        <div className="max-w-screen sm:px-3 bg-slate-50 rounded-md">
            {
                data.category == "BATTERY_PACK" ? (
                    <BattryPackView/>
                ):
                data.category == "SOLAR" ? (
                    <SolarView/>
                ):
                data.category == "E_VEHICLE" ? (
                    <EVView/>
                ):
                data.category == "SERVICE" ? (
                    <ServiceView/>
                ):
                <OtherView/>
            }
        </div>
    );
}

export default ProductDetails;

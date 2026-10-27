import { useParams } from "react-router-dom";
import BattryPackView from "./Components/BatteryPackView";
import SolarView from "./Components/SolarView";
import { useEffect, useState } from "react";
import { fetchProductById } from "@/api/productApi";
import OtherView from "./Components/OtherView";
import { useAuth } from "@clerk/clerk-react";
import { ErrorState } from "@/components/Skeleton";
import EVView from "./Components/EVView";
import ServiceView from "./Components/ServiceView";

function ProductDetails() {
    const { getToken } = useAuth();
    const productId = useParams().productId;
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const fetchProductData = async () => {
            try {
                setIsLoading(true);
                const token = await getToken();
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
    }, [productId, getToken]); 

    if (isLoading) {
        return (
            <div className="w-full space-y-6">
                <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/70 flex flex-col sm:flex-row justify-between items-center gap-4 animate-pulse">
                    <div className="h-8 w-64 bg-slate-200 rounded-xl"></div>
                    <div className="flex flex-wrap items-center gap-2.5">
                        <div className="h-10 w-24 bg-slate-200 rounded-xl"></div>
                        <div className="h-10 w-28 bg-slate-200 rounded-xl"></div>
                    </div>
                </div>

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

                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70 animate-pulse">
                    <div className="h-6 w-40 bg-slate-200 rounded-lg mb-6"></div>
                    <div className="space-y-4">
                        <div className="h-8 w-full bg-slate-100 rounded-lg"></div>
                        <div className="h-12 w-full bg-slate-50 rounded-xl border border-slate-100"></div>
                        <div className="h-12 w-full bg-slate-50 rounded-xl border border-slate-100"></div>
                        <div className="h-12 w-full bg-slate-50 rounded-xl border border-slate-100"></div>
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
            {
                data.category === "BATTERY_PACK" ? (
                    <BattryPackView initialData={data} />
                ) : data.category === "SOLAR" ? (
                    <SolarView initialData={data} />
                ) : data.category === "E_VEHICLE" ? (
                    <EVView initialData={data} />
                ) : data.category === "SERVICE" ? (
                    <ServiceView initialData={data} />
                ) : (
                    <OtherView initialData={data} />
                )
            }
        </div>
    );
}

export default ProductDetails;
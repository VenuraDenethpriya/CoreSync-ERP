import { useAuth, useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { fetchSalespersonDashboardData } from "@/api/saleApi";
import { toast } from "sonner";
import { SalesForthisMonth } from "./Components/SalesForthisMonth";
import { SalesForLastYear } from "./Components/SalesForLastYear";

function SalesTeamDashboard() {
    const { getToken } = useAuth();
    const { isLoaded, isSignedIn, user } = useUser();

    const [dashboardData, setDashboardData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const emailAddress = user?.primaryEmailAddress?.emailAddress;

    useEffect(() => {
        const loadDashboardData = async () => {
            if (!emailAddress) return; 

            try {
                setIsLoading(true);
                const token = await getToken();
                const res = await fetchSalespersonDashboardData(token, emailAddress);

                if (res && res.data) {
                    setDashboardData(res.data);
                }
            } catch (error) {
                console.error("Failed to load dashboard data:", error);
                toast.error("Failed to load dashboard data");
            } finally {
                setIsLoading(false);
            }
        };

        loadDashboardData();
    }, [getToken, emailAddress]); 

    if (isLoading || !isLoaded) {
        return (
            <div className="p-4 md:p-6 space-y-6 animate-pulse">
                <div className="h-8 w-64 bg-gray-200 rounded mb-6"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                    <div className="h-64 bg-gray-200 rounded-xl"></div>
                    <div className="h-64 bg-gray-200 rounded-xl"></div>
                </div>
                <div className="h-80 bg-gray-200 rounded-xl"></div>
            </div>
        );
    }

    if (!dashboardData) {
        return <div className="p-6 text-gray-500">No dashboard data available.</div>;
    }
    
    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                <div className="h-full">
                    <SalesForLastYear data={dashboardData.last_year} />
                </div>
                <div className="h-full">
                    <SalesForthisMonth data={dashboardData.this_month} />
                </div>
            </div>
        </div>
    );
}

export default SalesTeamDashboard;
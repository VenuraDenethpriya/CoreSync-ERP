import { useAuth } from "@clerk/clerk-react";
import { LastMothSalesChart } from "./Components/BarChart";
import { LineChartOveroll } from "./Components/LineChartOveroll";
import { LineChartPersons } from "./Components/LineChartPersons";
import { LastMonthPieChart } from "./Components/PieChart";
import { useEffect, useState } from "react";
import { fetchSalesDashboardData } from "@/api/saleApi";
import { toast } from "sonner";

function SalesDashboard() {
    const { getToken } = useAuth();

    const [dashboardData, setDashboardData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                setIsLoading(true);
                const token = await getToken();
                const res = await fetchSalesDashboardData(token);

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
    }, [getToken]);

    if (isLoading) {
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
                    <LastMothSalesChart data={dashboardData.last_month} />
                </div>
                <div className="h-full">
                    <LastMonthPieChart data={dashboardData.last_month} />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <div className="w-full">
                    <LineChartPersons data={dashboardData.last_year} />
                </div>
                <div className="w-full">
                    <LineChartOveroll data={dashboardData.last_year} />
                </div>
            </div>
        </div>
    );
}

export default SalesDashboard;
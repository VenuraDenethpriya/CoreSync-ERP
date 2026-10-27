import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Package, ShoppingCart, AlertTriangle, TrendingUp, LockIcon } from 'lucide-react'
import { GoStack } from "react-icons/go"
import { LuFileText } from "react-icons/lu"
import { useAuth, useUser } from "@clerk/clerk-react"
import { useEffect, useState } from "react"
import { getDashboardData } from "@/api/dashboardApi"
import { useNavigate } from "react-router-dom"
import { Roles } from "@/const/const"
import { Button } from "@/components/ui/button";
import { SkeletonFormCard, SkeletonTableRow } from "@/components/Skeleton"

export default function Dashboard() {

  function useIsSmallScreen(breakpoint = 640) {
    const [isSmall, setIsSmall] = useState(false);

    useEffect(() => {
      const checkScreen = () => setIsSmall(window.innerWidth < breakpoint);
      checkScreen();
      window.addEventListener("resize", checkScreen);
      return () => window.removeEventListener("resize", checkScreen);
    }, [breakpoint]);

    return isSmall;
  }
  const isSmallScreen = useIsSmallScreen();

  const { isLoaded, getToken } = useAuth();
  const [dashboardData, setDashboardData] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    if (!isLoaded) return;

    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const token = await getToken();
        const response = await getDashboardData(token);

        if (response.data) {
          setDashboardData(response.data);
        } else {
          console.warn("No dashboard data found");
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [isLoaded, getToken]);

  const orderStatusData = [
    { name: "Completed", value: dashboardData?.CompletedOrdersCount, fill: "#1d4ed8" },
    { name: "Pending", value: dashboardData?.PendingOrdersCount, fill: "#dc2626" },
    { name: "In Progress", value: dashboardData?.BalancingOrdersCount, fill: "#4b5563" },
  ]

  const categoryData = [
    { category: "Battery Pack", count: dashboardData?.BatteryPackCount },
    { category: "Solar", count: dashboardData?.SolarCount },
    { category: "E-Vehicle", count: dashboardData?.EBikeCount },
    { category: "Service", count: dashboardData?.ServiceCount },
    { category: "Others", count: dashboardData?.OtherCount },
  ]

  const quoteData = [
    { status: "Drafted", count: dashboardData?.DraftedQuotesCount },
    { status: "Rejected", count: dashboardData?.RejectedQuotesCount },
    { status: "Submitted", count: dashboardData?.SubmittedQuotesCount },
    { status: "Confirmed", count: dashboardData?.ConfirmedQuotesCount },
  ]

  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        {/* Title Header Skeleton */}
        <div className="h-8 w-44 bg-slate-200 rounded-xl animate-pulse"></div>
        
        {/* Top Metric Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SkeletonFormCard />
          <SkeletonFormCard />
        </div>

        {/* Charts Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 border border-slate-200/70 rounded-2xl bg-white shadow-sm h-72 flex flex-col justify-between animate-pulse">
            <div className="h-5 w-48 bg-slate-200 rounded-lg"></div>
            <div className="h-44 w-full bg-slate-100 rounded-xl flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-slate-200"></div>
            </div>
          </div>
          <div className="p-6 border border-slate-200/70 rounded-2xl bg-white shadow-sm h-72 flex flex-col justify-between animate-pulse">
            <div className="h-5 w-40 bg-slate-200 rounded-lg"></div>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-9 w-full bg-slate-100 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Table Skeleton */}
        <div className="p-6 border border-slate-200/70 rounded-2xl bg-white shadow-sm space-y-4 animate-pulse">
          <div className="flex justify-between items-center">
            <div className="h-5 w-44 bg-slate-200 rounded-lg"></div>
            <div className="h-4 w-16 bg-slate-200 rounded"></div>
          </div>
          <div className="rounded-xl border border-slate-100 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead><div className="h-3 w-20 bg-slate-200 rounded"></div></TableHead>
                  <TableHead><div className="h-3 w-28 bg-slate-200 rounded"></div></TableHead>
                  <TableHead className="text-center"><div className="h-3 w-16 bg-slate-200 rounded mx-auto"></div></TableHead>
                  <TableHead className="text-center"><div className="h-3 w-16 bg-slate-200 rounded mx-auto"></div></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 4 }).map((_, index) => (
                  <SkeletonTableRow key={`dash-skeleton-${index}`} columns={4} />
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    );
  }

  if (user?.publicMetadata?.role === Roles.SALES_TEAM || user?.publicMetadata?.role === Roles.WAREHOUSE_STAFF || user?.publicMetadata?.role === Roles.HR_HEAD) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] w-full px-4">
        <div className="bg-white shadow-sm rounded-2xl p-8 max-w-md text-center border border-red-100">
          <div className="flex flex-col items-center justify-center gap-3">
            <LockIcon className="w-12 h-12 text-red-500" />
            <h1 className="text-xl font-bold text-gray-800">
              Access Denied
            </h1>
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

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
      </div>

      {/* Top Row - Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sales for last month */}
        <Card className="bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-950 text-white border-none shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-amber-100 uppercase tracking-wider">Sales for Last Month</CardTitle>
            <div className="p-2 bg-white/10 rounded-xl">
              <ShoppingCart className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="text-2xl sm:text-3xl font-black">{dashboardData?.LastMonthOrdersCount || 0} <span className="text-sm font-normal text-amber-100">orders</span></div>
              <div className="text-2xl sm:text-3xl font-black">
                <span className="text-xs font-medium text-amber-100 mr-1">LKR</span>
                {(Math.round((dashboardData?.LastMonthSales || 0) / 1e3)).toLocaleString()}K
              </div>
            </div>
            <p className="text-xs text-amber-100 font-medium mt-3 flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" /> {(dashboardData?.SalesGrowthPercentage || 0).toFixed(2)}% from last month
            </p>
          </CardContent>
        </Card>

        {/* Successfully Delivered Count */}
        <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-blue-100 uppercase tracking-wider">Successful Deliveries</CardTitle>
            <div className="p-2 bg-white/10 rounded-xl">
              <Package className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-2xl sm:text-3xl font-black">{dashboardData?.DeleverdOrdersCount || 0} <span className="text-sm font-normal text-blue-100">orders</span></div>
            <p className="text-xs text-blue-100 font-medium mt-3 flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" /> {(dashboardData?.DeliveredOrderGrowthPercent || 0).toFixed(2)}% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Second Row - Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Pie Chart */}
        <Card className="border border-slate-200/70 shadow-sm rounded-2xl bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-slate-800 text-lg font-bold">
              <GoStack className="h-5 w-5 text-blue-600" />
              Order Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72 flex items-center justify-center p-2">
            <ChartContainer
              config={{
                pending: { label: "Pending", color: "#dc2626" },
                imProgress: { label: "In Progress", color: "#4b5563" },
                completed: { label: "Completed", color: "#16a34a" },
              }}
              className="h-full w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    innerRadius={isSmallScreen ? 35 : 45}
                    labelLine={false}
                    label={isSmallScreen ? false : ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    dataKey="value"
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Product Category Count */}
        <Card className="border border-slate-200/70 shadow-sm rounded-2xl bg-white flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-slate-800 text-lg font-bold">
              <Package className="h-5 w-5 text-blue-600" />
              Product Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center py-4">
            {categoryData.length > 0 ? (
              <div className="space-y-3">
                {categoryData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-x-3">
                      <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
                      <span className="font-semibold text-slate-700 text-sm">{item.category}</span>
                    </div>
                    <span className="text-base font-bold text-slate-900">{item.count || 0}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-slate-400 text-sm py-8">No data available</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Third Row - Quotes & Low Stock Inventory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
        {/* Quotes Status */}
        <Card className="border border-slate-200/70 shadow-sm rounded-2xl bg-white flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-slate-800 text-lg font-bold">
              <LuFileText className="h-5 w-5 text-blue-600" />
              Quotes Status
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center py-4">
            <div className="space-y-3">
              {quoteData.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-x-3">
                    <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full"></div>
                    <span className="font-semibold text-slate-700 text-sm">{item.status}</span>
                  </div>
                  <span className="text-base font-bold text-slate-900">{item.count || 0}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Inventory Table */}
        <Card className="border border-slate-200/70 shadow-sm rounded-2xl bg-white flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2 text-slate-800 text-lg font-bold">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Low Stock Inventory
            </CardTitle>
            <button
              onClick={() => navigate("/inventory")}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
            >
              See all
            </button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/70">
                  <TableRow>
                    <TableHead className="text-xs font-bold text-slate-500 uppercase">Item Code</TableHead>
                    <TableHead className="text-xs font-bold text-slate-500 uppercase">Item Name</TableHead>
                    <TableHead className="text-xs font-bold text-slate-500 uppercase text-center">Quantity</TableHead>
                    <TableHead className="text-xs font-bold text-slate-500 uppercase text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(dashboardData?.LowStockInventory || []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-slate-400 text-sm">
                        No low stock items found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    (dashboardData?.LowStockInventory || []).map((item) => (
                      <TableRow 
                        key={item.ItemID}
                        onClick={() => navigate(`/inventory/${item.ItemID}`)}
                        className="cursor-pointer hover:bg-slate-50/80 transition-colors"
                      >
                        <TableCell className="font-semibold text-slate-700 text-sm">{item.ItemCode}</TableCell>
                        <TableCell className="text-slate-600 text-sm">{item.ItemName}</TableCell>
                        <TableCell className="text-slate-600 text-sm text-center font-medium">{item.Quantity}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="destructive" className="bg-rose-100 text-rose-700 hover:bg-rose-100 font-bold text-xs px-2.5 py-0.5 rounded-full border-0">
                            {item.Status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
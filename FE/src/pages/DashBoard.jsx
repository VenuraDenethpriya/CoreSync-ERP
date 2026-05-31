"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Package, ShoppingCart, FileText, AlertTriangle, TrendingUp, TrendingDown, LockIcon } from 'lucide-react'
import { GoStack } from "react-icons/go"
import { LuFileText } from "react-icons/lu"
import { useAuth } from "@clerk/clerk-react"
import { use, useEffect, useState } from "react"
import { getDashboardData } from "@/api/dashboardApi"
import { useNavigate } from "react-router-dom"


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
    return <div className="max-h-screen bg-gray-50 sm:p-3 animate-pulse">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header Skeleton */}
        <div className="mb-2">
          <div className="h-9 bg-gray-300 rounded w-48"></div> {/* Placeholder for Dashboard title */}
        </div>

        {/* Top Row - Key Metrics Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {/* Sales for last month Skeleton */}
          <Card className="bg-gray-200 text-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-300 rounded w-32"></div> {/* Placeholder for title */}
              <div className="h-4 w-4 bg-gray-300 rounded-full"></div> {/* Placeholder for icon */}
            </CardHeader>
            <CardContent>
              <div className="flex justify-between">
                <div className="h-6 bg-gray-300 rounded w-24"></div> {/* Placeholder for orders count */}
                <div className="h-6 bg-gray-300 rounded w-20"></div> {/* Placeholder for LKR amount */}
              </div>
              <div className="h-3 bg-gray-300 rounded w-40 mt-1"></div> {/* Placeholder for percentage */}
            </CardContent>
          </Card>

          {/* Successfully Delivered Count Skeleton */}
          <Card className="bg-gray-200 text-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-300 rounded w-48"></div> {/* Placeholder for title */}
              <div className="h-4 w-4 bg-gray-300 rounded-full"></div> {/* Placeholder for icon */}
            </CardHeader>
            <CardContent>
              <div className="h-6 bg-gray-300 rounded w-32"></div> {/* Placeholder for orders count */}
              <div className="h-3 bg-gray-300 rounded w-40 mt-1"></div> {/* Placeholder for percentage */}
            </CardContent>
          </Card>
        </div>

        {/* Second Row - Charts and Tables Skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6">
          {/* Order Status Pie Chart Skeleton */}
          <Card className="h-72 bg-gray-200">
            <CardHeader>
              <div className="h-5 bg-gray-300 rounded w-48"></div> {/* Placeholder for chart title */}
            </CardHeader>
            <CardContent className="flex items-center justify-center h-[calc(100%-64px)]"> {/* Adjust height */}
              <div className="h-40 w-40 bg-gray-300 rounded-full"></div> {/* Placeholder for pie chart */}
            </CardContent>
          </Card>

          {/* Product Category Count Skeleton */}
          <Card className="h-72 bg-gray-200">
            <CardHeader>
              <div className="h-5 bg-gray-300 rounded w-48"></div> {/* Placeholder for product category title */}
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => ( // Render 3 placeholder category items
                  <div key={i} className="flex items-center justify-between p-2 bg-gray-100 rounded-lg">
                    <div className="flex items-center gap-x-3">
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      <div className="h-4 bg-gray-300 rounded w-24"></div> {/* Placeholder for category name */}
                    </div>
                    <div className="h-6 bg-gray-300 rounded w-10"></div> {/* Placeholder for count */}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6">
          {/* Quotes Status Skeleton */}
          <Card className="h-64 bg-gray-200">
            <CardHeader>
              <div className="h-5 bg-gray-300 rounded w-36"></div> {/* Placeholder for quotes status title */}
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => ( // Render 3 placeholder quote items
                  <div key={i} className="flex items-center justify-between p-1 bg-gray-100 rounded-lg">
                    <div className="flex items-center gap-x-3">
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      <div className="h-4 bg-gray-300 rounded w-20"></div> {/* Placeholder for status name */}
                    </div>
                    <div className="h-6 bg-gray-300 rounded w-8"></div> {/* Placeholder for count */}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Low Stock Inventory Table Skeleton */}
          <Card className="h-64 bg-gray-200">
            <CardHeader className="grid grid-cols-2 py-4">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 bg-gray-300 rounded"></div> {/* Icon placeholder */}
                <div className="h-5 bg-gray-300 rounded w-40"></div> {/* Title placeholder */}
              </div>
              <div className="flex items-end justify-end pr-2">
                <div className="h-4 bg-gray-300 rounded w-16"></div> {/* "See all" placeholder */}
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead><div className="h-4 bg-gray-300 rounded w-20"></div></TableHead>
                    <TableHead><div className="h-4 bg-gray-300 rounded w-24"></div></TableHead>
                    <TableHead className="text-center"><div className="h-4 bg-gray-300 rounded w-16 mx-auto"></div></TableHead>
                    <TableHead className="text-center"><div className="h-4 bg-gray-300 rounded w-16 mx-auto"></div></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(3)].map((_, i) => ( // Render 3 placeholder rows
                    <TableRow key={i}>
                      <TableCell className="font-medium"><div className="h-4 bg-gray-300 rounded w-20"></div></TableCell>
                      <TableCell><div className="h-4 bg-gray-300 rounded w-28"></div></TableCell>
                      <TableCell className="text-center"><div className="h-4 bg-gray-300 rounded w-10 mx-auto"></div></TableCell>
                      <TableCell className="text-center">
                        <div className="h-6 bg-gray-300 rounded-full w-20 mx-auto"></div> {/* Badge placeholder */}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 p-2 sm:p-4 overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="mb-2">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>

        {/* Top Row - Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {/* Completed Orders Count */}
          <Card className="bg-gradient-to-r from-orange-200 to-amber-300 text-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Sales for last month</CardTitle>
              <ShoppingCart className="h-4 w-4 opacity-90" />
            </CardHeader>
            <CardContent >
              <div className="flex justify-between">
                <div className="text-2xl font-bold">{dashboardData?.LastMonthOrdersCount} <span className="text-sm">orders</span></div>
                <div className="text-2xl font-bold">
                  <span className="text-sm">LKR</span>{" "}
                  {(Math.round(dashboardData?.LastMonthSales / 1e3)).toLocaleString()}K
                </div>
              </div>

              <p className="text-xs opacity-90 mt-1">{(dashboardData?.SalesGrowthPercentage)?.toFixed(2)}% from last month</p>
            </CardContent>
          </Card>

          {/* Successfully Delivered Count */}
          <Card className="bg-gradient-to-r from-sky-200 to-blue-300 text-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Last month we have successfully delivered</CardTitle>
              <Package className="h-4 w-4 opacity-90" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.DeleverdOrdersCount} <span className="text-sm">orders</span></div>
              <p className="text-xs opacity-90 mt-1">{(dashboardData?.DeliveredOrderGrowthPercent)?.toFixed(2)}% from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Second Row - Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-2">
          {/* Order Status Pie Chart */}
          <Card className="h-64 sm:h-72 md:h-72">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GoStack className="h-5 w-5" />
                Order Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="h-full">
              <ChartContainer
                config={{
                  pending: { label: "Pending", color: "#dc2626" },
                  imProgress: { label: "Im Progress", color: "#4b5563" },
                  completed: { label: "Completed", color: "#16a34a" },
                }}
                className="h-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      cx={isSmallScreen ? "40%" : "50%"}
                      cy={isSmallScreen ? "40%" : "50%"}
                      outerRadius={isSmallScreen ? 60 : 80}
                      innerRadius={isSmallScreen ? 40 : 0}
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
          <Card className="h-72">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              {
                categoryData.length > 0 ? (
                  <div className="space-y-2">
                    {categoryData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-1 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="font-medium">{item.category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold">{item.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-lg font-bold">No data available</span>
                  </div>
                )
              }

            </CardContent>
          </Card>
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-2">
          <Card className="h-64">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LuFileText className="h-5 w-5" />
                Quotes Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {quoteData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-1 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="font-medium">{item.status}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-lg font-bold">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Third Row - Low Stock Inventory Table */}
          <Card className="h-64">
            <CardHeader className="grid grid-cols-2 p-4">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Low Stock Inventory
              </CardTitle>
              <CardTitle
                className="flex items-end gap-2 text-blue-600 cursor-pointer justify-end pr-2 text-xs"
                onClick={() => navigate("/inventory")}
              >
                See all
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <div className="min-w-[400px] sm:min-w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Code</TableHead>
                      <TableHead>Item Name</TableHead>
                      <TableHead className="text-center">Quantity</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(dashboardData?.LowStockInventory || []).map((item) => (
                      <TableRow key={item.ItemID}
                        onClick={() => navigate(`/inventory/${item.ItemID}`)}
                        className="cursor-pointer hover:bg-gray-100 transition-all duration-200"
                      >
                        <TableCell className="font-medium">{item.ItemCode}</TableCell>
                        <TableCell className="text-gray-600">{item.ItemName}</TableCell>
                        <TableCell className="text-gray-600 text-center">{item.Quantity}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="destructive" className="bg-red-100 text-red-800 rounded-full">
                            {item.Status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}




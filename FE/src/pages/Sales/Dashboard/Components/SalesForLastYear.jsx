"use client"

import * as React from "react"
import { TrendingUp } from "lucide-react"
import { Bar, BarChart, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "A horizontal bar chart"

const chartConfig = {
  sale: {
    label: "Sales (LKR)",
    color: "hsl(var(--chart-1))", 
  },
}

export function SalesForLastYear({ data }) {
  // 1. Format the Date Range Description
  let dateDescription = "Loading dates..."
  if (data?.date_period?.start_date && data?.date_period?.end_date) {
    const startDate = new Date(data.date_period.start_date)
    const endDate = new Date(data.date_period.end_date)
    
    const startString = `${startDate.toLocaleString("default", { month: "long" })} ${startDate.getFullYear()}`
    const endString = `${endDate.toLocaleString("default", { month: "long" })} ${endDate.getFullYear()}`
    
    dateDescription = `${startString} - ${endString}`
  }

  // 2. Map data dynamically
  const chartData = React.useMemo(() => {
    const rawData = data?.total_sales_for_12_months || []
    
    // The API returns data descending (July, June, May...). 
    // We reverse it so the chart displays chronologically top-to-bottom.
    return [...rawData].reverse()
  }, [data])

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>Sales for Last 12 Months</CardTitle>
        <CardDescription>{dateDescription}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {chartData.length > 0 ? (
          // Added a fixed height so 12 bars aren't squished
          <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <BarChart
              accessibilityLayer
              data={chartData}
              layout="vertical"
              margin={{
                left: -15, // Adjusted to give the Y-axis labels a bit more room
                right: 10,
              }}
            >
              <XAxis type="number" dataKey="sale" hide />
              <YAxis
                dataKey="month"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                // Safely slice the month name to 3 letters (e.g., "Jan")
                tickFormatter={(value) => (value ? value.toString().slice(0, 3) : "")}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="sale" fill="var(--color-sale)" radius={5} />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[400px] items-center justify-center text-muted-foreground">
             No historical data available.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
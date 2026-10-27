import * as React from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
  sale: {
    label: "Total Sales (LKR)",
    color: "hsl(var(--chart-1))", 
  },
  target: {
    label: "Total Target (LKR)",
    color: "hsl(var(--chart-2))",
  },
}

export function LineChartOveroll({ data }) {
  // 1. Format dynamic Date Description
  let dateDescription = "Loading dates..."
  if (data?.date_period?.start_date && data?.date_period?.end_date) {
    const startDate = new Date(data.date_period.start_date)
    const endDate = new Date(data.date_period.end_date)
    const startYear = startDate.getFullYear()
    const endYear = endDate.getFullYear()
    
    dateDescription = `${startDate.toLocaleString("default", { month: "long" })} ${startYear} - ${endDate.toLocaleString("default", { month: "long" })} ${endYear}`
  }

  const chartData = React.useMemo(() => {
    const rawData = data?.data || []
    
    if (rawData.length === 0) return []

    const groupedByMonth = {}

    const reversedData = [...rawData].reverse()

    reversedData.forEach((item) => {
      const monthAbbr = item.month ? item.month.substring(0, 3) : "Unk"

      if (!groupedByMonth[monthAbbr]) {
        groupedByMonth[monthAbbr] = { month: monthAbbr, sale: 0, target: 0 }
      }

      groupedByMonth[monthAbbr].sale += (item.sales || 0)
      groupedByMonth[monthAbbr].target += (item.target || 0)
    })

    return Object.values(groupedByMonth)
  }, [data])

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>Sales vs Targets - Overall</CardTitle>
        <CardDescription>Company-wide performance analysis ({dateDescription})</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {chartData.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 12,
                right: 12,
                top: 20,
              }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={12}
              />
              <YAxis 
                tickLine={false} 
                axisLine={false} 
                tickMargin={10} 
                width={60}
                tickFormatter={(val) => {
                    if (val >= 1000000) return `${(val / 1000000).toFixed(0)}M`
                    if (val >= 1000) return `${(val / 1000).toFixed(0)}K`
                    return val
                }}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
              
              <Line
                dataKey="sale"
                type="monotone"
                stroke="var(--color-sale)"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              
              <Line
                dataKey="target"
                type="monotone"
                stroke="var(--color-target)"
                strokeWidth={3}
                strokeDasharray="5 5" 
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[350px] items-center justify-center text-muted-foreground">
             No overall data available for this period.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
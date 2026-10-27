import * as React from "react"
import { Label, Pie, PieChart } from "recharts"

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

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

export function LastMonthPieChart({ data }) {
  let dateDescription = "Loading dates..."
  if (data?.date_period?.start_date && data?.date_period?.end_date) {
    const startDate = new Date(data.date_period.start_date)
    const endDate = new Date(data.date_period.end_date)

    const startDay = startDate.getDate()
    const startMonth = startDate.toLocaleString("default", { month: "short" })
    
    const endDay = endDate.getDate()
    const endMonth = endDate.toLocaleString("default", { month: "short" })
    const endYear = endDate.getFullYear()

    dateDescription = `${startDay} ${startMonth} - ${endDay} ${endMonth} ${endYear}`
  }

  const rawData = data?.data || []
  
  const chartData = rawData
    .filter((item) => item.sale > 0) 
    .map((item, index) => {
      const shortName = item.salesperson ? item.salesperson.split(" ")[0] : "Unknown"
      return {
        salesperson: shortName,
        sales: item.sale,
        fill: COLORS[index % COLORS.length],
      }
    })

  const chartConfig = {
    sales: { label: "Sales (LKR)" },
  }
  
  chartData.forEach((item) => {
    chartConfig[item.salesperson] = {
      label: item.salesperson,
      color: item.fill,
    }
  })

  const totalSales = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.sales, 0)
  }, [chartData])

  const formatCompactNumber = (number) => {
    if (number >= 1000000) return `${(number / 1000000).toFixed(1)}M`
    if (number >= 1000) return `${(number / 1000).toFixed(1)}K`
    return number.toLocaleString()
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>Last Month Sales Distribution</CardTitle>
        <CardDescription>{dateDescription}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {chartData.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="sales"
                nameKey="salesperson"
                innerRadius={60}
                strokeWidth={5}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-2xl font-bold"
                          >
                            {formatCompactNumber(totalSales)}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground text-xs"
                          >
                            Total (LKR)
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[250px] items-center justify-center text-muted-foreground">
            No sales data for this period
          </div>
        )}
      </CardContent>
    </Card>
  )
}
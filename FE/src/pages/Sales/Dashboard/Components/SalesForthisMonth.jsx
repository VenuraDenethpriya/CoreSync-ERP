"use client"

import { TrendingUp, Trophy } from "lucide-react"
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
} from "recharts"

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
} from "@/components/ui/chart"

export function SalesForthisMonth({ data }) {
  const salesInfo = data?.total_sales_from_1st?.[0] || { sales: 0, target: 100000 }
  const sales = salesInfo.sales || 0
  const target = salesInfo.target || 100000

  // 1. Calculations for Progress and Remaining
  const remaining = Math.max(0, target - sales)
  const progressPercentage = ((sales / target) * 100).toFixed(1)

  // Cap the circle fill at the target so it doesn't overlap itself if sales > target
  const visualSales = sales > target ? target : sales

  // 2. Date Formatting
  let dateDescription = "Loading dates..."
  if (data?.date_period?.start_date && data?.date_period?.end_date) {
    const startDate = new Date(data.date_period.start_date)
    const endDate = new Date(data.date_period.end_date)

    const startDay = startDate.getDate()
    const startMonth = startDate.toLocaleString("default", { month: "short" })
    
    const endDay = endDate.getDate()
    const endMonth = endDate.toLocaleString("default", { month: "short" })
    const year = endDate.getFullYear()

    dateDescription = `${startDay} ${startMonth} - ${endDay} ${endMonth} ${year}`
  }

  // 3. Chart Data & Config
  const chartData = [
    { name: "Sales", sale: visualSales, fill: "hsl(var(--chart-2))" },
  ]

  const chartConfig = {
    sale: {
      label: "Sales",
      color: "hsl(var(--chart-2))",
    },
  }

  const formatCompactNumber = (number) => {
    if (number >= 1000000) return `${(number / 1000000).toFixed(1)}M`
    if (number >= 1000) return `${(number / 1000).toFixed(1)}K`
    return number.toLocaleString()
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>This Month's Progress</CardTitle>
        <CardDescription>{dateDescription}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={90}    // Starts at top (12 o'clock)
            endAngle={-270}    // Completes a full 360 degree circle
            innerRadius={70}
            outerRadius={100}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-background"
              polarRadius={[86, 74]}
            />
            
            {/* Domain explicitly tells the chart that a full circle = target */}
            <PolarAngleAxis 
              type="number" 
              domain={[0, target]} 
              angleAxisId={0} 
              tick={false} 
            />
            <RadialBar 
              dataKey="sale" 
              background 
              cornerRadius={10} 
            />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
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
                          y={viewBox.cy - 5}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {formatCompactNumber(sales)}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 20}
                          className="fill-muted-foreground text-sm"
                        >
                          / {formatCompactNumber(target)} Target
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      
      {/* 4. Footer showing remaining amount */}
      <CardFooter className="flex-col gap-2 text-sm pt-4">
        <div className="flex items-center justify-center gap-2 leading-none font-medium text-center">
          {progressPercentage}% of monthly target achieved <TrendingUp className="h-4 w-4 text-primary" />
        </div>
        
        {remaining > 0 ? (
          <div className="leading-none text-muted-foreground">
            <span className="font-semibold text-foreground">{formatCompactNumber(remaining)}</span> remaining to hit target
          </div>
        ) : (
          <div className="flex items-center gap-1 leading-none text-green-600 font-medium dark:text-green-500">
            Target Achieved! <Trophy className="h-4 w-4" />
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
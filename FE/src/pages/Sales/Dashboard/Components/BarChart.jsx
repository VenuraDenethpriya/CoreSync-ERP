import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
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

export const description = "A multiple bar chart"


const chartConfig = {
  sale: {
    label: "Sales (LKR)",
    color: "hsl(var(--chart-1))", 
  },
  target: {
    label: "Target (LKR)",
    color: "hsl(var(--chart-2))", 
  },
}

export function LastMothSalesChart({ data }) {
  const chartData = data?.data || []


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

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Last Month Sales - All Salespersons</CardTitle>
        <CardDescription>{dateDescription}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ChartContainer config={chartConfig} className="w-full h-[300px]">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="salesperson"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value ? value.split(' ')[0] : ''} 
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="sale" fill="var(--color-sale)" radius={4} />
            <Bar dataKey="target" fill="var(--color-target)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
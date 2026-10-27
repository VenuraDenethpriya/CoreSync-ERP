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

const COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
]

export function LineChartPersons({ data }) {
  let dateDescription = "Loading dates..."
  if (data?.date_period?.start_date && data?.date_period?.end_date) {
    const startDate = new Date(data.date_period.start_date)
    const endDate = new Date(data.date_period.end_date)
    const startYear = startDate.getFullYear()
    const endYear = endDate.getFullYear()
    
    dateDescription = `${startDate.toLocaleString("default", { month: "short" })} ${startYear} - ${endDate.toLocaleString("default", { month: "long" })} ${endYear}`
  }

  const { chartData, salespersons, chartConfig } = React.useMemo(() => {
    const rawData = data?.data || []
    
    if (rawData.length === 0) {
      return { chartData: [], salespersons: [], chartConfig: {} }
    }

    const uniquePersons = new Set()
    rawData.forEach(item => {
        if (item.salesperson) {
            uniquePersons.add(item.salesperson.split(" ")[0]) 
        }
    })
    const personsArray = Array.from(uniquePersons)

    const config = {
      sales: { label: "Actual Sales (LKR)" },
      target: { label: "Target (LKR)" },
    }
    
    personsArray.forEach((person, index) => {
      const color = COLORS[index % COLORS.length]
      config[`${person}Sales`] = { label: `${person} Sales`, color }
      config[`${person}Target`] = { label: `${person} Target`, color }
    })

    const groupedByMonth = {}


    const reversedData = [...rawData].reverse()

    reversedData.forEach(item => {
      if (!groupedByMonth[item.month]) {
        groupedByMonth[item.month] = { month: item.month.substring(0, 3) }
      }
      
      const personName = item.salesperson.split(" ")[0]
      groupedByMonth[item.month][`${personName}Sales`] = item.sales || 0
      groupedByMonth[item.month][`${personName}Target`] = item.target || 0
    })

    return {
      chartData: Object.values(groupedByMonth),
      salespersons: personsArray,
      chartConfig: config,
    }
  }, [data])


  const [activeChart, setActiveChart] = React.useState("")

  React.useEffect(() => {
    if (salespersons.length > 0 && !activeChart) {
      setActiveChart(salespersons[0])
    }
  }, [salespersons, activeChart])


  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex flex-col items-stretch border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Sales vs Targets - Person Wise</CardTitle>
          <CardDescription>Performance analysis ({dateDescription})</CardDescription>
        </div>
      
        <div className="flex flex-wrap border-t sm:border-t-0">
          {salespersons.map((person) => (
            <button
              key={person}
              data-active={activeChart === person}
              className="flex flex-1 flex-col justify-center gap-1 border-b sm:border-b-0 sm:border-l px-6 py-4 text-left data-[active=true]:bg-muted/50 hover:bg-muted/30 transition-colors"
              onClick={() => setActiveChart(person)}
            >
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{person}</span>
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="px-2 pt-6 sm:p-6 flex-1">
        {chartData.length > 0 && activeChart ? (
          <ChartContainer config={chartConfig} className="aspect-auto h-[350px] w-full">
            <LineChart data={chartData} margin={{ left: 12, right: 12, top: 20 }}>
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
              <ChartTooltip content={<ChartTooltipContent indicator="line" />} />

              <Line
                dataKey={`${activeChart}Sales`}
                type="monotone"
                stroke={chartConfig[`${activeChart}Sales`]?.color || "#000"} 
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />

              <Line
                dataKey={`${activeChart}Target`}
                type="monotone"
                stroke={chartConfig[`${activeChart}Target`]?.color || "#000"} 
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[350px] items-center justify-center text-muted-foreground">
             No performance data available for this period.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
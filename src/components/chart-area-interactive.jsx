import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "./ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import { useIsMobile } from "../hooks/use-mobile";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

const chartData = [
  { date: "05-24", 2024: 556, 2025: 635 },
  { date: "05-25", 2024: 430, 2025: 510 },
  { date: "05-26", 2024: 390, 2025: 480 },
  { date: "05-27", 2024: 600, 2025: 700 },
  { date: "05-28", 2024: 320, 2025: 410 },
  { date: "05-29", 2024: 410, 2025: 390 },
  { date: "05-30", 2024: 500, 2025: 520 },
  { date: "05-31", 2024: 470, 2025: 610 },
  { date: "06-01", 2024: 350, 2025: 420 },
  { date: "06-02", 2024: 380, 2025: 450 },
  { date: "06-03", 2024: 420, 2025: 480 },
  { date: "06-04", 2024: 390, 2025: 510 },
  { date: "06-05", 2024: 410, 2025: 530 },
  { date: "06-06", 2024: 370, 2025: 490 },
  { date: "06-07", 2024: 430, 2025: 550 },
];

const chartConfig = {
  2024: {
    label: "2024",
    color: "#007fff",
  },
  2025: {
    label: "2025",
    color: "#ff4500",
  },
};

export default function ChartAreaInteractive() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("90d");

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  const filteredData = chartData; // No filter needed for dummy data

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Total Visitors</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Total for the last 3 months
          </span>
          <span className="@[540px]/card:hidden">Last 3 months</span>
        </CardDescription>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mt-4">
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fill2024" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-2024)" stopOpacity={1.0} />
                <stop offset="95%" stopColor="var(--color-2024)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fill2025" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-2025)" stopOpacity={1.0} />
                <stop offset="95%" stopColor="var(--color-2025)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={16}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelKey="date"
                  nameKey={undefined}
                  indicator="dot"
                />
                
              }
              
            />
             <ChartLegend content={<ChartLegendContent />} />
            <Area
              dataKey="2024"
              type="natural"
              fill="url(#fill2024)"
              stroke="#007fff"
              stackId={undefined}
            />
            <Area
              dataKey="2025"
              type="natural"
              fill="url(#fill2025)"
              stroke="#ff4500"
              stackId={undefined}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

import React, { useEffect, useState } from "react";
import { Trans } from "@lingui/macro";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "../ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { useIsMobile } from "../../hooks/use-mobile";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { supabase } from "../../supabaseClient";

export default function ChartAreaInteractive() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("90d");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      const { data, error } = await supabase.from("events").select();
      if (!error) setEvents(data || []);
      setLoading(false);
    }
    fetchEvents();
  }, []);

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  // Detectar años dinámicamente
  const currentYear = new Date().getFullYear();
  const prevYear = currentYear - 1;

  // Configuración dinámica de colores y etiquetas
  const chartConfig = {
    [prevYear]: {
      label: prevYear.toString(),
      color: "#007fff",
    },
    [currentYear]: {
      label: currentYear.toString(),
      color: "#ff4500",
    },
  };

  // Procesar eventos para el gráfico
  function getChartData(events, timeRange) {
    const today = new Date();
    let days = 90;
    if (timeRange === "30d") days = 30;
    if (timeRange === "7d") days = 7;
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - days + 1);

    const map = {};
    events.forEach((e) => {
      if (!e.start || !e.peopleCount) return;
      const d = new Date(e.start);
      if (d < startDate || d > today) return;
      const year = d.getFullYear();
      if (year !== prevYear && year !== currentYear) return;
      const key = d.getDate().toString().padStart(2, "0") + "-" + (d.getMonth() + 1).toString().padStart(2, "0");
      if (!map[key]) map[key] = { date: key, [prevYear]: 0, [currentYear]: 0 };
      map[key][year] += parseInt(e.peopleCount) || 0;
    });
    return Object.values(map).sort((a, b) => {
      const [ad, am] = a.date.split("-").map(Number);
      const [bd, bm] = b.date.split("-").map(Number);
      if (am !== bm) return am - bm;
      return ad - bd;
    });
  }

  const filteredData = getChartData(events, timeRange);

  // Indicador de carga y mensaje si no hay datos
  if (loading) {
    return (
      <Card className="@container/card flex items-center justify-center h-[250px]">
        <span className="text-muted-foreground text-lg">
          <Trans>Cargando datos...</Trans>
        </span>
      </Card>
    );
  }

  if (!filteredData.length) {
    return (
      <Card className="@container/card flex items-center justify-center h-[250px]">
        <span className="text-muted-foreground text-lg">
          <Trans>No hay datos para mostrar en este rango.</Trans>
        </span>
      </Card>
    );
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle><Trans>Total de Personas</Trans></CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            <Trans>Año actual vs Año anterior</Trans>
          </span>
          <span className="@[540px]/card:hidden">
            <Trans>Año actual vs Año anterior</Trans>
          </span>
        </CardDescription>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mt-4">
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d"><Trans>Last 3 months</Trans></ToggleGroupItem>
            <ToggleGroupItem value="30d"><Trans>Last 30 days</Trans></ToggleGroupItem>
            <ToggleGroupItem value="7d"><Trans>Last 7 days</Trans></ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder={<Trans>Last 3 months</Trans>} />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                <Trans>Last 3 months</Trans>
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                <Trans>Last 30 days</Trans>
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                <Trans>Last 7 days</Trans>
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
              <linearGradient id={`fill${prevYear}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-2024)" stopOpacity={1.0} />
                <stop offset="95%" stopColor="var(--color-2024)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id={`fill${currentYear}`} x1="0" y1="0" x2="0" y2="1">
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
              dataKey={prevYear}
              type="natural"
              fill={`url(#fill${prevYear})`}
              stroke="#007fff"
              stackId={undefined}
            />
            <Area
              dataKey={currentYear}
              type="natural"
              fill={`url(#fill${currentYear})`}
              stroke="#ff4500"
              stackId={undefined}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

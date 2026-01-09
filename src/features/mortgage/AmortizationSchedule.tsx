import { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMortgageStore } from "@/stores";
import { formatCurrency } from "@/lib/utils";
import { format, parseISO } from "date-fns";

type ViewMode = "chart" | "table";

export function AmortizationSchedule() {
  const [viewMode, setViewMode] = useState<ViewMode>("chart");
  const { mortgage, generateAmortizationSchedule } = useMortgageStore();

  const schedule = useMemo(
    () => generateAmortizationSchedule(mortgage?.extraPaymentAmount || 0),
    [generateAmortizationSchedule, mortgage?.extraPaymentAmount]
  );

  if (!mortgage || schedule.length === 0) return null;

  // Chart data (sample for performance)
  const chartData = schedule
    .filter((_, i) => i % 6 === 0 || i === schedule.length - 1)
    .map((entry) => ({
      payment: entry.paymentNumber,
      date: format(parseISO(entry.date), "MMM yy"),
      principal: entry.cumulativePrincipal,
      interest: entry.cumulativeInterest,
      balance: entry.remainingBalance,
    }));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Amortization Schedule</CardTitle>
          <CardDescription>
            {schedule.length} payments over{" "}
            {Math.ceil(schedule.length / 12)} years
          </CardDescription>
        </div>
        <Select
          value={viewMode}
          onValueChange={(value) => setViewMode(value as ViewMode)}
        >
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="chart">Chart</SelectItem>
            <SelectItem value="table">Table</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {viewMode === "chart" ? (
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  className="text-xs fill-muted-foreground"
                  interval="preserveStartEnd"
                />
                <YAxis
                  className="text-xs fill-muted-foreground"
                  tickFormatter={(value) =>
                    value >= 1000 ? `$${Math.round(value / 1000)}k` : `$${value}`
                  }
                />
                <Tooltip
                  formatter={(value) => formatCurrency(value as number)}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="principal"
                  name="Cumulative Principal"
                  stackId="1"
                  stroke="hsl(var(--chart-2))"
                  fill="hsl(var(--chart-2))"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="interest"
                  name="Cumulative Interest"
                  stackId="1"
                  stroke="hsl(var(--chart-5))"
                  fill="hsl(var(--chart-5))"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-background">
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">#</th>
                  <th className="text-left p-2 font-medium">Date</th>
                  <th className="text-right p-2 font-medium">Payment</th>
                  <th className="text-right p-2 font-medium">Principal</th>
                  <th className="text-right p-2 font-medium">Interest</th>
                  <th className="text-right p-2 font-medium">Balance</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((entry) => (
                  <tr
                    key={entry.paymentNumber}
                    className="border-b hover:bg-muted/50"
                  >
                    <td className="p-2 text-muted-foreground">
                      {entry.paymentNumber}
                    </td>
                    <td className="p-2">
                      {format(parseISO(entry.date), "MMM yyyy")}
                    </td>
                    <td className="p-2 text-right">
                      {formatCurrency(entry.payment)}
                    </td>
                    <td className="p-2 text-right text-green-600 dark:text-green-400">
                      {formatCurrency(entry.principal)}
                    </td>
                    <td className="p-2 text-right text-red-600 dark:text-red-400">
                      {formatCurrency(entry.interest)}
                    </td>
                    <td className="p-2 text-right font-medium">
                      {formatCurrency(entry.remainingBalance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

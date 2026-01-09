import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTransactionStore } from "@/stores";
import { formatCurrency } from "@/lib/utils";
import {
  format,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachWeekOfInterval,
  startOfWeek,
  endOfWeek,
} from "date-fns";

type ViewMode = "monthly" | "weekly";

export function SpendingTrends() {
  const [viewMode, setViewMode] = useState<ViewMode>("monthly");
  const { getTransactionsByDateRange } = useTransactionStore();

  const chartData = useMemo(() => {
    const today = new Date();

    if (viewMode === "monthly") {
      const data = [];
      for (let i = 11; i >= 0; i--) {
        const monthDate = subMonths(today, i);
        const start = startOfMonth(monthDate);
        const end = endOfMonth(monthDate);
        const transactions = getTransactionsByDateRange(start, end);

        const income = transactions
          .filter((t) => t.type === "income")
          .reduce((sum, t) => sum + t.amount, 0);

        const expenses = transactions
          .filter((t) => t.type === "expense")
          .reduce((sum, t) => sum + t.amount, 0);

        data.push({
          label: format(monthDate, "MMM yyyy"),
          income,
          expenses,
          savings: income - expenses,
        });
      }
      return data;
    } else {
      // Weekly view - last 12 weeks
      const start = subMonths(today, 3);
      const weeks = eachWeekOfInterval({ start, end: today });

      return weeks.slice(-12).map((weekStart) => {
        const weekEnd = endOfWeek(weekStart);
        const transactions = getTransactionsByDateRange(weekStart, weekEnd);

        const income = transactions
          .filter((t) => t.type === "income")
          .reduce((sum, t) => sum + t.amount, 0);

        const expenses = transactions
          .filter((t) => t.type === "expense")
          .reduce((sum, t) => sum + t.amount, 0);

        return {
          label: format(weekStart, "MMM d"),
          income,
          expenses,
          savings: income - expenses,
        };
      });
    }
  }, [viewMode, getTransactionsByDateRange]);

  const hasData = chartData.some(
    (d) => d.income > 0 || d.expenses > 0
  );

  const averages = useMemo(() => {
    if (!hasData) return { income: 0, expenses: 0, savings: 0 };
    const nonZeroData = chartData.filter(
      (d) => d.income > 0 || d.expenses > 0
    );
    if (nonZeroData.length === 0) return { income: 0, expenses: 0, savings: 0 };

    return {
      income:
        nonZeroData.reduce((sum, d) => sum + d.income, 0) / nonZeroData.length,
      expenses:
        nonZeroData.reduce((sum, d) => sum + d.expenses, 0) / nonZeroData.length,
      savings:
        nonZeroData.reduce((sum, d) => sum + d.savings, 0) / nonZeroData.length,
    };
  }, [chartData, hasData]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Spending Trends</CardTitle>
          <CardDescription>
            Track your income and expenses over time
          </CardDescription>
        </div>
        <Select
          value={viewMode}
          onValueChange={(value) => setViewMode(value as ViewMode)}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Averages */}
        {hasData && (
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Avg Income</p>
              <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                {formatCurrency(averages.income)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Avg Expenses</p>
              <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                {formatCurrency(averages.expenses)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Avg Savings</p>
              <p
                className={`text-lg font-semibold ${
                  averages.savings >= 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {formatCurrency(averages.savings)}
              </p>
            </div>
          </div>
        )}

        {/* Chart */}
        {hasData ? (
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="label"
                  className="text-xs fill-muted-foreground"
                  tick={{ fontSize: 11 }}
                  interval={viewMode === "monthly" ? 0 : 1}
                  angle={viewMode === "weekly" ? -45 : 0}
                  textAnchor={viewMode === "weekly" ? "end" : "middle"}
                  height={viewMode === "weekly" ? 60 : 30}
                />
                <YAxis
                  className="text-xs fill-muted-foreground"
                  tickFormatter={(value) =>
                    value >= 1000 ? `$${value / 1000}k` : `$${value}`
                  }
                />
                <Tooltip
                  formatter={(value) => formatCurrency(value as number)}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="income"
                  name="Income"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  name="Expenses"
                  stroke="hsl(var(--chart-5))"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="savings"
                  name="Net Savings"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[350px] text-muted-foreground">
            <div className="text-center">
              <p>No transaction data yet</p>
              <p className="text-sm">
                Add transactions to see your spending trends
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMortgageStore } from "@/stores";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { format, parseISO } from "date-fns";

export function MortgageOverview() {
  const { mortgage, getMortgageSummary, generateAmortizationSchedule } =
    useMortgageStore();

  const summary = useMemo(() => getMortgageSummary(), [getMortgageSummary]);
  const schedule = useMemo(
    () => generateAmortizationSchedule(mortgage?.extraPaymentAmount || 0),
    [generateAmortizationSchedule, mortgage?.extraPaymentAmount]
  );

  if (!mortgage || !summary) return null;

  // Payment breakdown data
  const paymentBreakdownData = [
    { name: "Principal", value: summary.monthlyBreakdown.principal, color: "hsl(var(--chart-2))" },
    { name: "Interest", value: summary.monthlyBreakdown.interest, color: "hsl(var(--chart-5))" },
    ...(summary.monthlyBreakdown.escrow > 0
      ? [{ name: "Escrow", value: summary.monthlyBreakdown.escrow, color: "hsl(var(--chart-3))" }]
      : []),
    ...(summary.monthlyBreakdown.pmi > 0
      ? [{ name: "PMI", value: summary.monthlyBreakdown.pmi, color: "hsl(var(--chart-4))" }]
      : []),
  ];

  // Equity growth data (sample every 12 payments)
  const equityChartData = schedule
    .filter((_, i) => i % 12 === 0 || i === schedule.length - 1)
    .map((entry) => ({
      date: format(parseISO(entry.date), "yyyy"),
      equity: entry.equity,
      balance: entry.remainingBalance,
    }));

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(mortgage.currentBalance)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Home Equity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(summary.equityAmount)}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatPercent(summary.equityPercentage)} of home
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Monthly Payment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(summary.monthlyBreakdown.total)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Payoff Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {format(parseISO(summary.estimatedPayoffDate), "MMM yyyy")}
            </p>
            <p className="text-sm text-muted-foreground">
              {summary.remainingPayments} payments left
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Payment Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Payment Breakdown</CardTitle>
            <CardDescription>
              Where your {formatCurrency(summary.monthlyBreakdown.total)} goes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 items-center">
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentBreakdownData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {paymentBreakdownData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatCurrency(value as number)}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {paymentBreakdownData.map((item) => (
                  <div key={item.name} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <span className="font-medium">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Equity Growth */}
        <Card>
          <CardHeader>
            <CardTitle>Equity Growth Over Time</CardTitle>
            <CardDescription>
              Watch your home equity grow as you pay down the loan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={equityChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    className="text-xs fill-muted-foreground"
                  />
                  <YAxis
                    className="text-xs fill-muted-foreground"
                    tickFormatter={(value) => `$${value / 1000}k`}
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
                    dataKey="equity"
                    name="Equity"
                    stroke="hsl(var(--chart-2))"
                    fill="hsl(var(--chart-2))"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="balance"
                    name="Remaining Balance"
                    stroke="hsl(var(--chart-5))"
                    fill="hsl(var(--chart-5))"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Total Interest */}
      <Card>
        <CardHeader>
          <CardTitle>Loan Summary</CardTitle>
          <CardDescription>Total costs over the life of the loan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground">Original Loan</p>
              <p className="text-xl font-semibold">
                {formatCurrency(mortgage.originalPrincipal)}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground">Total Interest</p>
              <p className="text-xl font-semibold text-red-600 dark:text-red-400">
                {formatCurrency(summary.totalInterestPaid)}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground">Total Cost</p>
              <p className="text-xl font-semibold">
                {formatCurrency(summary.totalPaid)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

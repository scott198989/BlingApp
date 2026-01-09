import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useMortgageStore } from "@/stores";
import { formatCurrency } from "@/lib/utils";
import { format, parseISO, differenceInMonths } from "date-fns";
import { Calculator, TrendingUp, Clock, DollarSign } from "lucide-react";

export function ExtraPaymentCalculator() {
  const [extraAmount, setExtraAmount] = useState(100);
  const { mortgage, calculateExtraPaymentImpact, generateAmortizationSchedule } =
    useMortgageStore();

  const impact = useMemo(
    () => calculateExtraPaymentImpact(extraAmount),
    [calculateExtraPaymentImpact, extraAmount]
  );

  const originalSchedule = useMemo(
    () => generateAmortizationSchedule(0),
    [generateAmortizationSchedule]
  );

  const newSchedule = useMemo(
    () => generateAmortizationSchedule(extraAmount),
    [generateAmortizationSchedule, extraAmount]
  );

  if (!mortgage || !impact) return null;

  const presets = [50, 100, 200, 500, 1000];

  // Comparison chart data
  const comparisonData = [
    {
      name: "Without Extra",
      totalInterest:
        originalSchedule.length > 0
          ? originalSchedule[originalSchedule.length - 1].cumulativeInterest
          : 0,
      totalPayments: originalSchedule.length,
    },
    {
      name: `With $${extraAmount}/mo`,
      totalInterest:
        newSchedule.length > 0
          ? newSchedule[newSchedule.length - 1].cumulativeInterest
          : 0,
      totalPayments: newSchedule.length,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Calculator Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Extra Payment Calculator
          </CardTitle>
          <CardDescription>
            See how extra payments can save you money and time
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="extraAmount">Monthly Extra Payment</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="extraAmount"
                type="number"
                min="0"
                step="50"
                value={extraAmount}
                onChange={(e) => setExtraAmount(Number(e.target.value))}
                className="pl-7"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <Button
                key={preset}
                variant={extraAmount === preset ? "default" : "outline"}
                size="sm"
                onClick={() => setExtraAmount(preset)}
              >
                ${preset}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Impact Results */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-green-800 dark:text-green-200 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Interest Saved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">
              {formatCurrency(impact.interestSaved)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-800 dark:text-blue-200 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Time Saved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {Math.floor(impact.monthsSaved / 12)} years{" "}
              {impact.monthsSaved % 12} months
            </p>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-purple-800 dark:text-purple-200 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              New Payoff Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              {format(parseISO(impact.newPayoffDate), "MMM yyyy")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Interest Comparison</CardTitle>
          <CardDescription>
            Total interest paid with and without extra payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  type="number"
                  className="text-xs fill-muted-foreground"
                  tickFormatter={(value) => `$${Math.round(value / 1000)}k`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  className="text-xs fill-muted-foreground"
                  width={120}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(value as number)}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="totalInterest" name="Total Interest" radius={[0, 4, 4, 0]}>
                  {comparisonData.map((_, index) => (
                    <Cell
                      key={index}
                      fill={index === 0 ? "hsl(var(--chart-5))" : "hsl(var(--chart-2))"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>Side-by-Side Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium"></th>
                  <th className="text-right p-3 font-medium">Without Extra</th>
                  <th className="text-right p-3 font-medium">
                    With ${extraAmount}/mo Extra
                  </th>
                  <th className="text-right p-3 font-medium text-green-600 dark:text-green-400">
                    Savings
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3 font-medium">Total Payments</td>
                  <td className="p-3 text-right">{originalSchedule.length}</td>
                  <td className="p-3 text-right">{newSchedule.length}</td>
                  <td className="p-3 text-right text-green-600 dark:text-green-400">
                    {impact.monthsSaved} fewer
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-medium">Total Interest</td>
                  <td className="p-3 text-right">
                    {formatCurrency(comparisonData[0].totalInterest)}
                  </td>
                  <td className="p-3 text-right">
                    {formatCurrency(comparisonData[1].totalInterest)}
                  </td>
                  <td className="p-3 text-right text-green-600 dark:text-green-400">
                    {formatCurrency(impact.interestSaved)}
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-medium">Payoff Date</td>
                  <td className="p-3 text-right">
                    {format(parseISO(impact.originalPayoffDate), "MMM yyyy")}
                  </td>
                  <td className="p-3 text-right">
                    {format(parseISO(impact.newPayoffDate), "MMM yyyy")}
                  </td>
                  <td className="p-3 text-right text-green-600 dark:text-green-400">
                    {Math.floor(impact.monthsSaved / 12)}y {impact.monthsSaved % 12}m
                    earlier
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

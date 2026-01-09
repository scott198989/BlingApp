import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
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
import { useRetirementStore, useSettingsStore } from "@/stores";
import { formatCurrency, formatPercent } from "@/lib/utils";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function CombinedOverview() {
  const { accounts, getSummary, getTotalBalance } = useRetirementStore();
  const { settings } = useSettingsStore();

  const totalBalance = useMemo(() => getTotalBalance(), [getTotalBalance]);

  const summary = useMemo(
    () => getSummary(settings.retirementAge, settings.currentAge),
    [getSummary, settings.retirementAge, settings.currentAge]
  );

  // Data for accounts pie chart
  const accountsChartData = useMemo(() => {
    return accounts
      .filter((a) => a.isActive && a.currentBalance > 0)
      .map((account) => ({
        name: account.name,
        value: account.currentBalance,
        percentage: (account.currentBalance / totalBalance) * 100,
      }));
  }, [accounts, totalBalance]);

  // Calculate annual contributions
  const annualContributions = useMemo(() => {
    return accounts
      .filter((a) => a.isActive)
      .reduce((total, account) => {
        let annual = account.contributionAmount;
        if (account.contributionFrequency === "per-paycheck") {
          annual *= 26; // Bi-weekly
        } else if (account.contributionFrequency === "monthly") {
          annual *= 12;
        }
        return total + annual;
      }, 0);
  }, [accounts]);

  // Calculate annual employer match
  const annualEmployerMatch = useMemo(() => {
    return accounts
      .filter((a) => a.isActive && a.employerMatchPercentage)
      .reduce((total, account) => {
        let annual = account.contributionAmount;
        if (account.contributionFrequency === "per-paycheck") {
          annual *= 26;
        } else if (account.contributionFrequency === "monthly") {
          annual *= 12;
        }
        return total + annual * ((account.employerMatchPercentage || 0) / 100);
      }, 0);
  }, [accounts]);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Total Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalBalance)}</p>
            <p className="text-sm text-muted-foreground">
              {summary.accountCount} account{summary.accountCount !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Annual Contributions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(annualContributions)}
            </p>
            <p className="text-sm text-muted-foreground">Your contributions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Employer Match
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(annualEmployerMatch)}
            </p>
            <p className="text-sm text-muted-foreground">Free money/year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Total/Year
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(annualContributions + annualEmployerMatch)}
            </p>
            <p className="text-sm text-muted-foreground">
              Going into retirement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Retirement Projection (if age is set) */}
      {settings.currentAge && settings.retirementAge && summary.projectedBalanceAtRetirement && (
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle>Retirement Projection</CardTitle>
            <CardDescription>
              Based on current contributions and {formatPercent(
                accounts.reduce((sum, a) => sum + a.expectedReturnRate, 0) /
                  accounts.length *
                  100
              )} average return
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="p-4 rounded-lg bg-background/50">
                <p className="text-sm text-muted-foreground">Years to Retirement</p>
                <p className="text-2xl font-bold">{summary.yearsToRetirement}</p>
                <p className="text-sm text-muted-foreground">
                  (Age {settings.currentAge} → {settings.retirementAge})
                </p>
              </div>
              <div className="p-4 rounded-lg bg-background/50">
                <p className="text-sm text-muted-foreground">
                  Projected Balance at {settings.retirementAge}
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(summary.projectedBalanceAtRetirement)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-background/50">
                <p className="text-sm text-muted-foreground">
                  Est. Monthly Income
                </p>
                <p className="text-2xl font-bold">
                  {summary.monthlyIncomeAtRetirement
                    ? formatCurrency(summary.monthlyIncomeAtRetirement)
                    : "—"}
                </p>
                <p className="text-sm text-muted-foreground">4% withdrawal rule</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Account Allocation */}
      {accountsChartData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Account Allocation</CardTitle>
            <CardDescription>
              Distribution of your retirement savings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-2 items-center">
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={accountsChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                    >
                      {accountsChartData.map((_, index) => (
                        <Cell
                          key={index}
                          fill={COLORS[index % COLORS.length]}
                        />
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
                {accountsChartData.map((account, index) => (
                  <div
                    key={account.name}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="font-medium">{account.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(account.value)}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatPercent(account.percentage)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

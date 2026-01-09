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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRetirementStore, useSettingsStore } from "@/stores";
import { formatCurrency } from "@/lib/utils";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function GrowthProjections() {
  const { accounts, getProjections, getCombinedProjections } = useRetirementStore();
  const { settings, updateSettings } = useSettingsStore();

  const [projectionYears, setProjectionYears] = useState(
    settings.retirementAge && settings.currentAge
      ? settings.retirementAge - settings.currentAge
      : 30
  );

  const combinedProjections = useMemo(
    () => getCombinedProjections(projectionYears, settings.currentAge),
    [getCombinedProjections, projectionYears, settings.currentAge]
  );

  // Individual account projections
  const accountProjections = useMemo(() => {
    return accounts
      .filter((a) => a.isActive)
      .map((account) => ({
        account,
        projections: getProjections(account.id, projectionYears, settings.currentAge),
      }));
  }, [accounts, getProjections, projectionYears, settings.currentAge]);

  // Prepare chart data for combined view
  const combinedChartData = useMemo(() => {
    return combinedProjections.map((projection) => ({
      year: projection.age ? `Age ${projection.age}` : `Year ${projection.year}`,
      balance: projection.endingBalance,
      contributions: projection.contributions + projection.employerMatch,
      growth: projection.growth,
    }));
  }, [combinedProjections]);

  // Prepare chart data with individual accounts
  const individualChartData = useMemo(() => {
    if (accountProjections.length === 0) return [];

    return combinedProjections.map((_, yearIndex) => {
      const dataPoint: Record<string, string | number> = {
        year: combinedProjections[yearIndex].age
          ? `Age ${combinedProjections[yearIndex].age}`
          : `Year ${yearIndex}`,
      };

      accountProjections.forEach(({ account, projections }) => {
        if (projections[yearIndex]) {
          dataPoint[account.name] = projections[yearIndex].endingBalance;
        }
      });

      return dataPoint;
    });
  }, [accountProjections, combinedProjections]);

  const finalProjection = combinedProjections[combinedProjections.length - 1];

  return (
    <div className="space-y-6">
      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Projection Settings</CardTitle>
          <CardDescription>
            Adjust your age and projection timeline
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="currentAge">Current Age</Label>
              <Input
                id="currentAge"
                type="number"
                min="18"
                max="100"
                value={settings.currentAge || ""}
                onChange={(e) =>
                  updateSettings({ currentAge: Number(e.target.value) || undefined })
                }
                placeholder="e.g., 30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="retirementAge">Target Retirement Age</Label>
              <Input
                id="retirementAge"
                type="number"
                min="30"
                max="100"
                value={settings.retirementAge || ""}
                onChange={(e) =>
                  updateSettings({ retirementAge: Number(e.target.value) || undefined })
                }
                placeholder="e.g., 65"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="projectionYears">Projection Years</Label>
              <Input
                id="projectionYears"
                type="number"
                min="5"
                max="50"
                value={projectionYears}
                onChange={(e) => setProjectionYears(Number(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Combined Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Combined Growth Projection</CardTitle>
          <CardDescription>
            Total retirement savings over {projectionYears} years
            {finalProjection && (
              <span className="ml-2 text-foreground font-medium">
                → {formatCurrency(finalProjection.endingBalance)}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={combinedChartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="year"
                  className="text-xs fill-muted-foreground"
                  interval={Math.floor(projectionYears / 6)}
                />
                <YAxis
                  className="text-xs fill-muted-foreground"
                  tickFormatter={(value) =>
                    value >= 1000000
                      ? `$${(value / 1000000).toFixed(1)}M`
                      : `$${Math.round(value / 1000)}k`
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
                  dataKey="balance"
                  name="Total Balance"
                  stroke="hsl(var(--chart-2))"
                  fill="hsl(var(--chart-2))"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Individual Account Growth */}
      {accountProjections.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Individual Account Growth</CardTitle>
            <CardDescription>
              See how each account contributes to your total
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={individualChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="year"
                    className="text-xs fill-muted-foreground"
                    interval={Math.floor(projectionYears / 6)}
                  />
                  <YAxis
                    className="text-xs fill-muted-foreground"
                    tickFormatter={(value) =>
                      value >= 1000000
                        ? `$${(value / 1000000).toFixed(1)}M`
                        : `$${Math.round(value / 1000)}k`
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
                  {accountProjections.map(({ account }, index) => (
                    <Area
                      key={account.id}
                      type="monotone"
                      dataKey={account.name}
                      stackId="1"
                      stroke={COLORS[index % COLORS.length]}
                      fill={COLORS[index % COLORS.length]}
                      fillOpacity={0.6}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Projection Table */}
      <Card>
        <CardHeader>
          <CardTitle>Year-by-Year Breakdown</CardTitle>
          <CardDescription>
            Detailed view of contributions, growth, and balance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-background">
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">
                    {settings.currentAge ? "Age" : "Year"}
                  </th>
                  <th className="text-right p-2 font-medium">Contributions</th>
                  <th className="text-right p-2 font-medium">Employer Match</th>
                  <th className="text-right p-2 font-medium">Growth</th>
                  <th className="text-right p-2 font-medium">Balance</th>
                </tr>
              </thead>
              <tbody>
                {combinedProjections.map((projection, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-2">
                      {projection.age || `Year ${projection.year}`}
                    </td>
                    <td className="p-2 text-right text-green-600 dark:text-green-400">
                      {projection.contributions > 0
                        ? formatCurrency(projection.contributions)
                        : "—"}
                    </td>
                    <td className="p-2 text-right text-blue-600 dark:text-blue-400">
                      {projection.employerMatch > 0
                        ? formatCurrency(projection.employerMatch)
                        : "—"}
                    </td>
                    <td className="p-2 text-right text-purple-600 dark:text-purple-400">
                      {projection.growth > 0
                        ? formatCurrency(projection.growth)
                        : "—"}
                    </td>
                    <td className="p-2 text-right font-medium">
                      {formatCurrency(projection.endingBalance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

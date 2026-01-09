import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTransactionStore, useCategoryStore } from "@/stores";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { startOfMonth, endOfMonth } from "date-fns";

export function CategoryBreakdown() {
  const { getTransactionsByDateRange, getSpendingByCategory } =
    useTransactionStore();
  const { categories } = useCategoryStore();

  const categoryData = useMemo(() => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    const transactions = getTransactionsByDateRange(start, end);

    const categoryInfo = categories.map((c) => ({
      id: c.id,
      name: c.name,
      color: c.color,
    }));

    return getSpendingByCategory(transactions, categoryInfo).map((item) => ({
      ...item,
      name: item.categoryName,
      value: item.total,
    }));
  }, [getTransactionsByDateRange, getSpendingByCategory, categories]);

  const totalSpending = useMemo(() => {
    return categoryData.reduce((sum, cat) => sum + cat.total, 0);
  }, [categoryData]);

  if (categoryData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
          <CardDescription>This month's expense breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[400px] text-muted-foreground">
            <div className="text-center">
              <p>No expense data for this month</p>
              <p className="text-sm">Add some transactions to see the breakdown</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
        <CardDescription>
          This month: {formatCurrency(totalSpending)} total
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Pie Chart */}
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="total"
                  nameKey="categoryName"
                >
                  {categoryData.map((entry) => (
                    <Cell key={entry.categoryId} fill={entry.color} />
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

          {/* Category List */}
          <div className="space-y-3">
            {categoryData.map((category) => (
              <div
                key={category.categoryId}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <div>
                    <p className="font-medium">{category.categoryName}</p>
                    <p className="text-sm text-muted-foreground">
                      {category.count} transaction{category.count !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(category.total)}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatPercent(category.percentage)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  DollarSign,
  TrendingUp,
  Home,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTransactionStore, useMortgageStore, useRetirementStore } from "@/stores";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { SpendingOverviewChart } from "./SpendingOverviewChart";
import { RecentTransactions } from "./RecentTransactions";

export function DashboardPage() {
  const navigate = useNavigate();
  const { getMonthlyTotals, transactions } = useTransactionStore();
  const { mortgage, getMortgageSummary } = useMortgageStore();
  const { getTotalBalance, accounts } = useRetirementStore();

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const monthlyTotals = useMemo(
    () => getMonthlyTotals(currentYear, currentMonth),
    [getMonthlyTotals, currentYear, currentMonth]
  );

  const lastMonthTotals = useMemo(
    () =>
      getMonthlyTotals(
        currentMonth === 0 ? currentYear - 1 : currentYear,
        currentMonth === 0 ? 11 : currentMonth - 1
      ),
    [getMonthlyTotals, currentYear, currentMonth]
  );

  const mortgageSummary = useMemo(() => getMortgageSummary(), [getMortgageSummary]);
  const retirementBalance = useMemo(() => getTotalBalance(), [getTotalBalance]);

  const netWorth = useMemo(() => {
    const equity = mortgageSummary?.equityAmount || 0;
    return equity + retirementBalance;
  }, [mortgageSummary, retirementBalance]);

  const savingsRate = useMemo(() => {
    if (monthlyTotals.income === 0) return 0;
    return ((monthlyTotals.income - monthlyTotals.expenses) / monthlyTotals.income) * 100;
  }, [monthlyTotals]);

  const spendingChange = useMemo(() => {
    if (lastMonthTotals.expenses === 0) return 0;
    return (
      ((monthlyTotals.expenses - lastMonthTotals.expenses) /
        lastMonthTotals.expenses) *
      100
    );
  }, [monthlyTotals, lastMonthTotals]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Your financial overview at a glance
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate("/spending")} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Getting Started Guide - shows when no data */}
      {transactions.length === 0 && !mortgage && accounts.length === 0 && (
        <div>
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle>Welcome to BlingApp!</CardTitle>
              <CardDescription>
                Get started by adding your financial data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <Button
                  variant="outline"
                  className="h-auto flex-col gap-2 p-4"
                  onClick={() => navigate("/spending")}
                >
                  <CreditCard className="h-8 w-8 text-primary" />
                  <div className="text-center">
                    <p className="font-medium">Track Spending</p>
                    <p className="text-xs text-muted-foreground">
                      Add income & expenses
                    </p>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col gap-2 p-4"
                  onClick={() => navigate("/mortgage")}
                >
                  <Home className="h-8 w-8 text-primary" />
                  <div className="text-center">
                    <p className="font-medium">Add Mortgage</p>
                    <p className="text-xs text-muted-foreground">
                      Track home equity
                    </p>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col gap-2 p-4"
                  onClick={() => navigate("/retirement")}
                >
                  <TrendingUp className="h-8 w-8 text-primary" />
                  <div className="text-center">
                    <p className="font-medium">Add 401k</p>
                    <p className="text-xs text-muted-foreground">
                      Track retirement accounts
                    </p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Net Worth */}
        <div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Net Worth
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(netWorth)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Retirement + Home Equity
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Spending */}
        <div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Monthly Spending
              </CardTitle>
              {spendingChange > 0 ? (
                <ArrowUpRight className="h-4 w-4 text-destructive" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-positive" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(monthlyTotals.expenses)}
              </div>
              <p
                className={`text-xs mt-1 ${
                  spendingChange > 0 ? "text-destructive" : "text-positive"
                }`}
              >
                {spendingChange > 0 ? "+" : ""}
                {formatPercent(spendingChange)} from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Savings Rate */}
        <div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Savings Rate
              </CardTitle>
              <PiggyBank className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatPercent(savingsRate)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {savingsRate >= 20 ? "Great progress!" : "Aim for 20%+"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Retirement Balance */}
        <div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Retirement
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(retirementBalance)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {accounts.length} account{accounts.length !== 1 ? "s" : ""}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
        {/* Spending Chart */}
        <div className="lg:col-span-4">
          <SpendingOverviewChart />
        </div>

        {/* Recent Transactions */}
        <div className="lg:col-span-3">
          <RecentTransactions />
        </div>
      </div>

      {/* Mortgage Summary (if exists) */}
      {mortgage && mortgageSummary && (
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Mortgage Overview
              </CardTitle>
              <CardDescription>{mortgage.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
                <div>
                  <p className="text-sm text-muted-foreground">Current Balance</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(mortgage.currentBalance)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Home Equity</p>
                  <p className="text-lg font-semibold text-positive">
                    {formatCurrency(mortgageSummary.equityAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Payment</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(mortgageSummary.monthlyBreakdown.total)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Equity %</p>
                  <p className="text-lg font-semibold">
                    {formatPercent(mortgageSummary.equityPercentage)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

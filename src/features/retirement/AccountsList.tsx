import { Pencil, Building2, TrendingUp, Percent } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRetirementStore } from "@/stores";
import { formatCurrency, formatPercent } from "@/lib/utils";
import type { RetirementAccount } from "@/types";

interface AccountsListProps {
  onEdit: (account: RetirementAccount) => void;
}

const accountTypeLabels: Record<string, string> = {
  "401k": "401(k)",
  "roth-401k": "Roth 401(k)",
  ira: "Traditional IRA",
  "roth-ira": "Roth IRA",
  "403b": "403(b)",
  pension: "Pension",
};

export function AccountsList({ onEdit }: AccountsListProps) {
  const { accounts } = useRetirementStore();

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {accounts.map((account) => (
        <Card key={account.id} className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4"
            onClick={() => onEdit(account)}
          >
            <Pencil className="h-4 w-4" />
          </Button>

          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">{account.name}</CardTitle>
                <CardDescription>
                  {accountTypeLabels[account.accountType]} • {account.provider}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Balance */}
            <div>
              <p className="text-3xl font-bold">
                {formatCurrency(account.currentBalance)}
              </p>
              <p className="text-sm text-muted-foreground">Current Balance</p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              {/* Contribution */}
              <div>
                <p className="text-sm text-muted-foreground">Contribution</p>
                <p className="font-semibold">
                  {formatCurrency(account.contributionAmount)}
                  <span className="text-sm font-normal text-muted-foreground">
                    {" "}
                    /{" "}
                    {account.contributionFrequency === "per-paycheck"
                      ? "paycheck"
                      : account.contributionFrequency}
                  </span>
                </p>
              </div>

              {/* Expected Return */}
              <div>
                <p className="text-sm text-muted-foreground">Expected Return</p>
                <p className="font-semibold">
                  {formatPercent(account.expectedReturnRate * 100)}/year
                </p>
              </div>

              {/* Employer Match */}
              {account.employerMatchPercentage !== undefined &&
                account.employerMatchPercentage > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground">Employer Match</p>
                    <p className="font-semibold text-green-600 dark:text-green-400">
                      {formatPercent(account.employerMatchPercentage)}
                    </p>
                  </div>
                )}

              {/* Vesting */}
              <div>
                <p className="text-sm text-muted-foreground">Vesting</p>
                <p className="font-semibold">
                  {formatPercent(account.vestingPercentage)}
                </p>
              </div>
            </div>

            {/* Employer */}
            {account.employerName && (
              <div className="flex items-center gap-2 pt-2 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" />
                {account.employerName}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

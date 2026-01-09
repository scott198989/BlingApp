import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRetirementStore } from "@/stores";
import type { RetirementAccount, RetirementAccountType, ContributionFrequency } from "@/types";

const accountSchema = z.object({
  name: z.string().min(1, "Name is required"),
  accountType: z.enum(["401k", "roth-401k", "ira", "roth-ira", "403b", "pension"]),
  provider: z.string().min(1, "Provider is required"),
  currentBalance: z.coerce.number().min(0, "Balance cannot be negative"),
  employerName: z.string().optional(),
  contributionAmount: z.coerce.number().min(0, "Contribution cannot be negative"),
  contributionFrequency: z.enum(["per-paycheck", "monthly", "yearly"]),
  employerMatchPercentage: z.coerce.number().min(0).max(100).optional(),
  employerMatchLimit: z.coerce.number().min(0).max(100).optional(),
  vestingPercentage: z.coerce.number().min(0).max(100),
  expectedReturnRate: z.coerce.number().min(0).max(100),
  notes: z.string().optional(),
});

type AccountFormData = z.infer<typeof accountSchema>;

interface AccountFormProps {
  open: boolean;
  onClose: () => void;
  account: RetirementAccount | null;
}

export function AccountForm({ open, onClose, account }: AccountFormProps) {
  const { addAccount, updateAccount, deleteAccount } = useRetirementStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema) as any,
    defaultValues: {
      name: "",
      accountType: "401k",
      provider: "",
      currentBalance: 0,
      employerName: "",
      contributionAmount: 0,
      contributionFrequency: "per-paycheck",
      employerMatchPercentage: 0,
      employerMatchLimit: 6,
      vestingPercentage: 100,
      expectedReturnRate: 7,
      notes: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (account) {
        reset({
          name: account.name,
          accountType: account.accountType,
          provider: account.provider,
          currentBalance: account.currentBalance,
          employerName: account.employerName || "",
          contributionAmount: account.contributionAmount,
          contributionFrequency: account.contributionFrequency,
          employerMatchPercentage: account.employerMatchPercentage || 0,
          employerMatchLimit: account.employerMatchLimit || 6,
          vestingPercentage: account.vestingPercentage,
          expectedReturnRate: account.expectedReturnRate * 100,
          notes: account.notes || "",
        });
      } else {
        reset({
          name: "",
          accountType: "401k",
          provider: "",
          currentBalance: 0,
          employerName: "",
          contributionAmount: 0,
          contributionFrequency: "per-paycheck",
          employerMatchPercentage: 0,
          employerMatchLimit: 6,
          vestingPercentage: 100,
          expectedReturnRate: 7,
          notes: "",
        });
      }
    }
  }, [open, account, reset]);

  const onSubmit = (data: AccountFormData) => {
    const accountData = {
      name: data.name,
      accountType: data.accountType as RetirementAccountType,
      provider: data.provider,
      currentBalance: data.currentBalance,
      employerName: data.employerName,
      contributionAmount: data.contributionAmount,
      contributionFrequency: data.contributionFrequency as ContributionFrequency,
      employerMatchPercentage: data.employerMatchPercentage,
      employerMatchLimit: data.employerMatchLimit,
      vestingPercentage: data.vestingPercentage,
      expectedReturnRate: data.expectedReturnRate / 100,
      notes: data.notes,
      isActive: true,
    };

    if (account) {
      updateAccount(account.id, accountData);
    } else {
      addAccount(accountData);
    }
    onClose();
  };

  const handleDelete = () => {
    if (account) {
      deleteAccount(account.id);
      onClose();
    }
  };

  const accountTypes: { value: RetirementAccountType; label: string }[] = [
    { value: "401k", label: "401(k)" },
    { value: "roth-401k", label: "Roth 401(k)" },
    { value: "ira", label: "Traditional IRA" },
    { value: "roth-ira", label: "Roth IRA" },
    { value: "403b", label: "403(b)" },
    { value: "pension", label: "Pension" },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {account ? "Edit Account" : "Add Retirement Account"}
          </DialogTitle>
          <DialogDescription>
            {account
              ? "Update your retirement account details."
              : "Add a new retirement account to track."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Account Name</Label>
            <Input
              id="name"
              placeholder="e.g., Company 401k"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Account Type */}
            <div className="space-y-2">
              <Label htmlFor="accountType">Account Type</Label>
              <Select
                value={watch("accountType")}
                onValueChange={(value) =>
                  setValue("accountType", value as RetirementAccountType)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {accountTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Provider */}
            <div className="space-y-2">
              <Label htmlFor="provider">Provider</Label>
              <Input
                id="provider"
                placeholder="e.g., Fidelity"
                {...register("provider")}
              />
            </div>
          </div>

          {/* Current Balance */}
          <div className="space-y-2">
            <Label htmlFor="currentBalance">Current Balance</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="currentBalance"
                type="number"
                step="0.01"
                min="0"
                className="pl-7"
                {...register("currentBalance")}
              />
            </div>
          </div>

          {/* Employer Name */}
          <div className="space-y-2">
            <Label htmlFor="employerName">Employer Name (Optional)</Label>
            <Input
              id="employerName"
              placeholder="e.g., Acme Corp"
              {...register("employerName")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Contribution Amount */}
            <div className="space-y-2">
              <Label htmlFor="contributionAmount">Contribution Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="contributionAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  className="pl-7"
                  {...register("contributionAmount")}
                />
              </div>
            </div>

            {/* Contribution Frequency */}
            <div className="space-y-2">
              <Label htmlFor="contributionFrequency">Frequency</Label>
              <Select
                value={watch("contributionFrequency")}
                onValueChange={(value) =>
                  setValue("contributionFrequency", value as ContributionFrequency)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="per-paycheck">Per Paycheck</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Employer Match */}
            <div className="space-y-2">
              <Label htmlFor="employerMatchPercentage">Employer Match %</Label>
              <div className="relative">
                <Input
                  id="employerMatchPercentage"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  className="pr-7"
                  {...register("employerMatchPercentage")}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  %
                </span>
              </div>
            </div>

            {/* Vesting */}
            <div className="space-y-2">
              <Label htmlFor="vestingPercentage">Vesting %</Label>
              <div className="relative">
                <Input
                  id="vestingPercentage"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  className="pr-7"
                  {...register("vestingPercentage")}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  %
                </span>
              </div>
            </div>
          </div>

          {/* Expected Return Rate */}
          <div className="space-y-2">
            <Label htmlFor="expectedReturnRate">
              Expected Annual Return Rate
            </Label>
            <div className="relative">
              <Input
                id="expectedReturnRate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                className="pr-7"
                {...register("expectedReturnRate")}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                %
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Historical S&P 500 average: ~10%
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              placeholder="Any additional notes..."
              {...register("notes")}
            />
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {account && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                className="w-full sm:w-auto"
              >
                Delete Account
              </Button>
            )}
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1 sm:flex-none">
                {account ? "Update" : "Add"} Account
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

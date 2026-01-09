import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
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
import { useMortgageStore } from "@/stores";

const mortgageSchema = z.object({
  name: z.string().min(1, "Name is required"),
  propertyAddress: z.string().optional(),
  originalPrincipal: z.coerce.number().positive("Principal must be positive"),
  currentBalance: z.coerce.number().min(0, "Balance cannot be negative"),
  interestRate: z.coerce.number().min(0).max(100, "Invalid interest rate"),
  termYears: z.coerce.number().min(1).max(50, "Term must be 1-50 years"),
  startDate: z.string().min(1, "Start date is required"),
  paymentDay: z.coerce.number().min(1).max(28, "Day must be 1-28"),
  extraPaymentAmount: z.coerce.number().min(0).optional(),
  escrowAmount: z.coerce.number().min(0).optional(),
  pmiAmount: z.coerce.number().min(0).optional(),
});

type MortgageFormData = z.infer<typeof mortgageSchema>;

interface MortgageFormProps {
  open: boolean;
  onClose: () => void;
}

export function MortgageForm({ open, onClose }: MortgageFormProps) {
  const { mortgage, setMortgage, updateMortgage, deleteMortgage } =
    useMortgageStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MortgageFormData>({
    resolver: zodResolver(mortgageSchema) as any,
    defaultValues: {
      name: "",
      propertyAddress: "",
      originalPrincipal: 0,
      currentBalance: 0,
      interestRate: 6.5,
      termYears: 30,
      startDate: format(new Date(), "yyyy-MM-dd"),
      paymentDay: 1,
      extraPaymentAmount: 0,
      escrowAmount: 0,
      pmiAmount: 0,
    },
  });

  useEffect(() => {
    if (open) {
      if (mortgage) {
        reset({
          name: mortgage.name,
          propertyAddress: mortgage.propertyAddress || "",
          originalPrincipal: mortgage.originalPrincipal,
          currentBalance: mortgage.currentBalance,
          interestRate: mortgage.interestRate * 100,
          termYears: mortgage.termMonths / 12,
          startDate: mortgage.startDate.split("T")[0],
          paymentDay: mortgage.paymentDay,
          extraPaymentAmount: mortgage.extraPaymentAmount || 0,
          escrowAmount: mortgage.escrowAmount || 0,
          pmiAmount: mortgage.pmiAmount || 0,
        });
      } else {
        reset({
          name: "",
          propertyAddress: "",
          originalPrincipal: 0,
          currentBalance: 0,
          interestRate: 6.5,
          termYears: 30,
          startDate: format(new Date(), "yyyy-MM-dd"),
          paymentDay: 1,
          extraPaymentAmount: 0,
          escrowAmount: 0,
          pmiAmount: 0,
        });
      }
    }
  }, [open, mortgage, reset]);

  const onSubmit = (data: MortgageFormData) => {
    const mortgageData = {
      name: data.name,
      propertyAddress: data.propertyAddress,
      originalPrincipal: data.originalPrincipal,
      currentBalance: data.currentBalance || data.originalPrincipal,
      interestRate: data.interestRate / 100,
      termMonths: data.termYears * 12,
      startDate: new Date(data.startDate).toISOString(),
      paymentDay: data.paymentDay,
      monthlyPayment: 0,
      extraPaymentAmount: data.extraPaymentAmount,
      escrowAmount: data.escrowAmount,
      pmiAmount: data.pmiAmount,
      isActive: true,
    };

    if (mortgage) {
      updateMortgage(mortgageData);
    } else {
      setMortgage(mortgageData);
    }
    onClose();
  };

  const handleDelete = () => {
    deleteMortgage();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mortgage ? "Edit Mortgage" : "Add Mortgage"}
          </DialogTitle>
          <DialogDescription>
            Enter your mortgage details to track payments and equity.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Mortgage Name</Label>
            <Input
              id="name"
              placeholder="e.g., Primary Home"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Property Address */}
          <div className="space-y-2">
            <Label htmlFor="propertyAddress">Property Address (Optional)</Label>
            <Input
              id="propertyAddress"
              placeholder="123 Main St, City, State"
              {...register("propertyAddress")}
            />
          </div>

          {/* Original Principal */}
          <div className="space-y-2">
            <Label htmlFor="originalPrincipal">Original Loan Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="originalPrincipal"
                type="number"
                step="0.01"
                min="0"
                className="pl-7"
                {...register("originalPrincipal")}
              />
            </div>
            {errors.originalPrincipal && (
              <p className="text-sm text-destructive">
                {errors.originalPrincipal.message}
              </p>
            )}
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
            {errors.currentBalance && (
              <p className="text-sm text-destructive">
                {errors.currentBalance.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Interest Rate */}
            <div className="space-y-2">
              <Label htmlFor="interestRate">Interest Rate (%)</Label>
              <div className="relative">
                <Input
                  id="interestRate"
                  type="number"
                  step="0.001"
                  min="0"
                  max="100"
                  className="pr-7"
                  {...register("interestRate")}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  %
                </span>
              </div>
              {errors.interestRate && (
                <p className="text-sm text-destructive">
                  {errors.interestRate.message}
                </p>
              )}
            </div>

            {/* Term */}
            <div className="space-y-2">
              <Label htmlFor="termYears">Loan Term (Years)</Label>
              <Input
                id="termYears"
                type="number"
                min="1"
                max="50"
                {...register("termYears")}
              />
              {errors.termYears && (
                <p className="text-sm text-destructive">
                  {errors.termYears.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="startDate">Loan Start Date</Label>
              <Input id="startDate" type="date" {...register("startDate")} />
              {errors.startDate && (
                <p className="text-sm text-destructive">
                  {errors.startDate.message}
                </p>
              )}
            </div>

            {/* Payment Day */}
            <div className="space-y-2">
              <Label htmlFor="paymentDay">Payment Day of Month</Label>
              <Input
                id="paymentDay"
                type="number"
                min="1"
                max="28"
                {...register("paymentDay")}
              />
              {errors.paymentDay && (
                <p className="text-sm text-destructive">
                  {errors.paymentDay.message}
                </p>
              )}
            </div>
          </div>

          {/* Optional: Extra Payment */}
          <div className="space-y-2">
            <Label htmlFor="extraPaymentAmount">
              Monthly Extra Payment (Optional)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="extraPaymentAmount"
                type="number"
                step="0.01"
                min="0"
                className="pl-7"
                {...register("extraPaymentAmount")}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Escrow */}
            <div className="space-y-2">
              <Label htmlFor="escrowAmount">Monthly Escrow (Optional)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="escrowAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  className="pl-7"
                  {...register("escrowAmount")}
                />
              </div>
            </div>

            {/* PMI */}
            <div className="space-y-2">
              <Label htmlFor="pmiAmount">Monthly PMI (Optional)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="pmiAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  className="pl-7"
                  {...register("pmiAmount")}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {mortgage && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                className="w-full sm:w-auto"
              >
                Delete Mortgage
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
                {mortgage ? "Update" : "Add"} Mortgage
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

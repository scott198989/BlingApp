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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTransactionStore, useCategoryStore } from "@/stores";
import type { Transaction, TransactionType } from "@/types";

const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.coerce.number().positive("Amount must be positive"),
  description: z.string().min(1, "Description is required"),
  categoryId: z.string().min(1, "Category is required"),
  date: z.string().min(1, "Date is required"),
  notes: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  open: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export function TransactionForm({
  open,
  onClose,
  transaction,
}: TransactionFormProps) {
  const { addTransaction, updateTransaction } = useTransactionStore();
  const { categories, getCategoriesByType } = useCategoryStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema) as any,
    defaultValues: {
      type: "expense",
      amount: 0,
      description: "",
      categoryId: "",
      date: format(new Date(), "yyyy-MM-dd"),
      notes: "",
    },
  });

  const watchType = watch("type");
  const filteredCategories = getCategoriesByType(watchType);

  // Reset form when dialog opens/closes or transaction changes
  useEffect(() => {
    if (open) {
      if (transaction) {
        reset({
          type: transaction.type,
          amount: transaction.amount,
          description: transaction.description,
          categoryId: transaction.categoryId,
          date: transaction.date.split("T")[0],
          notes: transaction.notes || "",
        });
      } else {
        reset({
          type: "expense",
          amount: 0,
          description: "",
          categoryId: "",
          date: format(new Date(), "yyyy-MM-dd"),
          notes: "",
        });
      }
    }
  }, [open, transaction, reset]);

  // Reset category when type changes (if not editing)
  useEffect(() => {
    if (!transaction) {
      setValue("categoryId", "");
    }
  }, [watchType, transaction, setValue]);

  const onSubmit = (data: TransactionFormData) => {
    if (transaction) {
      updateTransaction(transaction.id, {
        type: data.type,
        amount: data.amount,
        description: data.description,
        categoryId: data.categoryId,
        date: new Date(data.date).toISOString(),
        notes: data.notes,
      });
    } else {
      addTransaction({
        type: data.type,
        amount: data.amount,
        description: data.description,
        categoryId: data.categoryId,
        date: new Date(data.date).toISOString(),
        notes: data.notes,
        isRecurring: false,
      });
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {transaction ? "Edit Transaction" : "Add Transaction"}
          </DialogTitle>
          <DialogDescription>
            {transaction
              ? "Update the transaction details below."
              : "Enter the details for your new transaction."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Type Selection */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              type="button"
              variant={watchType === "expense" ? "default" : "outline"}
              className="w-full"
              onClick={() => setValue("type", "expense")}
            >
              Expense
            </Button>
            <Button
              type="button"
              variant={watchType === "income" ? "default" : "outline"}
              className="w-full"
              onClick={() => setValue("type", "income")}
            >
              Income
            </Button>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className="pl-7"
                {...register("amount")}
              />
            </div>
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="What was this for?"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={watch("categoryId")}
              onValueChange={(value) => setValue("categoryId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && (
              <p className="text-sm text-destructive">
                {errors.categoryId.message}
              </p>
            )}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" {...register("date")} />
            {errors.date && (
              <p className="text-sm text-destructive">{errors.date.message}</p>
            )}
          </div>

          {/* Notes (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              placeholder="Any additional details..."
              {...register("notes")}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {transaction ? "Update" : "Add"} Transaction
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

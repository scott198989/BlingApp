import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Mortgage,
  AmortizationEntry,
  MortgageSummary,
  ExtraPaymentScenario,
} from "@/types";
import { generateId } from "@/lib/utils";
import { addMonths, format } from "date-fns";

interface MortgageState {
  mortgage: Mortgage | null;

  // CRUD
  setMortgage: (
    mortgage: Omit<Mortgage, "id" | "createdAt" | "updatedAt">
  ) => void;
  updateMortgage: (updates: Partial<Mortgage>) => void;
  deleteMortgage: () => void;

  // Calculations
  calculateMonthlyPayment: (
    principal: number,
    annualRate: number,
    termMonths: number
  ) => number;
  generateAmortizationSchedule: (extraPayment?: number) => AmortizationEntry[];
  getMortgageSummary: () => MortgageSummary | null;
  calculateExtraPaymentImpact: (extraMonthly: number) => ExtraPaymentScenario | null;
}

export const useMortgageStore = create<MortgageState>()(
  persist(
    (set, get) => ({
      mortgage: null,

      setMortgage: (mortgageData) => {
        const now = new Date().toISOString();
        const monthlyPayment = get().calculateMonthlyPayment(
          mortgageData.originalPrincipal,
          mortgageData.interestRate,
          mortgageData.termMonths
        );
        const mortgage: Mortgage = {
          ...mortgageData,
          monthlyPayment,
          currentBalance: mortgageData.currentBalance || mortgageData.originalPrincipal,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set({ mortgage });
      },

      updateMortgage: (updates) => {
        set((state) => {
          if (!state.mortgage) return state;
          const updated = {
            ...state.mortgage,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
          // Recalculate monthly payment if relevant fields changed
          if (
            updates.originalPrincipal ||
            updates.interestRate ||
            updates.termMonths
          ) {
            updated.monthlyPayment = get().calculateMonthlyPayment(
              updated.originalPrincipal,
              updated.interestRate,
              updated.termMonths
            );
          }
          return { mortgage: updated };
        });
      },

      deleteMortgage: () => {
        set({ mortgage: null });
      },

      calculateMonthlyPayment: (principal, annualRate, termMonths) => {
        const monthlyRate = annualRate / 12;
        if (monthlyRate === 0) return principal / termMonths;
        return (
          principal *
          ((monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
            (Math.pow(1 + monthlyRate, termMonths) - 1))
        );
      },

      generateAmortizationSchedule: (extraPayment = 0) => {
        const { mortgage } = get();
        if (!mortgage) return [];

        const schedule: AmortizationEntry[] = [];
        const monthlyRate = mortgage.interestRate / 12;
        const startDate = new Date(mortgage.startDate);

        let balance = mortgage.originalPrincipal;
        let cumulativePrincipal = 0;
        let cumulativeInterest = 0;

        for (let i = 1; balance > 0.01 && i <= mortgage.termMonths * 2; i++) {
          const interest = balance * monthlyRate;
          let principalPayment =
            mortgage.monthlyPayment - interest + extraPayment;

          if (principalPayment > balance) {
            principalPayment = balance;
          }

          balance -= principalPayment;
          cumulativePrincipal += principalPayment;
          cumulativeInterest += interest;

          const paymentDate = addMonths(startDate, i);

          schedule.push({
            paymentNumber: i,
            date: format(paymentDate, "yyyy-MM-dd"),
            payment: mortgage.monthlyPayment + extraPayment,
            principal: principalPayment,
            interest,
            extraPayment,
            remainingBalance: Math.max(0, balance),
            cumulativePrincipal,
            cumulativeInterest,
            equity: cumulativePrincipal,
          });

          if (balance <= 0) break;
        }

        return schedule;
      },

      getMortgageSummary: () => {
        const { mortgage } = get();
        if (!mortgage) return null;

        const schedule = get().generateAmortizationSchedule(
          mortgage.extraPaymentAmount || 0
        );
        if (schedule.length === 0) return null;

        const lastEntry = schedule[schedule.length - 1];
        const monthlyRate = mortgage.interestRate / 12;
        const currentInterest = mortgage.currentBalance * monthlyRate;
        const currentPrincipal = mortgage.monthlyPayment - currentInterest;

        return {
          originalPrincipal: mortgage.originalPrincipal,
          currentBalance: mortgage.currentBalance,
          equityAmount: mortgage.originalPrincipal - mortgage.currentBalance,
          equityPercentage:
            ((mortgage.originalPrincipal - mortgage.currentBalance) /
              mortgage.originalPrincipal) *
            100,
          totalPaid: lastEntry.cumulativePrincipal + lastEntry.cumulativeInterest,
          totalInterestPaid: lastEntry.cumulativeInterest,
          remainingPayments: schedule.length,
          estimatedPayoffDate: lastEntry.date,
          monthlyBreakdown: {
            principal: currentPrincipal,
            interest: currentInterest,
            escrow: mortgage.escrowAmount || 0,
            pmi: mortgage.pmiAmount || 0,
            total:
              mortgage.monthlyPayment +
              (mortgage.escrowAmount || 0) +
              (mortgage.pmiAmount || 0),
          },
        };
      },

      calculateExtraPaymentImpact: (extraMonthly) => {
        const { mortgage } = get();
        if (!mortgage) return null;

        const originalSchedule = get().generateAmortizationSchedule(0);
        const newSchedule = get().generateAmortizationSchedule(extraMonthly);

        if (originalSchedule.length === 0 || newSchedule.length === 0)
          return null;

        const originalLast = originalSchedule[originalSchedule.length - 1];
        const newLast = newSchedule[newSchedule.length - 1];

        return {
          extraAmount: extraMonthly,
          originalPayoffDate: originalLast.date,
          newPayoffDate: newLast.date,
          monthsSaved: originalSchedule.length - newSchedule.length,
          interestSaved:
            originalLast.cumulativeInterest - newLast.cumulativeInterest,
        };
      },
    }),
    {
      name: "blingapp-mortgage",
      version: 1,
    }
  )
);

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  RetirementAccount,
  Contribution,
  RetirementProjection,
  RetirementSummary,
} from "@/types";
import { generateId } from "@/lib/utils";

interface RetirementState {
  accounts: RetirementAccount[];
  contributions: Contribution[];

  // Account CRUD
  addAccount: (
    account: Omit<RetirementAccount, "id" | "createdAt" | "updatedAt">
  ) => void;
  updateAccount: (id: string, updates: Partial<RetirementAccount>) => void;
  deleteAccount: (id: string) => void;
  getAccountById: (id: string) => RetirementAccount | undefined;

  // Contribution CRUD
  addContribution: (
    contribution: Omit<Contribution, "id" | "createdAt" | "updatedAt">
  ) => void;
  updateContribution: (id: string, updates: Partial<Contribution>) => void;
  deleteContribution: (id: string) => void;
  getContributionsByAccount: (accountId: string) => Contribution[];

  // Calculations
  getProjections: (
    accountId: string,
    years: number,
    currentAge?: number
  ) => RetirementProjection[];
  getCombinedProjections: (
    years: number,
    currentAge?: number
  ) => RetirementProjection[];
  getTotalBalance: () => number;
  getSummary: (
    retirementAge?: number,
    currentAge?: number
  ) => RetirementSummary;
}

export const useRetirementStore = create<RetirementState>()(
  persist(
    (set, get) => ({
      accounts: [],
      contributions: [],

      addAccount: (accountData) => {
        const now = new Date().toISOString();
        const account: RetirementAccount = {
          ...accountData,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          accounts: [...state.accounts, account],
        }));
      },

      updateAccount: (id, updates) => {
        set((state) => ({
          accounts: state.accounts.map((a) =>
            a.id === id
              ? { ...a, ...updates, updatedAt: new Date().toISOString() }
              : a
          ),
        }));
      },

      deleteAccount: (id) => {
        set((state) => ({
          accounts: state.accounts.filter((a) => a.id !== id),
          contributions: state.contributions.filter((c) => c.accountId !== id),
        }));
      },

      getAccountById: (id) => {
        return get().accounts.find((a) => a.id === id);
      },

      addContribution: (contributionData) => {
        const now = new Date().toISOString();
        const contribution: Contribution = {
          ...contributionData,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          contributions: [...state.contributions, contribution],
        }));

        // Update account balance
        const account = get().getAccountById(contributionData.accountId);
        if (account) {
          get().updateAccount(contributionData.accountId, {
            currentBalance: contributionData.balanceAfter,
          });
        }
      },

      updateContribution: (id, updates) => {
        set((state) => ({
          contributions: state.contributions.map((c) =>
            c.id === id
              ? { ...c, ...updates, updatedAt: new Date().toISOString() }
              : c
          ),
        }));
      },

      deleteContribution: (id) => {
        set((state) => ({
          contributions: state.contributions.filter((c) => c.id !== id),
        }));
      },

      getContributionsByAccount: (accountId) => {
        return get()
          .contributions.filter((c) => c.accountId === accountId)
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
      },

      getProjections: (accountId, years, currentAge) => {
        const account = get().getAccountById(accountId);
        if (!account) return [];

        const projections: RetirementProjection[] = [];
        let balance = account.currentBalance;

        // Calculate annual contribution based on frequency
        let annualContribution = account.contributionAmount;
        if (account.contributionFrequency === "per-paycheck") {
          annualContribution = account.contributionAmount * 26; // Bi-weekly
        } else if (account.contributionFrequency === "monthly") {
          annualContribution = account.contributionAmount * 12;
        }

        // Calculate employer match
        const employerMatchRate = (account.employerMatchPercentage || 0) / 100;
        const annualEmployerMatch = annualContribution * employerMatchRate;

        for (let year = 0; year <= years; year++) {
          const startBalance = balance;
          const contributions = year === 0 ? 0 : annualContribution;
          const employerMatch = year === 0 ? 0 : annualEmployerMatch;
          const growth =
            year === 0
              ? 0
              : (startBalance + contributions + employerMatch) *
                account.expectedReturnRate;

          balance = startBalance + contributions + employerMatch + growth;

          projections.push({
            year,
            age: currentAge ? currentAge + year : undefined,
            startingBalance: startBalance,
            contributions,
            employerMatch,
            growth,
            endingBalance: balance,
          });
        }

        return projections;
      },

      getCombinedProjections: (years, currentAge) => {
        const { accounts } = get();
        if (accounts.length === 0) return [];

        // Get projections for each account
        const allProjections = accounts
          .filter((a) => a.isActive)
          .map((account) => get().getProjections(account.id, years, currentAge));

        // Combine projections by year
        const combined: RetirementProjection[] = [];
        for (let year = 0; year <= years; year++) {
          const yearProjections = allProjections.map((p) => p[year]);
          combined.push({
            year,
            age: currentAge ? currentAge + year : undefined,
            startingBalance: yearProjections.reduce(
              (sum, p) => sum + (p?.startingBalance || 0),
              0
            ),
            contributions: yearProjections.reduce(
              (sum, p) => sum + (p?.contributions || 0),
              0
            ),
            employerMatch: yearProjections.reduce(
              (sum, p) => sum + (p?.employerMatch || 0),
              0
            ),
            growth: yearProjections.reduce(
              (sum, p) => sum + (p?.growth || 0),
              0
            ),
            endingBalance: yearProjections.reduce(
              (sum, p) => sum + (p?.endingBalance || 0),
              0
            ),
          });
        }

        return combined;
      },

      getTotalBalance: () => {
        return get()
          .accounts.filter((a) => a.isActive)
          .reduce((sum, a) => sum + a.currentBalance, 0);
      },

      getSummary: (retirementAge = 65, currentAge) => {
        const { accounts, contributions } = get();
        const activeAccounts = accounts.filter((a) => a.isActive);

        const totalBalance = activeAccounts.reduce(
          (sum, a) => sum + a.currentBalance,
          0
        );

        const totalContributed = contributions.reduce(
          (sum, c) => sum + c.employeeAmount,
          0
        );

        const totalEmployerMatch = contributions.reduce(
          (sum, c) => sum + c.employerAmount,
          0
        );

        const totalGrowth = totalBalance - totalContributed - totalEmployerMatch;

        let projectedBalance: number | undefined;
        let yearsToRetirement: number | undefined;
        let monthlyIncome: number | undefined;

        if (currentAge && retirementAge > currentAge) {
          yearsToRetirement = retirementAge - currentAge;
          const projections = get().getCombinedProjections(
            yearsToRetirement,
            currentAge
          );
          if (projections.length > 0) {
            projectedBalance =
              projections[projections.length - 1].endingBalance;
            // 4% withdrawal rule, after 22% tax
            monthlyIncome = (projectedBalance * 0.04 * 0.78) / 12;
          }
        }

        return {
          totalBalance,
          totalContributed,
          totalEmployerMatch,
          totalGrowth,
          accountCount: activeAccounts.length,
          projectedBalanceAtRetirement: projectedBalance,
          yearsToRetirement,
          monthlyIncomeAtRetirement: monthlyIncome,
        };
      },
    }),
    {
      name: "blingapp-retirement",
      version: 1,
    }
  )
);

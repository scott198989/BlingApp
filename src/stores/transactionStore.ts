import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Transaction,
  TransactionFilter,
  TransactionType,
  RecurringExpense,
  CategorySummary,
} from "@/types";
import { generateId } from "@/lib/utils";
import { startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns";

interface TransactionState {
  transactions: Transaction[];
  recurringExpenses: RecurringExpense[];
  filter: TransactionFilter;

  // Transaction CRUD
  addTransaction: (
    transaction: Omit<Transaction, "id" | "createdAt" | "updatedAt">
  ) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Filtering
  setFilter: (filter: Partial<TransactionFilter>) => void;
  clearFilter: () => void;

  // Recurring Expenses
  addRecurringExpense: (
    expense: Omit<RecurringExpense, "id" | "createdAt" | "updatedAt">
  ) => void;
  updateRecurringExpense: (
    id: string,
    updates: Partial<RecurringExpense>
  ) => void;
  deleteRecurringExpense: (id: string) => void;

  // Queries
  getFilteredTransactions: () => Transaction[];
  getTransactionsByDateRange: (start: Date, end: Date) => Transaction[];
  getTransactionsByMonth: (year: number, month: number) => Transaction[];
  getMonthlyTotals: (
    year: number,
    month: number
  ) => { income: number; expenses: number; net: number };
  getSpendingByCategory: (
    transactions: Transaction[],
    categories: { id: string; name: string; color: string }[]
  ) => CategorySummary[];
}

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set, get) => ({
      transactions: [],
      recurringExpenses: [],
      filter: {},

      addTransaction: (transactionData) => {
        const now = new Date().toISOString();
        const transaction: Transaction = {
          ...transactionData,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          transactions: [transaction, ...state.transactions],
        }));
      },

      updateTransaction: (id, updates) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id
              ? { ...t, ...updates, updatedAt: new Date().toISOString() }
              : t
          ),
        }));
      },

      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }));
      },

      setFilter: (filter) => {
        set((state) => ({
          filter: { ...state.filter, ...filter },
        }));
      },

      clearFilter: () => {
        set({ filter: {} });
      },

      addRecurringExpense: (expenseData) => {
        const now = new Date().toISOString();
        const expense: RecurringExpense = {
          ...expenseData,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          recurringExpenses: [...state.recurringExpenses, expense],
        }));
      },

      updateRecurringExpense: (id, updates) => {
        set((state) => ({
          recurringExpenses: state.recurringExpenses.map((e) =>
            e.id === id
              ? { ...e, ...updates, updatedAt: new Date().toISOString() }
              : e
          ),
        }));
      },

      deleteRecurringExpense: (id) => {
        set((state) => ({
          recurringExpenses: state.recurringExpenses.filter((e) => e.id !== id),
        }));
      },

      getFilteredTransactions: () => {
        const { transactions, filter } = get();
        return transactions.filter((t) => {
          if (filter.type && t.type !== filter.type) return false;
          if (
            filter.categoryIds?.length &&
            !filter.categoryIds.includes(t.categoryId)
          )
            return false;
          if (filter.minAmount && t.amount < filter.minAmount) return false;
          if (filter.maxAmount && t.amount > filter.maxAmount) return false;
          if (filter.searchTerm) {
            const term = filter.searchTerm.toLowerCase();
            if (
              !t.description.toLowerCase().includes(term) &&
              !t.notes?.toLowerCase().includes(term)
            )
              return false;
          }
          if (filter.dateRange) {
            const date = parseISO(t.date);
            if (
              !isWithinInterval(date, {
                start: filter.dateRange.start,
                end: filter.dateRange.end,
              })
            )
              return false;
          }
          return true;
        });
      },

      getTransactionsByDateRange: (start, end) => {
        const { transactions } = get();
        return transactions.filter((t) => {
          const date = parseISO(t.date);
          return isWithinInterval(date, { start, end });
        });
      },

      getTransactionsByMonth: (year, month) => {
        const start = startOfMonth(new Date(year, month));
        const end = endOfMonth(new Date(year, month));
        return get().getTransactionsByDateRange(start, end);
      },

      getMonthlyTotals: (year, month) => {
        const transactions = get().getTransactionsByMonth(year, month);
        const income = transactions
          .filter((t) => t.type === "income")
          .reduce((sum, t) => sum + t.amount, 0);
        const expenses = transactions
          .filter((t) => t.type === "expense")
          .reduce((sum, t) => sum + t.amount, 0);
        return { income, expenses, net: income - expenses };
      },

      getSpendingByCategory: (transactions, categories) => {
        const categoryMap = new Map<string, number>();
        const countMap = new Map<string, number>();
        let total = 0;

        transactions
          .filter((t) => t.type === "expense")
          .forEach((t) => {
            const current = categoryMap.get(t.categoryId) || 0;
            categoryMap.set(t.categoryId, current + t.amount);
            countMap.set(t.categoryId, (countMap.get(t.categoryId) || 0) + 1);
            total += t.amount;
          });

        return categories
          .map((cat) => ({
            categoryId: cat.id,
            categoryName: cat.name,
            color: cat.color,
            total: categoryMap.get(cat.id) || 0,
            percentage:
              total > 0 ? ((categoryMap.get(cat.id) || 0) / total) * 100 : 0,
            count: countMap.get(cat.id) || 0,
          }))
          .filter((s) => s.total > 0)
          .sort((a, b) => b.total - a.total);
      },
    }),
    {
      name: "blingapp-transactions",
      version: 1,
    }
  )
);

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Category, CategoryType } from "@/types";
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from "@/types";
import { generateId } from "@/lib/utils";

interface CategoryState {
  categories: Category[];
  initialized: boolean;

  initializeDefaults: () => void;
  addCategory: (category: Omit<Category, "id" | "createdAt" | "updatedAt">) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  getCategoriesByType: (type: CategoryType) => Category[];
  getCategoryById: (id: string) => Category | undefined;
}

export const useCategoryStore = create<CategoryState>()(
  persist(
    (set, get) => ({
      categories: [],
      initialized: false,

      initializeDefaults: () => {
        if (get().initialized) return;

        const now = new Date().toISOString();
        const expenseCategories: Category[] = DEFAULT_EXPENSE_CATEGORIES.map(
          (cat) => ({
            ...cat,
            id: generateId(),
            createdAt: now,
            updatedAt: now,
          })
        );

        const incomeCategories: Category[] = DEFAULT_INCOME_CATEGORIES.map(
          (cat) => ({
            ...cat,
            id: generateId(),
            createdAt: now,
            updatedAt: now,
          })
        );

        set({
          categories: [...expenseCategories, ...incomeCategories],
          initialized: true,
        });
      },

      addCategory: (categoryData) => {
        const now = new Date().toISOString();
        const category: Category = {
          ...categoryData,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          categories: [...state.categories, category],
        }));
      },

      updateCategory: (id, updates) => {
        set((state) => ({
          categories: state.categories.map((cat) =>
            cat.id === id
              ? { ...cat, ...updates, updatedAt: new Date().toISOString() }
              : cat
          ),
        }));
      },

      deleteCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter((cat) => cat.id !== id),
        }));
      },

      getCategoriesByType: (type) => {
        return get().categories.filter((cat) => cat.type === type);
      },

      getCategoryById: (id) => {
        return get().categories.find((cat) => cat.id === id);
      },
    }),
    {
      name: "blingapp-categories",
      version: 1,
    }
  )
);

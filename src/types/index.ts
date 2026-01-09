// ============================================
// Common Types
// ============================================

export type UUID = string;
export type ISODateString = string;

export interface BaseEntity {
  id: UUID;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export type TimeFrame = "weekly" | "monthly" | "yearly" | "all";

// ============================================
// Transaction Types
// ============================================

export type TransactionType = "income" | "expense";

export interface Transaction extends BaseEntity {
  type: TransactionType;
  amount: number;
  description: string;
  categoryId: UUID;
  date: ISODateString;
  isRecurring: boolean;
  recurringId?: UUID;
  notes?: string;
}

export type RecurringFrequency =
  | "daily"
  | "weekly"
  | "biweekly"
  | "monthly"
  | "quarterly"
  | "yearly";

export interface RecurringExpense extends BaseEntity {
  description: string;
  amount: number;
  categoryId: UUID;
  frequency: RecurringFrequency;
  startDate: ISODateString;
  endDate?: ISODateString;
  nextDueDate: ISODateString;
  isActive: boolean;
}

export interface TransactionFilter {
  dateRange?: DateRange;
  categoryIds?: UUID[];
  type?: TransactionType;
  minAmount?: number;
  maxAmount?: number;
  searchTerm?: string;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
  transactionCount: number;
  byCategory: CategorySummary[];
}

export interface CategorySummary {
  categoryId: UUID;
  categoryName: string;
  color: string;
  total: number;
  percentage: number;
  count: number;
}

// ============================================
// Category Types
// ============================================

export type CategoryType = "income" | "expense";

export interface Category extends BaseEntity {
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  isDefault: boolean;
  sortOrder: number;
}

export const DEFAULT_EXPENSE_CATEGORIES: Omit<Category, "id" | "createdAt" | "updatedAt">[] = [
  { name: "Housing", type: "expense", icon: "Home", color: "#3B82F6", isDefault: true, sortOrder: 0 },
  { name: "Transportation", type: "expense", icon: "Car", color: "#10B981", isDefault: true, sortOrder: 1 },
  { name: "Groceries", type: "expense", icon: "ShoppingCart", color: "#F59E0B", isDefault: true, sortOrder: 2 },
  { name: "Utilities", type: "expense", icon: "Zap", color: "#8B5CF6", isDefault: true, sortOrder: 3 },
  { name: "Entertainment", type: "expense", icon: "Film", color: "#EC4899", isDefault: true, sortOrder: 4 },
  { name: "Dining Out", type: "expense", icon: "UtensilsCrossed", color: "#EF4444", isDefault: true, sortOrder: 5 },
  { name: "Healthcare", type: "expense", icon: "Heart", color: "#06B6D4", isDefault: true, sortOrder: 6 },
  { name: "Shopping", type: "expense", icon: "ShoppingBag", color: "#84CC16", isDefault: true, sortOrder: 7 },
  { name: "Personal", type: "expense", icon: "User", color: "#F97316", isDefault: true, sortOrder: 8 },
  { name: "Education", type: "expense", icon: "GraduationCap", color: "#6366F1", isDefault: true, sortOrder: 9 },
  { name: "Travel", type: "expense", icon: "Plane", color: "#14B8A6", isDefault: true, sortOrder: 10 },
  { name: "Subscriptions", type: "expense", icon: "Repeat", color: "#A855F7", isDefault: true, sortOrder: 11 },
  { name: "Other", type: "expense", icon: "MoreHorizontal", color: "#6B7280", isDefault: true, sortOrder: 12 },
];

export const DEFAULT_INCOME_CATEGORIES: Omit<Category, "id" | "createdAt" | "updatedAt">[] = [
  { name: "Salary", type: "income", icon: "Briefcase", color: "#22C55E", isDefault: true, sortOrder: 0 },
  { name: "Freelance", type: "income", icon: "Laptop", color: "#3B82F6", isDefault: true, sortOrder: 1 },
  { name: "Investments", type: "income", icon: "TrendingUp", color: "#8B5CF6", isDefault: true, sortOrder: 2 },
  { name: "Gifts", type: "income", icon: "Gift", color: "#EC4899", isDefault: true, sortOrder: 3 },
  { name: "Other Income", type: "income", icon: "DollarSign", color: "#6B7280", isDefault: true, sortOrder: 4 },
];

// ============================================
// Budget Types
// ============================================

export type BudgetPeriod = "weekly" | "monthly" | "yearly";

export interface Budget extends BaseEntity {
  categoryId: UUID;
  amount: number;
  period: BudgetPeriod;
  startDate: ISODateString;
  rollover: boolean;
}

export interface BudgetProgress {
  budget: Budget;
  categoryName: string;
  categoryColor: string;
  spent: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
}

// ============================================
// Mortgage Types
// ============================================

export interface Mortgage extends BaseEntity {
  name: string;
  propertyAddress?: string;
  originalPrincipal: number;
  currentBalance: number;
  interestRate: number;
  termMonths: number;
  startDate: ISODateString;
  paymentDay: number;
  monthlyPayment: number;
  extraPaymentAmount?: number;
  escrowAmount?: number;
  pmiAmount?: number;
  isActive: boolean;
}

export interface AmortizationEntry {
  paymentNumber: number;
  date: ISODateString;
  payment: number;
  principal: number;
  interest: number;
  extraPayment: number;
  remainingBalance: number;
  cumulativePrincipal: number;
  cumulativeInterest: number;
  equity: number;
}

export interface MortgageSummary {
  originalPrincipal: number;
  currentBalance: number;
  equityAmount: number;
  equityPercentage: number;
  totalPaid: number;
  totalInterestPaid: number;
  remainingPayments: number;
  estimatedPayoffDate: ISODateString;
  monthlyBreakdown: {
    principal: number;
    interest: number;
    escrow: number;
    pmi: number;
    total: number;
  };
}

export interface ExtraPaymentScenario {
  extraAmount: number;
  originalPayoffDate: ISODateString;
  newPayoffDate: ISODateString;
  monthsSaved: number;
  interestSaved: number;
}

// ============================================
// Retirement/401k Types
// ============================================

export type RetirementAccountType =
  | "401k"
  | "roth-401k"
  | "ira"
  | "roth-ira"
  | "403b"
  | "pension";

export type ContributionFrequency = "per-paycheck" | "monthly" | "yearly";

export type AssetClass =
  | "stocks-domestic"
  | "stocks-international"
  | "bonds"
  | "money-market"
  | "real-estate"
  | "target-date"
  | "other";

export interface AssetAllocation {
  assetClass: AssetClass;
  percentage: number;
  fundName?: string;
  ticker?: string;
}

export interface RetirementAccount extends BaseEntity {
  name: string;
  accountType: RetirementAccountType;
  provider: string;
  currentBalance: number;
  employerName?: string;
  contributionAmount: number;
  contributionFrequency: ContributionFrequency;
  employerMatchPercentage?: number;
  employerMatchLimit?: number;
  vestingPercentage: number;
  expectedReturnRate: number;
  assetAllocation?: AssetAllocation[];
  isActive: boolean;
  notes?: string;
}

export interface Contribution extends BaseEntity {
  accountId: UUID;
  date: ISODateString;
  employeeAmount: number;
  employerAmount: number;
  totalAmount: number;
  balanceAfter: number;
  notes?: string;
}

export interface RetirementProjection {
  year: number;
  age?: number;
  startingBalance: number;
  contributions: number;
  employerMatch: number;
  growth: number;
  endingBalance: number;
}

export interface RetirementSummary {
  totalBalance: number;
  totalContributed: number;
  totalEmployerMatch: number;
  totalGrowth: number;
  accountCount: number;
  projectedBalanceAtRetirement?: number;
  yearsToRetirement?: number;
  monthlyIncomeAtRetirement?: number;
}

// ============================================
// Settings Types
// ============================================

export type ThemeMode = "light" | "dark" | "system";

export interface UserSettings {
  theme: ThemeMode;
  currency: string;
  locale: string;
  dateFormat: string;
  retirementAge?: number;
  currentAge?: number;
  annualSalary?: number;
}

export const DEFAULT_SETTINGS: UserSettings = {
  theme: "system",
  currency: "USD",
  locale: "en-US",
  dateFormat: "MM/dd/yyyy",
  retirementAge: 65,
};

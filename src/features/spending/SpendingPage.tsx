import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTransactionStore, useCategoryStore } from "@/stores";
import { TransactionList } from "./TransactionList";
import { TransactionForm } from "./TransactionForm";
import { CategoryBreakdown } from "./CategoryBreakdown";
import { SpendingTrends } from "./SpendingTrends";
import type { Transaction } from "@/types";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function SpendingPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const { transactions } = useTransactionStore();
  const { categories } = useCategoryStore();

  const handleAddNew = () => {
    setEditingTransaction(null);
    setIsFormOpen(true);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTransaction(null);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Spending</h1>
          <p className="text-muted-foreground">
            Track and analyze your income and expenses
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="categories">By Category</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <motion.div variants={itemVariants}>
            <TransactionList
              transactions={transactions}
              onEdit={handleEdit}
            />
          </motion.div>
        </TabsContent>

        <TabsContent value="categories">
          <motion.div variants={itemVariants}>
            <CategoryBreakdown />
          </motion.div>
        </TabsContent>

        <TabsContent value="trends">
          <motion.div variants={itemVariants}>
            <SpendingTrends />
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Transaction Form Dialog */}
      <TransactionForm
        open={isFormOpen}
        onClose={handleCloseForm}
        transaction={editingTransaction}
      />
    </motion.div>
  );
}

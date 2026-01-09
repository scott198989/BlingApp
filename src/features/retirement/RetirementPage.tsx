import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRetirementStore, useSettingsStore } from "@/stores";
import { AccountsList } from "./AccountsList";
import { AccountForm } from "./AccountForm";
import { CombinedOverview } from "./CombinedOverview";
import { GrowthProjections } from "./GrowthProjections";
import type { RetirementAccount } from "@/types";

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

export function RetirementPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<RetirementAccount | null>(null);

  const { accounts } = useRetirementStore();

  const handleAddNew = () => {
    setEditingAccount(null);
    setIsFormOpen(true);
  };

  const handleEdit = (account: RetirementAccount) => {
    setEditingAccount(account);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingAccount(null);
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
          <h1 className="text-3xl font-bold tracking-tight">Retirement</h1>
          <p className="text-muted-foreground">
            Track your 401k and retirement accounts
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          Add Account
        </Button>
      </div>

      {accounts.length > 0 ? (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
            <TabsTrigger value="projections">Projections</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <motion.div variants={itemVariants}>
              <CombinedOverview />
            </motion.div>
          </TabsContent>

          <TabsContent value="accounts">
            <motion.div variants={itemVariants}>
              <AccountsList onEdit={handleEdit} />
            </motion.div>
          </TabsContent>

          <TabsContent value="projections">
            <motion.div variants={itemVariants}>
              <GrowthProjections />
            </motion.div>
          </TabsContent>
        </Tabs>
      ) : (
        <motion.div variants={itemVariants}>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No Accounts Added</h2>
            <p className="text-muted-foreground mb-4 max-w-md">
              Add your 401k and retirement accounts to track your progress
              toward financial independence.
            </p>
            <Button onClick={handleAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Account
            </Button>
          </div>
        </motion.div>
      )}

      {/* Account Form Dialog */}
      <AccountForm
        open={isFormOpen}
        onClose={handleCloseForm}
        account={editingAccount}
      />
    </motion.div>
  );
}

import { useState } from "react";
import { motion } from "framer-motion";
import { Home, Plus, Settings, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMortgageStore } from "@/stores";
import { MortgageOverview } from "./MortgageOverview";
import { MortgageForm } from "./MortgageForm";
import { AmortizationSchedule } from "./AmortizationSchedule";
import { ExtraPaymentCalculator } from "./ExtraPaymentCalculator";

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

export function MortgagePage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { mortgage } = useMortgageStore();

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
          <h1 className="text-3xl font-bold tracking-tight">Mortgage</h1>
          <p className="text-muted-foreground">
            Track your mortgage and home equity
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          {mortgage ? (
            <>
              <Settings className="h-4 w-4 mr-2" />
              Edit Mortgage
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Add Mortgage
            </>
          )}
        </Button>
      </div>

      {mortgage ? (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="schedule">Amortization</TabsTrigger>
            <TabsTrigger value="calculator">Extra Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <motion.div variants={itemVariants}>
              <MortgageOverview />
            </motion.div>
          </TabsContent>

          <TabsContent value="schedule">
            <motion.div variants={itemVariants}>
              <AmortizationSchedule />
            </motion.div>
          </TabsContent>

          <TabsContent value="calculator">
            <motion.div variants={itemVariants}>
              <ExtraPaymentCalculator />
            </motion.div>
          </TabsContent>
        </Tabs>
      ) : (
        <motion.div variants={itemVariants}>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Home className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No Mortgage Added</h2>
            <p className="text-muted-foreground mb-4 max-w-md">
              Add your mortgage details to track your payments, equity growth,
              and see how extra payments can save you money.
            </p>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your Mortgage
            </Button>
          </div>
        </motion.div>
      )}

      {/* Mortgage Form Dialog */}
      <MortgageForm open={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </motion.div>
  );
}

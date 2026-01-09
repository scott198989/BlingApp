import { useState } from "react";
import { motion } from "framer-motion";
import { Moon, Sun, Monitor, Download, Upload, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useSettingsStore,
  useTransactionStore,
  useCategoryStore,
  useMortgageStore,
  useRetirementStore,
} from "@/stores";
import type { ThemeMode } from "@/types";

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

export function SettingsPage() {
  const [clearDataOpen, setClearDataOpen] = useState(false);
  const { settings, updateSettings, setTheme } = useSettingsStore();

  // All stores for export/import
  const transactionStore = useTransactionStore();
  const categoryStore = useCategoryStore();
  const mortgageStore = useMortgageStore();
  const retirementStore = useRetirementStore();

  const themes: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  const handleExportData = () => {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      settings: settings,
      transactions: transactionStore.transactions,
      recurringExpenses: transactionStore.recurringExpenses,
      categories: categoryStore.categories,
      mortgage: mortgageStore.mortgage,
      retirementAccounts: retirementStore.accounts,
      contributions: retirementStore.contributions,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `blingapp-backup-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);

        if (data.settings) {
          updateSettings(data.settings);
        }
        if (data.categories) {
          // Reset and add imported categories
          data.categories.forEach((cat: any) => {
            categoryStore.addCategory(cat);
          });
        }
        if (data.transactions) {
          data.transactions.forEach((t: any) => {
            transactionStore.addTransaction(t);
          });
        }
        if (data.mortgage) {
          mortgageStore.setMortgage(data.mortgage);
        }
        if (data.retirementAccounts) {
          data.retirementAccounts.forEach((account: any) => {
            retirementStore.addAccount(account);
          });
        }

        alert("Data imported successfully!");
      } catch (error) {
        alert("Error importing data. Please check the file format.");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const handleClearAllData = () => {
    // Clear all localStorage
    localStorage.removeItem("blingapp-settings");
    localStorage.removeItem("blingapp-transactions");
    localStorage.removeItem("blingapp-categories");
    localStorage.removeItem("blingapp-mortgage");
    localStorage.removeItem("blingapp-retirement");

    // Reload the page to reset state
    window.location.reload();
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-2xl"
    >
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Customize your BlingApp experience
        </p>
      </div>

      {/* Appearance */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Choose your preferred color theme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {themes.map((theme) => (
                <Button
                  key={theme.value}
                  variant={settings.theme === theme.value ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setTheme(theme.value)}
                >
                  <theme.icon className="h-4 w-4 mr-2" />
                  {theme.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Profile Settings */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Personal information for retirement calculations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentAge">Current Age</Label>
                <Input
                  id="currentAge"
                  type="number"
                  min="18"
                  max="100"
                  value={settings.currentAge || ""}
                  onChange={(e) =>
                    updateSettings({
                      currentAge: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  placeholder="e.g., 30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="retirementAge">Target Retirement Age</Label>
                <Input
                  id="retirementAge"
                  type="number"
                  min="30"
                  max="100"
                  value={settings.retirementAge || ""}
                  onChange={(e) =>
                    updateSettings({
                      retirementAge: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  placeholder="e.g., 65"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="annualSalary">Annual Salary (Optional)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="annualSalary"
                  type="number"
                  min="0"
                  step="1000"
                  className="pl-7"
                  value={settings.annualSalary || ""}
                  onChange={(e) =>
                    updateSettings({
                      annualSalary: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  placeholder="For contribution calculations"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Data Management */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>
              Export, import, or clear your data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" onClick={handleExportData} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <div className="flex-1">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                  id="import-file"
                />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => document.getElementById("import-file")?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import Data
                </Button>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-medium text-destructive mb-2">
                Danger Zone
              </h4>
              <Button
                variant="destructive"
                onClick={() => setClearDataOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* About */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>About BlingApp</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              BlingApp is a personal finance tracker that helps you manage your
              spending, mortgage, and retirement savings.
            </p>
            <p>
              All your data is stored locally in your browser and never sent to
              any server. Export your data regularly to keep a backup.
            </p>
            <p className="pt-2">
              Version 1.0.0 • Built with React, TypeScript, and Tailwind CSS
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Clear Data Confirmation Dialog */}
      <Dialog open={clearDataOpen} onOpenChange={setClearDataOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear All Data?</DialogTitle>
            <DialogDescription>
              This will permanently delete all your transactions, mortgage data,
              retirement accounts, and settings. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClearDataOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleClearAllData}>
              Yes, Clear Everything
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

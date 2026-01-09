import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { MainLayout } from "@/components/layout";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { SpendingPage } from "@/features/spending/SpendingPage";
import { MortgagePage } from "@/features/mortgage/MortgagePage";
import { RetirementPage } from "@/features/retirement/RetirementPage";
import { SettingsPage } from "@/features/settings/SettingsPage";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <TooltipProvider>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/spending" element={<SpendingPage />} />
              <Route path="/mortgage" element={<MortgagePage />} />
              <Route path="/retirement" element={<RetirementPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </TooltipProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;

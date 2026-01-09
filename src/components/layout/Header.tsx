import { Moon, Sun, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/shared/ThemeProvider";
import { useSettingsStore } from "@/stores";

interface HeaderProps {
  onMenuClick?: () => void;
  title?: string;
}

export function Header({ onMenuClick, title }: HeaderProps) {
  const { theme } = useTheme();
  const { settings, setTheme } = useSettingsStore();

  const toggleTheme = () => {
    if (settings.theme === "light") {
      setTheme("dark");
    } else if (settings.theme === "dark") {
      setTheme("light");
    } else {
      // System theme - toggle to opposite of current
      setTheme(theme === "dark" ? "light" : "dark");
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-4 md:px-6">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        {/* Mobile logo */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">B</span>
          </div>
          <span className="font-bold text-lg">BlingApp</span>
        </div>

        {/* Page title (desktop) */}
        {title && (
          <h1 className="hidden md:block text-xl font-semibold">{title}</h1>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Theme toggle */}
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
    </header>
  );
}

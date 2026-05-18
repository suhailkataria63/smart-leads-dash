import { Button } from "../../components";

import { useTheme } from "./ThemeContext";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Button aria-pressed={isDark} onClick={toggleTheme} variant="secondary">
      {isDark ? "Light Mode" : "Dark Mode"}
    </Button>
  );
}

export { ThemeToggle };


import React from "react";
import { useTheme } from "@/context/theme-context";

const ToggleThemeButton: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme(); // Accéder au contexte du thème

  return (
    <button
      onClick={toggleTheme}
      className="ml-2 p-2 bg-gray-600 text-white rounded-full"
      aria-label="Toggle dark mode"
    >
      {isDarkMode ? "🌙" : "☀️"} {/* Affichage de l'icône en fonction du mode */}
    </button>
  );
};

export default ToggleThemeButton;

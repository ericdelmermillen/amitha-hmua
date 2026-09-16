"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { ColorModeToggleProps } from "@/typing/interfaces";
import "./ColorModeToggle.scss";

const ColorModeToggle = ({ inputId }: ColorModeToggleProps) => {
  const { resolvedTheme, setTheme } = useTheme();
  const [ mounted, setMounted ] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggle = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const isDarkMode = mounted && resolvedTheme === "dark";

  return (
    <button
      id={inputId}
      className={`colorModeToggle ${isDarkMode ? "colorModeToggle--dark" : ""}`}
      onClick={handleToggle}
      type="button"
      aria-label="Toggle color mode"
      aria-pressed={isDarkMode}
    >
      <img
        className="colorModeToggle__sun-icon"
        src="/icons/sun.svg"
        alt="Color Mode Light sun icon"
      />
      <img
        className="colorModeToggle__moon-icon"
        src="/icons/crescent_moon.svg"
        alt="Color Mode Dark moon icon"
      />
      <span className={`colorModeToggle__ball ${mounted ? "show" : "hide"}`} />
    </button>
  );
};

export default ColorModeToggle;
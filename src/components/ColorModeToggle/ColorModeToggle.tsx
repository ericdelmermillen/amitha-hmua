"use client";

import Image from "next/image";
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
      type="button"
      id={inputId}
      className={`colorModeToggle ${isDarkMode ? "colorModeToggle--dark" : ""}`}
      onClick={handleToggle}
      aria-label="Toggle color mode"
      aria-pressed={isDarkMode}
    >
      <Image
        className="colorModeToggle__sun-icon"
        src="/icons/sun.svg"
        alt="Color Mode Light sun icon"
        width={18}
        height={18}
      />
      <Image
        className="colorModeToggle__moon-icon"
        src="/icons/crescent_moon.svg"
        alt="Color Mode Dark moon icon"
        width={10}
        height={10}
      />
      <span className={`colorModeToggle__ball ${mounted ? "show" : "hide"}`} />
    </button>
  );
};

export default ColorModeToggle;
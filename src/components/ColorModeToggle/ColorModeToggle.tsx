"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ColorModetoggleProps } from "@/typing/interfaces";
import { useColorThemeContext } from "@/hooks/hooks";
import "./ColorModeToggle.scss";

const ColorModeToggle = ({ inputId }: ColorModetoggleProps) => {
  const { colorMode, toggleColorMode } = useColorThemeContext();
  const [ mounted, setMounted ] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkMode = colorMode === "dark";

  return (
    <div className="colorModeToggle">
      <input 
        className="colorModeToggle__checkbox" 
        type="checkbox" 
        id={inputId} 
        onChange={toggleColorMode}
        checked={isDarkMode}
      />
      <label className="colorModeToggle__checkbox-label" htmlFor={inputId}>
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
        <span className={`colorModeToggle__ball ${mounted ? "show" : "hide"}`}></span>
      </label>
    </div>
  );
};

export default ColorModeToggle;
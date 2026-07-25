"use client";

import { useColorThemeContext } from "@/hooks/hooks";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ToastProvider = () => {
  const { colorMode } = useColorThemeContext();
  
  return (
    <ToastContainer
      position="bottom-center"
      autoClose={2000}
      hideProgressBar={true}
      newestOnTop={false}
      closeOnClick
      draggable
      pauseOnHover
      theme={colorMode === "dark" ? "dark" : "light" } 
    />
  )
}

export { ToastProvider };
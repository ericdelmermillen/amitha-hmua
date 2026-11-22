"use client";

import { usePathname, useRouter } from "next/navigation";
import { type MouseEvent, useState, useEffect, createContext } from "react";
import { type TypeOptions, toast } from "react-toastify";
import { type AuthContextValue, type ChildrenProps } from "@/typing/interfaces";
import { checkUserSession, logoutUser } from "@/actions/authActions";

// const MIN_LOADING_INTERVAL = Number(process.env.NEXT_PUBLIC_MIN_LOADING_INTERVAL);
// const APP_ISLOADING_DELAY = Number(process.env.NEXT_PUBLIC_APP_ISLOADING_DELAY);


const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AuthContextProvider = ({ children }: ChildrenProps) => {
  const [ isLoggedIn, setIsLoggedIn ] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  const handleLogoutUser = async (
    messageOrEvent?: MouseEvent<HTMLElement> | string,
    messageType: TypeOptions = "success"
  ) => {
    const finalMessage =
      typeof messageOrEvent === "string" && messageOrEvent.length > 0
        ? messageOrEvent
        : "Logging you out...";

    try {
      const response = await logoutUser(finalMessage);

      if (response.success) {
        toast(response.message, { type: messageType });
        // handleClearAppState(true);
        // handleRefreshShoots();

        if (pathname === "/work") {
          router.refresh();
        } else {
          router.replace("/work");
        }
        
      } else {
        console.error(response.message);
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Network or client error during logout:", error);
    }
  };


    // useEffect to check user session and set isLoggedIn state
  useEffect(() => {
    const verifySession = async () => {
      try {
        const { isAuthenticated } = await checkUserSession();
        setIsLoggedIn(isAuthenticated);
      } catch (error) {
        console.error("Session check failed:", error);
        setIsLoggedIn(false);
      }
    };

    verifySession();
  }, []);

    // useEffect to catch auth failures triggered by middleware redirect
  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const match = document.cookie.match(/(?:^|; )\s*auth_flash=([^;]*)/);

    if (match && match[1] === "expired") {
      // Immediately clear the cookie so it only triggers once
      document.cookie = "auth_flash=; path=/; max-age=0";
      handleLogoutUser("Authentication failed. Logging you out...", "error");
    }
  }, [pathname]);

  

  const contextValues: AuthContextValue = {
    isLoggedIn, 
    setIsLoggedIn

  }


  return (
      <AuthContext.Provider value={contextValues}>
        {children}
      </AuthContext.Provider>
    );
  };

export { 
  AuthContext,
  AuthContextProvider
};
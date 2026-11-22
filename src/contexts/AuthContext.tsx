"use client";

import { usePathname, useRouter } from "next/navigation";
import { 
  type MouseEvent, 
  useState,  
  useRef, 
  useEffect, 
  createContext 
} from "react";
import { 
  type AuthContextValue,
  type ChildrenProps,
} from "@/typing/interfaces";
import { checkUserSession, logoutUser } from "@/actions/authActions";
import { isModifiedClick } from "@/utils/utils";

const MIN_LOADING_INTERVAL = Number(process.env.NEXT_PUBLIC_MIN_LOADING_INTERVAL);
const APP_ISLOADING_DELAY = Number(process.env.NEXT_PUBLIC_APP_ISLOADING_DELAY);

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AuthContextProvider = ({ children }: ChildrenProps) => {

  const contextValues: AuthContextValue = {

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
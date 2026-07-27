import { type FC, type ReactNode, type SetStateAction, type Dispatch, type RefObject } from "react";
import { ColorMode } from "./types";

export interface AppContextProviderProps {
  children: ReactNode;
};

export interface AppContextValue {
  appIsLoading: boolean;
  setAppIsLoading: Dispatch<SetStateAction<boolean>>;
    handleNavigateHome: (tagObj?: Tag) => void;
// state, state setting and ref
  // isLoggedIn: boolean; 
  // setIsLoggedIn: Dispatch<SetStateAction<boolean>>;
//   scrollYPos: number;
//   setScrollYPos: Dispatch<SetStateAction<number>>;
//   prevScrollYPosRef: RefObject<number | null>;
//   windowWidth: number;
//   setWindowWidth: Dispatch<SetStateAction<number>>;
//   showDropdownNavOptions: boolean;
//   setShowDropdownNavOptions: Dispatch<SetStateAction<boolean>>;
//   navLinkClick: (optionName: string) => void;
//   // functions
//   loginUser: (email: string, password: string) => Promise<boolean>;
//   showNav: () => void;
//   getPrevScrollYPosValue: () => number;
//   notFoundNavLinkClick: (to: string) => void;
  // hideNav: () => void;
//   logoutUser: () => void;
};

export interface ColorThemeContextProps {
  children: ReactNode;
};

export interface ColorThemeContextValue {
  colorMode: ColorMode;
  setColorMode: Dispatch<SetStateAction<ColorMode>>;
  toggleColorMode: () => void;
}

export interface IconProps {
  className?: string;
}

export interface ColorModetoggleProps {
  inputId?: string;
}

export interface Tag {
    tagName: string;
  }

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
}
  
export interface IsLoadingProps {
  id: string;
  initiallyShowing: boolean;
}
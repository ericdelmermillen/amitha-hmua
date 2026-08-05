import { 
  type ReactNode, 
  type RefObject,
  type SetStateAction, 
  type Dispatch, 
  type MouseEvent,
  type ComponentType, 
  type SVGProps
} from "react";
import { ColorMode } from "./types";

export interface ContextProviderProps {
  children: ReactNode;
};

export interface AppContextValue {
  appIsLoading: boolean;
  setAppIsLoading: Dispatch<SetStateAction<boolean>>;
  isLoggedIn: boolean;
  setIsLoggedIn: Dispatch<SetStateAction<boolean>>;
  handleNavigateHome: (tagObj?: Tag) => void;

  showSideNav: boolean;
  setShowSideNav: Dispatch<SetStateAction<boolean>>;
  
  handleToggleSideNav: () => void;
  handleTouchOffDiv: () => void;

  showTouchOffDiv: boolean;
   setShowTouchOffDiv: Dispatch<SetStateAction<boolean>>;

  handleSetShowSideNavFalse: () => void;
  handleNavLinkClick: () => void;
  handleIsOnSamePage: () => void;
  handleSideNavLinkClick: (e: MouseEvent<HTMLAnchorElement>) => void;
  // state, state setting and ref
  handleIsOnCurrentPage: (e: MouseEvent<HTMLAnchorElement>) => void;
  // isLoggedIn: boolean; 
  // setIsLoggedIn: Dispatch<SetStateAction<boolean>>;
  scrollYPos: number;
  setScrollYPos: Dispatch<SetStateAction<number>>;

  selectValue: string | null;
  setSelectValue: Dispatch<SetStateAction<string | null>>;

  selectedTag: Tag | null;
  setSelectedTag: Dispatch<SetStateAction<Tag | null>>;
  showNavSelectOptions: boolean;
  setShowNavSelectOptions: Dispatch<SetStateAction<boolean>>;
  tags: Tag[];
  handleLogoutUser: () => void;
  
  
  //   // functions
  //   loginUser: (email: string, password: string) => Promise<boolean>;
  //   showNav: () => void;
  getPrevScrollYPosValue: () => number;
  //   notFoundNavLinkClick: (to: string) => void;
  // hideNav: () => void;
  //   logoutUser: () => void;
};

export interface ModalContextValue {
  handleEditBio: () => void;
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
}


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
  classNameStroke?: string;
}

export interface ColorModetoggleProps {
  inputId?: string;
}

export interface Tag {
  id: number;
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

export interface NavProps {
  children?: ReactNode;
  handleLogOut?: () => void
};

export interface SideNavProps {
  children?: ReactNode;
  handleLogOut?: () => void;
};

export interface NavPage {
  pageName: string;
  href: string;
  modifierClass?: string;
  icon: ComponentType<SVGProps<SVGSVGElement>> | null;
}

export interface NavSelectProps {
  selectOptions: Tag[];
  modifierClass?: string;
}

export interface BioData {
	bioName: string;
	bioText: string;
	bioImgURL: string;
	bioImageNotSet: boolean;
}

export interface BioResponse {
	success: boolean;
	data?: BioData;
	message?: string;
}

export interface ClientButtonProps {
  text: string; 
  variant: string;
  buttonType: string;
  modifierClass?: string;
}
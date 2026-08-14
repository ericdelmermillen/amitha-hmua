import { 
  type ReactNode, 
  type ChangeEvent,
  type SetStateAction, 
  type Dispatch, 
  type MouseEvent,
  type ComponentType, 
  type SVGProps,
  DragEvent
} from "react";
import { ColorMode } from "./types";

export interface ContextProviderProps {
  children: ReactNode;
};

export interface AppContextValue {
  // state, state setting and ref
  appIsLoading: boolean;
  setAppIsLoading: Dispatch<SetStateAction<boolean>>;
  isLoggedIn: boolean;
  setIsLoggedIn: Dispatch<SetStateAction<boolean>>;
  showSideNav: boolean;
  setShowSideNav: Dispatch<SetStateAction<boolean>>;  
  showTouchOffDiv: boolean;
  setShowTouchOffDiv: Dispatch<SetStateAction<boolean>>;
  scrollYPos: number;
  setScrollYPos: Dispatch<SetStateAction<number>>;
  selectValue: string | null;
  setSelectValue: Dispatch<SetStateAction<string | null>>;
  selectedTag: Tag | null;
  setSelectedTag: Dispatch<SetStateAction<Tag | null>>;
  showNavSelectOptions: boolean;
  setShowNavSelectOptions: Dispatch<SetStateAction<boolean>>;
  tags: Tag[];
  
  // handler functions
  handleToggleSideNav: () => void;
  handleTouchOffDiv: () => void;
  handleNavLinkClick: () => void;
  handleIsOnSamePage: () => void;
  handleSideNavLinkClick: (e: MouseEvent<HTMLAnchorElement>) => void;
  handleLogoutUser: () => void;
  handleNavigateHome: (tagObj?: Tag) => void;
  handleSetShowSideNavFalse: () => void;
  handleIsOnCurrentPage: (e: MouseEvent<HTMLAnchorElement>) => void;
  shootOrderIsEditable: boolean;
  setShootOrderIsEditable: Dispatch<SetStateAction<boolean>>;
  
  // functions
  getPrevScrollYPosValue: () => number;
};

export interface ModalContextValue {
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  handleClearModal: () => void;
  modalAction: string | null;
  setModalAction: Dispatch<SetStateAction<string | null>>;
  handleOpenModal: (data: ModalData) => void;
  modalEntityType: string | null;
  setModalEntityType: Dispatch<SetStateAction<string | null>>;
  modalEntityID: number | null;
  setModalEntityID: Dispatch<SetStateAction<number | null>>;
  modalEntityName: string | null;
  setModalEntityName: Dispatch<SetStateAction<string | null>>;
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
  strokeClassName?: string;
}

export interface ColorModetoggleProps {
  inputId?: string;
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

export interface Tag {
  id: number;
  tagName: string;
}

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
  variant?: string;
  buttonType: string;
  modifierClass?: string;
}

export interface InputPhoto {
  photoNo: number;
  photoPreview: string | null;
  photoData: File | Blob | null;
  displayOrder: number;
}

export interface BioUpdateData {
  bioName: string;
  bioText: string;
  photo: InputPhoto;
}

export interface PhotoInputProps {
  shootPhoto: InputPhoto;
  setShootPhotos: Dispatch<SetStateAction<InputPhoto[]>>;

  handleImageChange: (
    e: ChangeEvent<HTMLInputElement>,
    inputNo: number
  ) => Promise<void>;

  handleInputDragStart?: (inputNo: number) => void | undefined;

  handleDropInputTarget?: (
    inputNo: number,
    displayOrder: number
  ) => void | undefined;
}

export interface UpdatedBioData {
  bio_name: string;
  bio_img_url: string;
  bio_text: string;
  updated_Photo: boolean;
}

export interface ShootSummary {
  shootID: number;
  displayOrder: number;
  shootDate: string;
  tags: string[];
  photographers: string[];
  models: string[];
  thumbnailURL: string;
}

export interface GetShootSummariesParams {
  page?: number;
  limit?: number;
  tagID?: number | string;
}

export interface GetShootSummariesResponse {
  shootSummaries: ShootSummary[];
  isFinalPage: boolean;
}

export interface ShootProps {
  shootID?: number;
  displayOrder?: number;
  thumbnailURL?: string;
  models?: string[];
  photographers?: string[];
  isOnShootDetails?: boolean;
  handleNewShootID?: (shootId: number) => void;
  shootOrderIsEditable?: boolean;
  handleShootDragStart?: (e: DragEvent<HTMLDivElement> | MouseEvent<HTMLDivElement>, shootID: number) => void;
  handleDropShootTarget?: (shootID: number, displayOrder: number) => void;
}

export interface ModalData {
    e?: MouseEvent<HTMLDivElement>;
    action: "edit" | "delete";
    entityType: "bio" | "shoot" | "tag" | "model" | "photographer";
    entityName?: string | null;
    entityID?: number | null;
}



export interface ShootDetailPhoto {
  id: number;
  display_order: number;
  photo_url: string;
}

export interface ShootDetailResponse {
  shoot_id: number;
  shoot_date: string | null;
  photographer_ids: number[];
  photographers: string[];
  model_ids: number[];
  models: string[];
  tag_ids: number[];
  tags: string[];
  photo_urls: ShootDetailPhoto[];
}

export interface ShootDetailsPageProps {
  params: Promise<{ id: string }>;
}
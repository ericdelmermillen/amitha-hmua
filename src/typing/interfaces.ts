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
import { RowDataPacket } from "mysql2";

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
  navSelectValue: string | null;
  setNavSelectValue: Dispatch<SetStateAction<string | null>>;
  selectedTag: ShootEntity | null;
  setSelectedTag: Dispatch<SetStateAction<ShootEntity | null>>;
  showNavSelectOptions: boolean;
  setShowNavSelectOptions: Dispatch<SetStateAction<boolean>>;
  tags: ShootEntity[];
  tagChoosers: ChooserItem[];
  setTagChoosers: Dispatch<SetStateAction<ChooserItem[]>>;
  setTags: Dispatch<SetStateAction<ShootEntity[]>>;
  shouldRefreshTags: boolean;
  setShouldRefreshTags: Dispatch<SetStateAction<boolean>>;
  shouldRefreshModels: boolean;
  setShouldRefreshModels: Dispatch<SetStateAction<boolean>>;
  shouldRefreshPhotographers: boolean;
  setShouldRefreshPhotographers: Dispatch<SetStateAction<boolean>>;

  shoots: ShootSummary[];
  setShoots: Dispatch<SetStateAction<ShootSummary[]>>;
  
  shouldUpdateShoots: boolean;
  setShouldUpdateShoots: Dispatch<SetStateAction<boolean>>;
  
  currentShootsPage: number;
  setCurrentShootsPage: Dispatch<SetStateAction<number>>;
  
  finalShootsPageLoaded: boolean;
  setFinalShootsPageLoaded: Dispatch<SetStateAction<boolean>>;
  
  // handler functions
  handleToggleSideNav: () => void;
  handleTouchOffDiv: () => void;
  handleIsOnSamePage: (e?: MouseEvent<HTMLElement>) => void;
  handleSideNavLinkClick: (e: MouseEvent<HTMLAnchorElement>) => void;
  handleLogoutUser: () => void;
  handleNavigateHome: (tagObj?: ShootEntity) => void;
  handleSetShowSideNavFalse: () => void;
  shootOrderIsEditable: boolean;
  setShootOrderIsEditable: Dispatch<SetStateAction<boolean>>;

  showFloatingButton: boolean;
  setShowFloatingButton: Dispatch<SetStateAction<boolean>>;
  handleNavigateToAddShoot: () => void;
  handleNavigateToEditShoot: (id: number | null) => void;
  
  // functions
  getPrevScrollYPosValue: () => number;
  handleClearAppState: (logOutUser?: boolean) => void;
  handleRefreshShoots: () => void;
};

export interface ModalContextValue {
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  // handleClearModal: () => void;
  handleClearModal: (clearAppIsLoading?: boolean) => void;
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

export interface NavPage {
  pageName: string;
  href: string;
  modifierClass?: string;
  icon: ComponentType<SVGProps<SVGSVGElement>> | null;
}

export interface NavSelectProps {
  selectOptions: ShootEntity[];
  modifierClass?: string;
}

export interface BioData {
	bioName: string;
	bioText: string;
	bioImgURL: string;
	bioImageNotSet: boolean;
}

interface BioResponse {
	success: boolean;
	data?: BioData;
	message?: string;
}

interface ClientButtonProps {
  text: string; 
  variant?: string;
  buttonType: string;
  modifierClass?: string;
}

interface InputPhoto {
  photoNo: number;
  photoPreview: string | null;
  photoData: File | Blob | null;
  displayOrder: number;
}

interface BioUpdateData {
  bioName: string;
  bioText: string;
  photo: InputPhoto;
}

interface PhotoInputProps {
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

interface UpdatedBioData {
  bio_name: string;
  bio_img_url: string;
  bio_text: string;
  updated_Photo: boolean;
}

interface ShootSummary {
  shootID: number;
  displayOrder: number;
  shootDate: string;
  tags: string[];
  photographers: string[];
  models: string[];
  thumbnailURL: string;
}

interface GetShootSummariesParams {
  page?: number;
  limit?: number;
  tagID?: number | string;
}

interface GetShootSummariesResponse {
  shootSummaries: ShootSummary[];
  isFinalPage: boolean;
}

interface ShootProps {
  shootID?: number;
  displayOrder?: number;
  thumbnailURL?: string;
  models?: string[];
  photographers?: string[];
  isOnShootDetails?: boolean;
  shootOrderIsEditable?: boolean;
  handleShootDragStart?: (e: DragEvent<HTMLDivElement> | MouseEvent<HTMLDivElement>, shootID: number) => void;
  handleDropShootTarget?: (shootID: number, displayOrder: number) => void;
}

interface ModalData {
    e?: MouseEvent<HTMLElement>;
    action: "add" | "edit" | "delete";
    entityType: "bio" | "shoot" | "tag" | "model" | "photographer";
    entityName?: string | null;
    entityID?: number | null;
}

interface ShootDetailPhoto {
  id: number;
  display_order: number;
  photo_url: string;
}

interface ShootDetailData {
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

interface ShootDetailResponse {
  success: boolean;
  message: string;
  data: ShootDetailData | null;
}

interface ShootDetailsPageProps {
  params: Promise<{ id: string }>;
}

interface AuthCredentials {
  email?: string;
  password?: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  userId?: number;
}

interface TokenPayload {
  userId: number;
}

interface UserRow extends RowDataPacket {
  id: number;
  email: string;
  password: string;
}

interface SessionResponse {
  isAuthenticated: boolean;
  userId?: number;
}

interface TokenDetails {
  signature: string; 
  expiresAt: Date;
}

interface ActionResponse {
  success: boolean;
  message: string;
}

interface ChooserEntry {
  chooserNo: number;
  photographerID?: number | null;
  photographerName?: string | null;
  modelID?: number | null;
  name?: string | null;
  tagID?: number | null;
  [key: string]: unknown;
}

interface ChooserItem {
  number: number;
  id: number | null;
  name: string | null;
}

interface SelectOption {
  id: number;
  name: string;
}

interface ShootDatePickerProps {
  id: string;
  shootDate: Date | null;
  setShootDate: (date: Date | null) => void;
  className?: string;
  rawDate?: Date | null;
};
interface CustomSelectProps {
  selectOptions: ShootEntity[];
  entityType: "tag" | "model" | "photographer";
  selectValue: string | null;
  chooserNumber: number;
  selectChoosers: ChooserItem[];
  setSelectChoosers: Dispatch<SetStateAction<ChooserItem[]>>;
}

interface GetAllTagsResponse {
  success: boolean;
  message: string;
  tags: ShootEntity[];
}


interface TagRow extends RowDataPacket {
  id: number;
  tag_name: string;
}

interface AddTagResponse {
  success: boolean;
  message: string;
  tags?: ShootEntity[];
}

interface EditTagResponse {
  success: boolean;
  message: string;
  updatedTag?: ShootEntity;
}

interface ShootLinkRow extends RowDataPacket {
  shoot_id: number;
}

interface ShootRow extends RowDataPacket {
  id: number;
}

interface TagShoot {
  shoot_id: number;
}

interface DeleteTagResponse {
  success: boolean;
  message: string;
  tags?: ShootEntity[];
  tagShoots?: TagShoot[];
}


interface ModelRow extends RowDataPacket {
  id: number;
  model_name: string;
}

interface GetAllModelsResponse {
  success: boolean;
  message: string;
  models: ShootEntity[];
}

interface AddModelResponse {
  success: boolean;
  message: string;
  models?: ShootEntity[];
}

interface EditModelResponse {
  success: boolean;
  message: string;
  updatedModel?: ShootEntity;
}

interface ModelShoot {
  shoot_id: number;
}

interface DeleteModelResponse {
  success: boolean;
  message: string;
  models?: ShootEntity[];
  modelShoots?: ModelShoot[];
}

interface PhotographerRow extends RowDataPacket {
  id: number;
  photographer_name: string;
}

interface GetAllPhotographersResponse {
  success: boolean;
  message: string;
  photographers: ShootEntity[];
}

interface AddPhotographerResponse {
  success: boolean;
  message: string;
  photographers?: ShootEntity[];
}

interface EditPhotographerResponse {
  success: boolean;
  message: string;
  updatedPhotographer?: ShootEntity;
}

interface PhotographerShoot {
  shoot_id: number;
}

interface DeletePhotographerResponse {
  success: boolean;
  message: string;
  photographers?: ShootEntity[];
  photographerShoots?: PhotographerShoot[];
}

interface ShootEntity {
  id: number;
  name: string;
}

interface ShootData {
  shoot_date: string;
  tag_ids: number[];
  photographer_ids: number[];
  model_ids: number[];
  photo_urls: string[];
}

interface ColorModeToggleProps {
  inputId?: string;
}


export {
  type BioResponse,
  type ClientButtonProps,
  type InputPhoto,
  type BioUpdateData,
  type PhotoInputProps,
  type UpdatedBioData,
  type ShootSummary,
  type GetShootSummariesParams,
  type GetShootSummariesResponse,
  type ShootProps,
  type ModalData,
  type ShootDetailPhoto,
  type ShootDetailResponse,
  type ShootDetailsPageProps,
  type AuthResponse,
  type AuthCredentials,
  type TokenPayload,
  type UserRow,
  type SessionResponse,
  type TokenDetails,
  type ActionResponse,
  type ChooserEntry, 
  type SelectOption, 
  type ShootDatePickerProps, 
  type CustomSelectProps, 
  type AddTagResponse,
  type EditTagResponse,
  type GetAllTagsResponse,
  type TagRow,
  type ShootLinkRow,
  type ShootRow,
  type DeleteTagResponse,
  type TagShoot,
  type ShootEntity,
  type ChooserItem,
  type ModelRow,
  type GetAllModelsResponse,
  type AddModelResponse,
  type EditModelResponse,
  type ModelShoot,
  type DeleteModelResponse,
  type PhotographerRow,
  type GetAllPhotographersResponse,
  type AddPhotographerResponse,
  type EditPhotographerResponse,
  type PhotographerShoot,
  type DeletePhotographerResponse,
  type ShootData,
  type ColorModeToggleProps,
}
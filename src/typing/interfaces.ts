import { 
  type ReactNode, 
  type ChangeEvent,
  type SetStateAction, 
  type Dispatch, 
  type MouseEvent,
  type DragEvent,
  type ComponentType, 
  type SVGProps 
} from "react";
import { type RowDataPacket } from "mysql2";
import { type TypeOptions } from "react-toastify";
import { 
  type ToastType, 
  type EntryNameType, 
  type ModalActionType, 
} from "./types";

interface ContextProviderProps {
  children: ReactNode;
};

interface AppContextValue {
  // Loading & Session State
  appIsLoading: boolean;
  setAppIsLoading: Dispatch<SetStateAction<boolean>>;
  isLoggedIn: boolean;
  setIsLoggedIn: Dispatch<SetStateAction<boolean>>;

  // Layout & Navigation State
  showSideNav: boolean;
  setShowSideNav: Dispatch<SetStateAction<boolean>>;  
  showTouchOffDiv: boolean;
  setShowTouchOffDiv: Dispatch<SetStateAction<boolean>>;
  scrollYPos: number;
  setScrollYPos: Dispatch<SetStateAction<number>>;
  navSelectValue: string | null;
  setNavSelectValue: Dispatch<SetStateAction<string | null>>;
  showNavSelectOptions: boolean;
  setShowNavSelectOptions: Dispatch<SetStateAction<boolean>>;
  showFloatingButton: boolean;
  setShowFloatingButton: Dispatch<SetStateAction<boolean>>;

  // Entities & Choosers
  selectedTag: ShootEntity | null;
  setSelectedTag: Dispatch<SetStateAction<ShootEntity | null>>;
  tags: ShootEntity[];
  setTags: Dispatch<SetStateAction<ShootEntity[]>>;
  tagChoosers: ChooserItem[];
  setTagChoosers: Dispatch<SetStateAction<ChooserItem[]>>;

  // Entity Refresh Flags
  shouldRefreshTags: boolean;
  setShouldRefreshTags: Dispatch<SetStateAction<boolean>>;
  shouldRefreshModels: boolean;
  setShouldRefreshModels: Dispatch<SetStateAction<boolean>>;
  shouldRefreshPhotographers: boolean;
  setShouldRefreshPhotographers: Dispatch<SetStateAction<boolean>>;

  // Shoots State & Pagination
  shoots: ShootSummary[];
  setShoots: Dispatch<SetStateAction<ShootSummary[]>>;
  shouldUpdateShoots: boolean;
  setShouldUpdateShoots: Dispatch<SetStateAction<boolean>>;
  currentShootsPage: number;
  setCurrentShootsPage: Dispatch<SetStateAction<number>>;
  finalShootsPageLoaded: boolean;
  setFinalShootsPageLoaded: Dispatch<SetStateAction<boolean>>;
  shootOrderIsEditable: boolean;
  setShootOrderIsEditable: Dispatch<SetStateAction<boolean>>;

  // UI & Action Handlers
  handleToggleSideNav: () => void;
  handleTouchOffDiv: () => void;
  handleSetShowSideNavFalse: () => void;
  handleIsOnSamePage: (e?: MouseEvent<HTMLElement>) => void;
  handleSideNavLinkClick: (e: MouseEvent<HTMLAnchorElement>) => void;
  handleNavigateHome: (tagObj?: ShootEntity) => void;
  handleNavigateToAddShoot: () => void;
  handleNavigateToEditShoot: (id: number | null) => void;
  handleLogoutUser: (
    messageOrEvent?: MouseEvent<HTMLElement> | string,
    messageType?: TypeOptions
  ) => Promise<void>;
  
  // Utilities
  getPrevScrollYPosValue: () => number;
  handleClearAppState: (logOutUser?: boolean) => void;
  handleRefreshShoots: () => void;
}

interface ModalContextValue {
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  modalAction: string | null;
  setModalAction: Dispatch<SetStateAction<string | null>>;
  modalEntityType: string | null;
  setModalEntityType: Dispatch<SetStateAction<string | null>>;
  modalEntityID: number | null;
  setModalEntityID: Dispatch<SetStateAction<number | null>>;
  modalEntityName: string | null;
  setModalEntityName: Dispatch<SetStateAction<string | null>>;
  handleOpenModal: (data: ModalData) => void;
  handleClearModal: () => void;
}

interface NavPage {
  pageName: string;
  href: string;
  modifierClass: string;
  icon: ComponentType<SVGProps<SVGSVGElement>> | null;
}

interface ShootEntity {
  id: number;
  name: string;
}

interface ChooserItem {
  number: number;
  id: number | null;
  name: string | null;
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

interface ShootSummary {
  shootID: number;
  displayOrder: number;
  shootDate: string;
  tags: string[];
  photographers: string[];
  models: string[];
  thumbnailURL: string;
}

interface ShootDetailPhoto {
  id: number;
  display_order: number;
  photo_url: string;
}

interface BioData {
	bioName: string;
	bioText: string;
	bioImgURL: string;
	bioImageNotSet: boolean;
}

interface UpdatedBioData {
  bio_name: string;
  bio_img_url: string;
  bio_text: string;
  updated_Photo: boolean;
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

interface IconProps {
  className?: string;
  strokeClassName?: string;
}

interface ClientButtonProps {
  text: string; 
  variant?: string;
  buttonType: string;
  modifierClass?: string;
}

interface NavSelectProps {
  selectOptions: ShootEntity[];
  modifierClass?: string;
}

interface NavLinkProps {
  children?: ReactNode;
  href: string;
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
  entityType: EntryNameType;
  selectValue: string | null;
  chooserNumber: number;
  selectChoosers: ChooserItem[];
  setSelectChoosers: Dispatch<SetStateAction<ChooserItem[]>>;
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

interface ShootProps {
  shootID?: number;
  displayOrder?: number;
  thumbnailURL?: string;
  models?: string[];
  photographers?: string[];
  isOnShootDetails?: boolean;
  shootOrderIsEditable?: boolean;
  handleShootDragStart?: (
    e: DragEvent<HTMLDivElement> | MouseEvent<HTMLDivElement>, 
    shootID: number
  ) => void;
  handleDropShootTarget?: (shootID: number, displayOrder: number) => void;
}

interface ShootDetailsPageProps {
  params: Promise<{ id: string }>;
}

interface ModalData {
  e?: MouseEvent<HTMLElement>;
  action: ModalActionType | "add" | "edit" | "delete";
  entityType: EntryNameType | "bio" | "shoot";
  entityName?: string | null;
  entityID?: number | null;
}

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
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

interface ShootData {
  shoot_date: string;
  tag_ids: number[];
  photographer_ids: number[];
  model_ids: number[];
  photo_urls: string[];
}

interface LogoutUser {
  messageOrEvent?: MouseEvent<HTMLButtonElement> | string;
  messageType: ToastType;
}

interface AuthCredentials {
  email?: string;
  password?: string;
}

interface TokenPayload {
  userId: number;
}

interface TokenDetails {
  signature: string; 
  expiresAt: Date;
}

interface UserRow extends RowDataPacket {
  id: number;
  email: string;
  password: string;
}

interface EntityRow extends RowDataPacket {
  id: number;
  name: string;
}

interface BioResponse {
	success: boolean;
	data?: BioData;
	message?: string;
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

interface ShootDetailResponse {
  success: boolean;
  message: string;
  data: ShootDetailData | null;
}

interface AuthResponse {
  success: boolean;
  message: string;
  userId?: number;
}

interface SessionResponse {
  isAuthenticated: boolean;
  userId?: number;
}

interface ActionResponse {
  success: boolean;
  message: string;
}

interface GetAllTagsResponse {
  success: boolean;
  message: string;
  tags: ShootEntity[];
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

interface DeleteTagResponse {
  success: boolean;
  message: string;
  tags?: ShootEntity[];
  tagShoots?: TagShoot[];
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

interface DeleteModelResponse {
  success: boolean;
  message: string;
  models?: ShootEntity[];
  modelShoots?: ModelShoot[];
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

interface DeletePhotographerResponse {
  success: boolean;
  message: string;
  photographers?: ShootEntity[];
  photographerShoots?: PhotographerShoot[];
}

interface ColorModeToggleProps {
  inputId?: string;
}

interface TagShoot {
  shoot_id: number;
}

interface ModelShoot {
  shoot_id: number;
}

interface PhotographerShoot {
  shoot_id: number;
}

export {
  type ContextProviderProps,
  type AppContextValue,
  type ModalContextValue,
  type ShootEntity,
  type ChooserItem,
  type ChooserEntry,
  type ShootSummary,
  type ShootDetailPhoto,
  type BioData,
  type UpdatedBioData,
  type ShootDetailData,
  type IconProps,
  type NavPage,
  type ClientButtonProps,
  type NavSelectProps,
  type NavLinkProps,
  type ShootDatePickerProps,
  type CustomSelectProps,
  type PhotoInputProps,
  type ShootProps,
  type ShootDetailsPageProps,
  type ModalData,
  type ContactFormData,
  type InputPhoto,
  type BioUpdateData,
  type ShootData,
  type LogoutUser,
  type AuthCredentials,
  type TokenPayload,
  type TokenDetails,
  type UserRow,
  type EntityRow,
  type BioResponse,
  type GetShootSummariesParams,
  type GetShootSummariesResponse,
  type ShootDetailResponse,
  type AuthResponse,
  type SessionResponse,
  type ActionResponse,
  type GetAllTagsResponse,
  type AddTagResponse,
  type EditTagResponse,
  type ShootLinkRow,
  type ShootRow,
  type DeleteTagResponse,
  type GetAllModelsResponse,
  type AddModelResponse,
  type EditModelResponse,
  type DeleteModelResponse,
  type GetAllPhotographersResponse,
  type AddPhotographerResponse,
  type EditPhotographerResponse,
  type DeletePhotographerResponse,
  type ColorModeToggleProps,
  type TagShoot,
  type ModelShoot,
  type PhotographerShoot,
};
export type ColorMode = "light" | "dark";

export type ToastType =
  | "default"
  | "success"
  | "error"
  | "info"
  | "warning";


type ChooserType = "Photographer" | "Model" | "Tag";

type EntryNameType = "model" | "photographer" | "tag";

type ModalActionType = "Add" | "Edit" | "Delete";

export {
  type ChooserType,
  type EntryNameType,
  type ModalActionType
};
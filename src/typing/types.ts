export type ColorMode = "light" | "dark";

export type ToastType =
  | "default"
  | "success"
  | "error"
  | "info"
  | "warning";


type ChooserType = "Photographer" | "Model" | "Tag";

type EntryNameType = "photographer_name" | "model_name" | "tag_name";

type ModalActionType = "Add" | "Edit" | "Delete";

export {
  type ChooserType,
  type EntryNameType,
  type ModalActionType
}
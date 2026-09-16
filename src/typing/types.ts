type ToastType =
  | "default"
  | "success"
  | "error"
  | "info"
  | "warning";


type ChooserType = "Photographer" | "Model" | "Tag";

type EntryNameType = "model" | "photographer" | "tag";

type ModalActionType = "Add" | "Edit" | "Delete";

export {
  type ToastType,
  type ChooserType,
  type EntryNameType,
  type ModalActionType
};
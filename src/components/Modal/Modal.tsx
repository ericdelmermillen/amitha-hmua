"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, SyntheticEvent, useCallback } from "react";
import { useAppContext, useModalContext } from "@/hooks/hooks";
import { deleteShootByID } from "@/actions/shootActions";
import { addTag, deleteTagByID, editTagByID } from "@/actions/tagActions";
import { addModel, deleteModelByID, editModelByID } from "@/actions/modelActions";
import { addPhotographer, deletePhotographerByID, editPhotographerByID } from "@/actions/photographerActions";
import { normalizeCasing, scrollToTop } from "@/utils/utils";
import { toast } from "react-toastify";
import "./Modal.scss";

const MIN_LOADING_INTERVAL = parseInt(process.env.NEXT_PUBLIC_MIN_LOADING_INTERVAL || "250", 10);

const Modal = () => {
  const { 
    scrollYPos,
    appIsLoading,
    setAppIsLoading,
    handleRefreshShoots,
    handleNavigateToEditShoot,
    setShouldRefreshTags,
    setShouldRefreshModels,
    setShouldRefreshPhotographers
  } = useAppContext();

  const { 
    showModal,
    setShowModal,
    modalAction,
    modalEntityType,
    modalEntityID,
    handleClearModal,
    modalEntityName
  } = useModalContext();

  const [ cancelling, setCancelling ] = useState(false);

  const newEntryNameRef = useRef<HTMLInputElement>(null);
  const modalCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const router = useRouter();

  const isEditBioMode = modalAction === "edit"  && modalEntityType === "bio";
  const isEditShootMode = modalAction === "edit" && modalEntityType === "shoot";

  const isAddModelMode = modalAction === "add" && modalEntityType === "model";
  const isAddPhotographerMode = modalAction === "add" && modalEntityType === "photographer";
  const isAddTagMode = modalAction === "add" && modalEntityType === "tag";

  const isEditModelMode = modalAction === "edit" && modalEntityType === "model";
  const isEditPhotographerMode = modalAction === "edit" && modalEntityType === "photographer";
  const isEditTagMode = modalAction === "edit" && modalEntityType === "tag";
  
  const isDeleteModelMode = modalAction === "delete" && modalEntityType === "model";
  const isDeletePhotographerMode = modalAction === "delete" && modalEntityType === "photographer";
  const isDeleteTagMode = modalAction === "delete" && modalEntityType === "tag";
  const isDeleteShootMode = modalAction === "delete" && modalEntityType === "shoot";

  const handleDeleteShoot = async () => {
    if (!modalEntityID) {
      return;
    }

    const modalEntityIDNum = parseInt(String(modalEntityID), 10);
    

    if (isNaN(modalEntityIDNum)) {
      console.error("Invalid shoot ID provided for deletion");
      return;
    }

    try {
      setAppIsLoading(true);
      const response = await deleteShootByID(modalEntityIDNum);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
      } else {
        handleRefreshShoots();
        toast.success(response.message);
      }
      
    } catch (error) {
      console.error("Error executing handleDeleteShoot:", error);
    } finally {
      setAppIsLoading(false);
      scrollToTop();
    }
  };
  
  const handleSubmit = async (e?: SyntheticEvent<HTMLFormElement>) => {
    if (e) {
      e.preventDefault();
    }
    
    if (isDeleteShootMode) {
      await handleDeleteShoot();
      return transitionModalClose();
    }
    
    if (isEditBioMode) {
      setAppIsLoading(true);
      router.push("/bio/edit"); 
      return transitionModalClose();
    }

    if (isEditShootMode) {
      setAppIsLoading(true);
      transitionModalClose();
      return handleNavigateToEditShoot(modalEntityID);
    }

    if (modalAction !== "add" && (modalEntityID === null || typeof modalEntityID !== "number")) {
      return;
    }

    let newName = "";

    if (modalAction === "edit" || modalAction === "add") {
      newName = newEntryNameRef.current?.value.trim() ?? "";

      if (!newName) {
        toast.error("New name cannot be empty");
        return;
      }

      if (modalAction === "edit" && newName === modalEntityName) {
        toast.error("The new name is the same as the previous name");
        return;
      }
    }

    try {
      setAppIsLoading(true);

      let response: any = null;

      if (isAddModelMode) {
        response = await addModel(newName);
      } else if (isAddPhotographerMode) {
        response = await addPhotographer(newName);
      } else if (isAddTagMode) {
        response = await addTag(newName);
      } else if (isEditTagMode) {
        response = await editTagByID(modalEntityID as number, newName);
      } else if (isEditModelMode) {
        response = await editModelByID(modalEntityID as number, newName);
      } else if (isEditPhotographerMode) {
        response = await editPhotographerByID(modalEntityID as number, newName);
      } else if (isDeleteModelMode) {
        response = await deleteModelByID(modalEntityID as number);
      } else if (isDeletePhotographerMode) {
        response = await deletePhotographerByID(modalEntityID as number);
      } else if (isDeleteTagMode) {
        response = await deleteTagByID(modalEntityID as number);
      }

      if (response && response.success) {
        const successMessage = modalAction === "add"
          ? `${normalizeCasing(modalEntityType ?? "")} "${newName}" successfully created` 
          : modalAction === "edit"
          ? `${normalizeCasing(modalEntityType ?? "")} "${modalEntityName}" updated to "${response.updatedTag?.name ?? newName}"`
          : response.message || `${normalizeCasing(modalEntityType ?? "")} "${modalEntityName}" deleted successfully`;

        toast.success(successMessage);
        
        if (modalEntityType === "model") {
          setShouldRefreshModels(true);
        } else if (modalEntityType === "photographer") {
          setShouldRefreshPhotographers(true);
        } else if (modalEntityType === "tag") {
          setShouldRefreshTags(true);
        }
        
      } else {
        throw new Error(response?.message || `Failed to ${modalAction} ${modalEntityType}`);
      }
    } catch (error: any) {
      console.error(`Error processing ${modalAction} for ${modalEntityType}:`, error);
      toast.error(error?.message || "An unexpected error occurred");
    } finally {
      transitionModalClose(true);
    }
  };

  const handleModalClearing = useCallback(() => {
    if (newEntryNameRef.current) {
      newEntryNameRef.current.value = "";
    }
    handleClearModal();
  }, [handleClearModal]);

  const transitionModalClose = useCallback((handleFinishIsLoading = false) => {
    if (modalCloseTimeoutRef.current) {
      clearTimeout(modalCloseTimeoutRef.current);
    }

    setShowModal(false);
    modalCloseTimeoutRef.current = setTimeout(() => {
      handleModalClearing();
      if (handleFinishIsLoading) {
        setAppIsLoading(false);
      }
    }, MIN_LOADING_INTERVAL * 2);
  }, [setShowModal, handleModalClearing, setAppIsLoading]);

  const handleCancel = () => {
    setCancelling(true);
    transitionModalClose(true);
  };

  // useEffect to hide and clear modal on esc
  useEffect(() => {
    const handleKeyDown =  (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        transitionModalClose();
      };
    };

    if (showModal) {
      window.addEventListener("keydown", handleKeyDown);
    };

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showModal, transitionModalClose]);

  // useEffect to clear modal on scroll
  useEffect(() => {
    if (showModal) {
      transitionModalClose();
    };
  }, [scrollYPos]);

  // useEffect to clear newEntryNameRef on opening the modal
  useEffect(() => {
    if (showModal && newEntryNameRef.current) {
      newEntryNameRef.current.value = modalAction === "edit" ? (modalEntityName ?? "") : "";
    }
  }, [showModal, modalAction, modalEntityName]);

  // useEffect to handle clearing modalCloseTimeoutRef
  useEffect(() => {
    return () => {
      if (modalCloseTimeoutRef.current) {
        clearTimeout(modalCloseTimeoutRef.current);
      }
    };
  }, []);
  
  // useEffect to reset cancelling when modal opens again
  useEffect(() => {
    if (showModal) {
      setCancelling(false);
    }
  }, [showModal]);

  return (
    <div className={`modal ${showModal ? "show" : ""}`}>
      <div className="modal__overlay" onClick={() => handleCancel()}></div>
      <div className="modal__card">

        <form className="modal__form" onSubmit={handleSubmit}>
          <h3 className="modal__heading">
            {`${isEditBioMode
              ? "Edit Your Bio Page?"
              : isEditShootMode || isDeleteShootMode
              ? `${normalizeCasing(modalAction)} Shoot ${modalEntityID}?`
              : modalAction === "add"
              ? `${normalizeCasing(modalAction ?? "")} New ${normalizeCasing(modalEntityType ?? "")}`
              : `${normalizeCasing(modalAction ?? "")} ${normalizeCasing(modalEntityType ?? "")} "${modalEntityName}"?`
            }`}
          </h3>

          {((modalAction === "add" || modalAction === "edit") && !isEditShootMode && !isEditBioMode) && 

            <input 
              className='modal__input'
              placeholder={`Enter new ${modalEntityType} name`}
              defaultValue={modalEntityName ?? ""}
              ref={newEntryNameRef}
              type="text"
              autoFocus
            />
              
          }

          {modalAction === "delete" && !isDeleteShootMode &&
              
            <p className="modal__explainer">
              You will have to add {modalEntityType === "tag" ? `it` : "them"} back if you want to use {modalEntityType === "tag" ? "it" : "them"} in a new Shoot. 
            </p>
              
          }

          <div className="modal__button-container">
            <button
              className="modal__button modal__button--edit"
              type="submit"
              disabled={cancelling || appIsLoading}
            >
              {isEditBioMode
                ? "Edit Bio"
                : isEditShootMode
                ? "Edit Shoot"
                : modalAction === "add"
                ? "Create"
                : modalAction === "edit"
                ? "Update"
                : "Delete"
              }
            </button>
            <button
              className={`modal__button modal__button--cancel ${cancelling ? "disabled" : ""}`}
              onClick={handleCancel}
              disabled={cancelling}
              type="button"
            >
              Cancel
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default Modal;
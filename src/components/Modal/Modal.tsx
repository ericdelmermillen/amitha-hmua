"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, ChangeEvent, SyntheticEvent } from "react";
import { useAppContext, useModalContext } from "@/hooks/hooks";
import { deleteShootByID } from "@/actions/shootActions";
import { deleteTagByID, editTagByID } from "@/actions/tagActions";
import { normalizeCasing, scrollToTop } from "@/utils/utils";
import { deletePhotographerByID, editPhotographerByID } from "@/actions/photographerActions";
import { deleteModelByID, editModelByID } from "@/actions/modelActions";
import { toast } from "react-toastify";
import "./Modal.scss";

const MIN_LOADING_INTERVAL = Number(process.env.NEXT_PUBLIC_MIN_LOADING_INTERVAL);

const Modal = () => {
  const { 
    scrollYPos,
    setAppIsLoading,
    handleRefreshShoots,
    handleNavigateToEditShoot,
    setShouldRefreshTags,
    setShouldRefreshModels,
    setShouldRefreshPhotographers
  } = useAppContext();

  const { 
    showModal,
    modalAction,
    modalEntityType,
    modalEntityID,
    handleClearModal,
    modalEntityName
  } = useModalContext();

  const [ cancelling, setCancelling ] = useState(false);

  const newEntryNameRef = useRef<HTMLInputElement>(null);
  
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
      
      setTimeout(() => {
        handleModalClearing();
        scrollToTop();
      }, MIN_LOADING_INTERVAL);
      return;
    }
  };

  const handleAddEntry = async (e?: SyntheticEvent<HTMLFormElement>) => {
    if (e) {
      e.preventDefault();
    }

    const newName = newEntryNameRef.current?.value.trim() ?? "";

    console.log(`Adding ${modalEntityType}:`, newName);
  };


  const handleSubmit = async (e?: SyntheticEvent<HTMLFormElement>) => {
    if (e) {
      e.preventDefault();
    }
    
    if (isDeleteShootMode) {
      return handleDeleteShoot();
    }
    
    if (isEditBioMode) {
      setAppIsLoading(true)
      router.push("/bio/edit"); 
      return handleModalClearing();
    }

    if (isEditShootMode) {
      console.log(`Editing shoot ${modalEntityID}...`)
      setAppIsLoading(true);
      handleNavigateToEditShoot(modalEntityID);
      return handleModalClearing();
    }

    if (modalEntityID === null || typeof modalEntityID !== "number") {
      return;
    }

    let newName = "";

    if (modalAction === "edit" || modalAction === "add") {
      newName = newEntryNameRef.current?.value.trim() ?? "";

      if (!newName) {
        toast.error("New name cannot be empty");
        return;
      }

      if (newName === modalEntityName) {
        toast.error("The new name is the same as the previous name");
        return;
      }
    }

    try {
      setAppIsLoading(true);

      let response: any = null;

      if (isEditTagMode) {
        response = await editTagByID(modalEntityID, newName);
      } else if (isEditModelMode) {
        response = await editModelByID(modalEntityID, newName);
      } else if (isEditPhotographerMode) {
        response = await editPhotographerByID(modalEntityID, newName);
      } else if (isDeleteModelMode) {
        response = await deleteModelByID(modalEntityID);
      } else if (isDeletePhotographerMode) {
        response = await deletePhotographerByID(modalEntityID);
      } else if (isDeleteTagMode) {
        response = await deleteTagByID(modalEntityID);
      }

      if (response.success) {
        const successMessage = modalAction === "add"
            ? `${normalizeCasing(modalEntityType ?? "")} ${modalEntityName} successfully created` 
            : modalAction === "edit"
            ? `${normalizeCasing(modalEntityType ?? "")} "${modalEntityName}" updated to "${response.updatedTag?.name ?? newName}"`
            : response.message || `${normalizeCasing(modalEntityType ?? "")} "${modalEntityName}" deleted successfully`;

        toast.success(successMessage);
        
        if (modalEntityType === "model") {
          setShouldRefreshModels(true);
        }

        if (modalEntityType === "photographer") {
          setShouldRefreshPhotographers(true);
        }

        if (modalEntityType === "tag") {
          setShouldRefreshTags(true);
        }

      } else {
        throw new Error(response?.message || `Failed to ${modalAction} ${modalEntityType}`);
      }
    } catch (error: any) {
      console.error(`Error editing ${modalEntityType}:`, error);
      toast.error(error?.message || "An unexpected error occurred");
    } finally {
      setTimeout(() => {
        handleModalClearing(true);
      }, MIN_LOADING_INTERVAL * 2);
    }
  };

  const handleModalClearing = (clearAppIsLoading: boolean = false) => {
    if (newEntryNameRef.current) {
      newEntryNameRef.current.value = "";
    }
    handleClearModal(clearAppIsLoading);
  };

  const handleCancel = () => {
    setCancelling(true);
    handleModalClearing();
  };


    // useEffect to hide and clear modal on esc
  useEffect(() => {
    const handleKeyDown =  (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleModalClearing();
      };
    };

    if (showModal) {
      window.addEventListener("keydown", handleKeyDown);
    };

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showModal, handleClearModal]);

  // useEffect to clear modal on scroll
  useEffect(() => {
    if (showModal) {
      handleModalClearing();
    };
  }, [scrollYPos]);

  // useEffect to clear newEntryNameRef on opening the modal
  useEffect(() => {
    if (showModal && newEntryNameRef.current) {
      newEntryNameRef.current.value = modalAction === "edit" ? (modalEntityName ?? "") : "";
    }
  }, [showModal, modalAction, modalEntityName]);
  
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

          {(modalAction === "add" || modalAction === "edit" && !isEditShootMode && !isEditBioMode) && 

            <input 
              className='modal__input'
              placeholder={`Enter new ${modalEntityType} name`}
              type="text"
              defaultValue={modalEntityName ?? ""}
              ref={newEntryNameRef}
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
            >
              {isEditBioMode
                ? "Edit Bio"
                : isEditShootMode
                ? "Edit Shoot"
                : `${normalizeCasing(modalAction ?? "")}`
              }
            </button>
            <button
              className={`modal__button modal__button--cancel ${cancelling ? "disabled" : ""}`}
              onClick={handleCancel}
              disabled={cancelling}
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
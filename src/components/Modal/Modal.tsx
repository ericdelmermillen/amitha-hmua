"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAppContext, useModalContext } from "@/hooks/hooks";
import { deleteShootByID } from "@/actions/shootActions";
import { deleteTagByID } from "@/actions/tagActions";
import { normalizeCasing, scrollToTop } from "@/utils/utils";
import { toast } from "react-toastify";
import "./Modal.scss";

const MIN_LOADING_INTERVAL = Number(process.env.NEXT_PUBLIC_MIN_LOADING_INTERVAL);

const Modal = () => {
  const { 
    setAppIsLoading,
    scrollYPos,
    handleRefreshShoots,
    handleNavigateToEditShoot,
    setShouldRefreshTags
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
  
  const router = useRouter();

  const handleEditBio = () => {
    setAppIsLoading(true)
    router.push("/bio/edit");
    handleClearModal();
  };
  
  const handleDeleteShoot = async () => {
    console.log(`Deleting shoot ${modalEntityID}...`)
    
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
        handleClearModal();
        scrollToTop();
      }, MIN_LOADING_INTERVAL);
      return;
    }
  };


  const handleEditTag = async () => {
    if (modalEntityID === null || typeof modalEntityID !== "number") {
      console.error("Invalid tag ID provided for deletion");
      return;
    }

    console.log(`Edit tag ${normalizeCasing(modalEntityName ?? undefined)}`)

    // try {
    //   setAppIsLoading(true);
    //   const response = await deleteTagByID(modalEntityID);

    //   if (response.success) {
    //     toast.success(`Tag ${normalizeCasing(modalEntityName ?? undefined)} deleted successfully`);
    //     setShouldRefreshTags(true);

    //   } else {
    //     toast.error(response.message)
    //     console.error(response.message);
    //   }

    // } catch (error: any) {
    //   console.error("Error executing handleDeleteTag:", error);
    //   toast.error(`Error deleting tag ${modalEntityName}: ${error?.message || "Unknown error"}`);
    // } finally {
    //   setTimeout(() => {
    //     handleClearModal();
    //   }, MIN_LOADING_INTERVAL * 2);
    // }
  }

  const handleDeleteTag = async () => {
    if (modalEntityID === null || typeof modalEntityID !== "number") {
      console.error("Invalid tag ID provided for deletion");
      return;
    }

    try {
      setAppIsLoading(true);
      const response = await deleteTagByID(modalEntityID);

      if (response.success) {
        toast.success(`Tag ${normalizeCasing(modalEntityName ?? undefined)} deleted successfully`);
        setShouldRefreshTags(true);

      } else {
        toast.error(response.message)
        console.error(response.message);
      }

    } catch (error: any) {
      console.error("Error executing handleDeleteTag:", error);
      toast.error(`Error deleting tag ${modalEntityName}: ${error?.message || "Unknown error"}`);
    } finally {
      setTimeout(() => {
        handleClearModal();
      }, MIN_LOADING_INTERVAL * 2);
    }
  }


  const handleEditShoot = () => {
    // can use function from context to refresh feed via new call
    console.log(`Editing shoot ${modalEntityID}...`)
    setAppIsLoading(true);
    handleNavigateToEditShoot(modalEntityID);
    handleClearModal();
  };

  const handleCancel = () => {
    setCancelling(true);
    handleClearModal();
  }

    // useEffect to hide and clear modal on esc
  useEffect(() => {
    const handleKeyDown =  (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClearModal();
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
      handleClearModal();
    };
  }, [scrollYPos]);

  // useEffect to reset cancelling when modal opens again
  useEffect(() => {
    if (showModal) {
      setCancelling(false);
    }
  }, [showModal]);


  return (
    <div className={`modal ${showModal ? "show" : ""}`}>
      <div className="modal__overlay" onClick={handleClearModal}></div>
      <div className="modal__card">

        {modalAction === "edit"  && modalEntityType === "bio"

          ? (
              <>
                <h3 className="modal__heading">
                  Edit Your Bio Page?
                </h3>
                <div className="modal__button-container">
                  <button
                    className="modal__button modal__button--edit"
                    onClick={handleEditBio}
                  >
                    Edit Bio
                  </button>
                  <button
                    className={`modal__button modal__button--cancel ${cancelling ? "disabled" : ""}`}
                    onClick={handleCancel}
                    disabled={cancelling}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )
          : modalAction === "delete" && modalEntityType === "shoot"
          ? (
              <>
                <h3 className="modal__heading">
                  Delete Shoot {modalEntityID}?
                </h3>
                <div className="modal__button-container">
                  <button
                    className="modal__button modal__button--edit"
                    onClick={handleDeleteShoot}
                  >
                    Delete Shoot
                  </button>
                  <button
                    className={`modal__button modal__button--cancel ${cancelling ? "disabled" : ""}`}
                    onClick={handleCancel}
                    disabled={cancelling}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )
          : modalAction === "edit" && modalEntityType === "shoot"
          ? (
              <>
                <h3 className="modal__heading">
                  Edit Shoot {modalEntityID}?
                </h3>
                <div className="modal__button-container">
                  <button
                    className="modal__button modal__button--edit"
                    onClick={handleEditShoot}
                  >
                    Edit Shoot
                  </button>
                  <button
                    className={`modal__button modal__button--cancel ${cancelling ? "disabled" : ""}`}
                    onClick={handleCancel}
                    disabled={cancelling}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )
          : modalAction === "delete" && modalEntityType === "tag"
          ? (
              <>
                <h3 className="modal__heading">
                  Delete Tag {normalizeCasing(modalEntityName ?? undefined)}?
                </h3>
                <div className="modal__button-container">
                  <button
                    className="modal__button modal__button--delete"
                    onClick={handleDeleteTag}
                  >
                    Delete Tag
                  </button>
                  <button
                    className={`modal__button modal__button--cancel ${cancelling ? "disabled" : ""}`}
                    onClick={handleCancel}
                    disabled={cancelling}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )
          : modalAction === "edit" && modalEntityType === "tag"
          ? (
              <>
                <h3 className="modal__heading">
                  Edit Tag {normalizeCasing(modalEntityName ?? undefined)}?
                </h3>
                <div className="modal__button-container">
                  <button
                    className="modal__button modal__button--delete"
                    onClick={handleEditTag}
                  >
                    Update Tag
                  </button>
                  <button
                    className={`modal__button modal__button--cancel ${cancelling ? "disabled" : ""}`}
                    onClick={handleCancel}
                    disabled={cancelling}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )
          : null
        }

      </div>

    </div>
  );
};

export default Modal;
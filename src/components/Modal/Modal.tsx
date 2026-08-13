"use client";

import { useEffect, useState } from "react";
import { useAppContext, useModalContext } from "@/hooks/hooks";
import { useRouter } from "next/navigation";
import "./Modal.scss";

const Modal = () => {
  const { 
    setAppIsLoading,
    scrollYPos 
  } = useAppContext();

  const { 
    showModal,
    modalAction,
    modalEntityType,
    modalEntityID,
    handleClearModal,
  } = useModalContext();

  const [ cancelling, setCancelling ] = useState(false);
  
  const router = useRouter();

  const handleEditBio = () => {
    setAppIsLoading(true)
    router.push("/bio/edit");
    handleClearModal();
  };
  
  const handleDeleteShoot = () => {
    // can use function from context to refresh feed via new call
    console.log(`Deleting shoot ${modalEntityID}...`)
  };
  
  const handleEditShoot = () => {
    // can use function from context to refresh feed via new call
    console.log(`Editing shoot ${modalEntityID}...`)
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
    <>
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
            : null


          
          }

        </div>

      </div>
    </>
  );
};

export default Modal;
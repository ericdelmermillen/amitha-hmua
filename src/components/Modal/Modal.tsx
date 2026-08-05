"use client";

import { useEffect } from "react";
import { 
  useAppContext,
  useModalContext 
} from "@/hooks/hooks";
import { useRouter } from "next/navigation";
import "./Modal.scss";

const Modal = () => {
  const { 
    setAppIsLoading,
    scrollYPos 
  } = useAppContext();
  const { 
    showModal,
    modalType,
    handleClearModal,
  } = useModalContext();
  
  const router = useRouter();

  const handleEditBio = () => {
    setAppIsLoading(true)
    handleClearModal();
    router.push("/bio/edit");
  };

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


  return (
    <>
      <div className={`modal ${showModal ? "show" : ""}`}>
        <div className="modal__overlay" onClick={handleClearModal}></div>
        <div className="modal__card">

          {showModal && modalType === "editBio" 

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
                      className="modal__button modal__button--cancel"
                      onClick={handleClearModal}
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
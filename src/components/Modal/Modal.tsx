"use client";

// import Image from "next/image";
// import { useState, useEffect } from "react";
import { 
  // useAppContext, 
  useModalContext } from "@/hooks/hooks";
// import { GrNext, GrPrevious } from "react-icons/gr";
// import { splitOnNewLine } from "@/utils/utils";
import "./Modal.scss";

const Modal = () => {
  // const { scrollYPos } = useAppContext();
  const { 
    showModal,
    setShowModal
    // modalType = "",
    // modalTitle = "",
    // modalText = "",
    // modalInputs,
    // modalTeam = [],
    // modalHref = "",
    // handleClearModal,
    // handleSubmitModalForm,
    // modalTextRef,
    // modalIsLoading
  } = useModalContext();

  const handleCloseModal = () => {
    setShowModal(false)
  }

  // const safeModalHref = typeof modalHref === "string" ? modalHref : "";


  // const scrollPrev = () => {
  //   if (emblaApi) {
  //     emblaApi.scrollPrev();
  //   };
  // };

  // const scrollNext = () => {
  //   if (emblaApi) {
  //     emblaApi.scrollNext();
  //   };
  // };

// useEffect to submit on Enter as long as Shift not pressed
  // useEffect(() => {
  //   const handleKeyDown = (e) => {
  //     if (e.key === "Enter" && !e.shiftKey) {
  //       e.preventDefault();

  //       if (!modalIsLoading) {
  //         handleSubmitModalForm(e);
  //       };
  //     };
  //   };

  //   if (showModal && modalType === "CTAForm") {
  //     window.addEventListener("keydown", handleKeyDown);
  //   };

  //   return () => {
  //     window.removeEventListener("keydown", handleKeyDown);
  //   };
  // }, [showModal, modalType, modalIsLoading, handleSubmitModalForm]);

  // useEffect to hide and clear modal on esc
  // useEffect(() => {
  //   const handleKeyDown = (e) => {
  //     if (e.key === "Escape") {
  //       handleClearModal();
  //     };
  //   };

  //   if (showModal) {
  //     window.addEventListener("keydown", handleKeyDown);
  //   };

  //   return () => {
  //     window.removeEventListener("keydown", handleKeyDown);
  //   };
  // }, [showModal, handleClearModal]);

  // useEffect to reset the scroll position of the scrollable box in the modal
  // useEffect(() => {
  //   if (showModal && modalTextRef.current) {
  //     requestAnimationFrame(() => {
  //       if (modalTextRef.current) {
  //         modalTextRef.current.scrollTop = 0;
  //       };
  //     });
  //   };
  // }, [showModal]);

  // useEffect to close modal after user nagivates to another tab/window and then returns
  // useEffect(() => {
  //   if (!showModal) {
  //     return;
  //   };

  //   const handleVisibilityChange = () => {
  //     if (document.visibilityState === "visible") {
  //       handleClearModal();
  //     };
  //   };

  //   document.addEventListener("visibilitychange", handleVisibilityChange);

  //   return () => {
  //     document.removeEventListener("visibilitychange", handleVisibilityChange);
  //   };
  // }, [showModal, handleClearModal]);

  // useEffect to clear modal on scroll
  // useEffect(() => {
  //   if (showModal) {
  //     handleClearModal();
  //   };
  // }, [scrollYPos]);


  return (
    <>
      <div className={`modal ${showModal ? "show" : ""}`}>
        <div 
          className="modal__overlay" onClick={handleCloseModal}
        ></div>

        {/* <div className="modal__card">
          <div className="modal__content">
            <h2 className={`modal__heading ${isJaneModal || modalType === "CTAForm"
              ? "modal__heading--center"
              : ""}`}
            >
              {modalTitle}
            </h2>

            {safeModalTeam.length > 0 ? (
              <div 
                className={`modal__team ${safeModalTeam?.length > 3 
                  ? "modal__team--carousel" : "modal__team--non-carousel"}`}>

                {safeModalTeam.length > 0 && safeModalTeam.length < 4 
                  ? safeModalTeam.map((member, idx) => (
                      <div 
                        key={idx} 
                        className="modal__imageBox modal__imageBox--non-carousel"
                        >
                        <Image 
                          className="modal__image modal__image--non-carousel"
                          src={member.imageUrl}
                          alt={member.imageAlt}
                          height={56}
                          width={56}
                          sizes="(min-width: 768px) 96px, (min-width: 480px) 90px, (min-width: 400px) 66px, 54px"
                          priority
                        />
                      </div>
                    ))
                  : safeModalTeam.length > 3 ? (
                      <div className="modal__carousel">
                        <div className="modal__outer-track">
                          <button 
                            className="modal__prev" 
                            type="button"
                            onClick={scrollPrev}
                          >
                            <GrPrevious className="modal__icon modal__icon--prev" />
                          </button>
                          
                          <button 
                            className="modal__next" 
                            type="button"
                            onClick={scrollNext}
                          >
                            <GrNext className="modal__icon modal__icon--next" />
                          </button>
                        
                          <div className="modal__inner-track" ref={emblaRef}>
                            <div className="modal__slider">
                              {safeModalTeam.map((member, idx) => (
                                <div className="modal__slide" key={idx}>
                                  <div className="modal__imageBox modal__imageBox--carousel">
                                    <Image 
                                      className="modal__image modal__image--carousel"
                                      src={member.imageUrl}
                                      alt={member.imageAlt}
                                      height={56}
                                      width={56}
                                      sizes="(min-width: 768px) 96px, (min-width: 480px) 90px, (min-width: 400px) 66px, 54px"
                                      priority
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  : null
                }
              </div>
            ) : null}

            <div
              ref={modalTextRef}
              className={"modal__text"}
            >
              {modalText && splitOnNewLine(modalText)
                .map((paragraph, idx) => (
                  <p
                    key={idx}
                    className={`modal__paragraph ${
                      /^\s*\d+[\.\):]?\s/.test(paragraph)
                        ? "modal__paragraph--numbered"
                        : ""
                    }`}
                  >
                    {paragraph}
                  </p>
                ))}

            </div>

            {Array.isArray(modalInputs) && modalInputs.length > 0 

              ? (
                <form 
                  className="modal__inputs"
                  onSubmit={(e) => handleSubmitModalForm(e)}
                >
                  {modalInputs.map((input) => (
                    <div key={input.id} className="modal__input-group">
                      <label className="modal__label" htmlFor={input.id}>
                        {input.label}
                      </label>
                      <input
                        className="modal__input"
                        id={input.id}
                        placeholder={input.placeholder}
                        ref={input.ref}
                        onChange={(e) => input.onChange(e)}
                        disabled={modalIsLoading}
                      />
                    </div>
                  ))}
                </form>
              ) 
              : null

            }

            <div className="modal__button-container">

              {modalType === "CTAForm" ? (
                <button
                  className={`modal__button ${modalIsLoading ? "disabled" : ""}`}
                  onClick={(e) => handleSubmitModalForm(e)}
                  disabled={modalIsLoading}
                >
                  Send
                </button>
              ) : safeModalHref ? (
                <a 
                  className="modal__button"
                  href={safeModalHref} 
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Proceed
                </a>
              ) : null}

              <button
                className="modal__button"
                onClick={handleClearModal}
                disabled={modalIsLoading}
              >
                {modalType === "CTAForm" || safeModalHref.length > 0
                  ? "Cancel" 
                  : "OK"
                }
              </button>
            </div>
          </div> */}
        {/* </div> */}
      </div>
    </>
  );
};

export default Modal;
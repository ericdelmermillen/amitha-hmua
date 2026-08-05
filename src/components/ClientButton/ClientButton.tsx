"use client";

import { ClientButtonProps } from "@/typing/interfaces";
import { useAppContext, useModalContext } from "@/hooks/hooks";
import "./ClientButton.scss";

const ClientButton = ({ text, variant, buttonType, modifierClass }: ClientButtonProps) => {

  const {
    isLoggedIn,
    handleLogoutUser
    // modalIsOpen
  } = useAppContext()
    
  const {
    handleEditBio,
  } = useModalContext()
  
  const safeModifierClass = typeof modifierClass === "string" ? modifierClass : "";

  const modalIsOpen = false;


  if (isLoggedIn && buttonType === "editBio") {
    return (
      <button
        className={`clientButton ${variant} ${safeModifierClass}`}
        onClick={handleEditBio}
        disabled={modalIsOpen}
        >
        {text}
      </button>
    );
  };


  if (isLoggedIn && buttonType === "logOut") {
    return (
      <button
        className={`clientButton ${variant} ${safeModifierClass}`}
        onClick={handleLogoutUser}
        disabled={modalIsOpen}
        >
        {text}
      </button>
    );
  };

  // return (
  //   <>
  //     <button
  //       className="bioPage__edit-button"
  //       // onClick={handleEditBioClick}
  //       >
  //       {text}
  //     </button>
  //   </>
  // );
};

export default ClientButton;
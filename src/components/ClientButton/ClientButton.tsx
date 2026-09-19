"use client";

import { ClientButtonProps } from "@/typing/interfaces";
import { useAppContext, useModalContext } from "@/hooks/hooks";
import "./ClientButton.scss";

const ClientButton = ({ text, variant = "standard", buttonType, modifierClass }: ClientButtonProps) => {
  const { isLoggedIn, handleLogoutUser } = useAppContext();
  const { handleOpenModal, showModal } = useModalContext();
  
  const safeModifierClass = typeof modifierClass === "string" ? modifierClass : "";
  const buttonClasses = ["clientButton", variant, safeModifierClass]
    .filter(Boolean)
    .join(" ");

  const handleNavigateToEditBio = ()=> handleOpenModal({ action: "edit", entityType: "bio" });
    
  const handleClick = buttonType === "editBio" 
    ? handleNavigateToEditBio 
    : buttonType === "logOut" 
    ? handleLogoutUser 
    : undefined;

  if (!handleClick || !isLoggedIn) {
    return null;
  }
  
return (
    <button
      className={buttonClasses}
      onClick={handleClick}
      disabled={showModal}
      type="button"
    >
      {text}
    </button>
  );
};

export default ClientButton;
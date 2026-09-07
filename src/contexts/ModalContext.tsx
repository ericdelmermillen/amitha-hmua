"use client";

import { useState, useRef, createContext } from "react";
import { useAppContext } from "@/hooks/hooks";
import { 
  addClassToDiv, 
  isValidEmail, 
  removeClassFromDiv, 
  scrollToTop, 
  staggerToastsByN, 
} from "@/utils/utils";
// import { handleEmailRelayWithNotification } from "@/actions/emailActions";
import { toast } from "react-toastify";
import { ContextProviderProps, ModalContextValue, ModalData } from "@/typing/interfaces";

const APP_ISLOADING_DELAY = Number(process.env.NEXT_PUBLIC_APP_ISLOADING_DELAY) || 500;

const ModalContext = createContext<ModalContextValue | undefined>(undefined);

const ModalContextProvider = ({ children }: ContextProviderProps) => {
  const { setAppIsLoading } = useAppContext();
  
  const [ showModal, setShowModal ] = useState(false);
  const [ modalAction, setModalAction ] = useState<string | null>(null);
  const [ modalEntityID, setModalEntityID ] = useState<number | null>(null);
  const [ modalEntityType, setModalEntityType ] = useState<string | null>(null);
  const [ modalEntityName, setModalEntityName ] = useState<string | null>(null);
  const [ modalIsLoading, setModalIsLoading ] = useState(false);


  const handleOpenModal = ({ e, action, entityType, entityName = null, entityID = null }: ModalData) => {
    e?.preventDefault();
    e?.stopPropagation()

    // console.log(entityName)
    
    setShowModal(true);
    setModalAction(action);
    setModalEntityType(entityType);
    setModalEntityName(entityName);
    setModalEntityID(entityID);
  };



  const handleClearModal = (clearAppIsLoading: boolean = false) => {
    setShowModal(false);
    setModalAction(null);
    setModalEntityName(null);
    setModalEntityID(null);
    
    if (clearAppIsLoading) {
      setAppIsLoading(false);
    }
  };

  const contextValues: ModalContextValue = {
    showModal, 
    setShowModal,
    // modalAction, 
    // setModalAction,
    // modalTitle, 
    // setModalTitle,
    // modalText, 
    // setModalText,
    // modalInitialFormCheck,
    // setModalInitialFormCheck,
    // modalInputs, 
    // setModalInputs,
    // modalTeam, 
    // setModalTeam,
    // modalHref, 
    // setModalHref,
    handleClearModal,
    modalAction, 
    setModalAction,
    handleOpenModal,
    modalEntityType, 
    setModalEntityType,
    modalEntityName, 
    setModalEntityName,
    modalEntityID, 
    setModalEntityID
    // modalNameRef,
    // modalEmailRef,
    // modalPhoneRef,
    // modalFormInitialCheckRef,
    // handleSubmitModalForm,
    // modalIsLoading, 
    // setModalIsLoading,
    // modalTextRef,
    // isSubmittingRef
  };

  return (
    <ModalContext.Provider value={contextValues}>
      {children}
    </ModalContext.Provider>
  );
};

export {
  ModalContext,
  ModalContextProvider
};
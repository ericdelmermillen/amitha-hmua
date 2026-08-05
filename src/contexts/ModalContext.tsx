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
import { ContextProviderProps, ModalContextValue } from "@/typing/interfaces";

const APP_ISLOADING_DELAY = Number(process.env.NEXT_PUBLIC_APP_ISLOADING_DELAY) || 500;

const ModalContext = createContext<ModalContextValue | undefined>(undefined);

const ModalContextProvider = ({ children }: ContextProviderProps) => {
  // const { handleSetShowIsLoadingTrue, handleSetShowIsLoadingFalse } = useAppContext();
  
  const [ showModal, setShowModal ] = useState(false);
  const [ modalType, setModalType ] = useState(null);
  const [ modalTitle, setModalTitle ] = useState("");
  const [ modalText, setModalText ] = useState("");
  const [ modalInitialFormCheck , setModalInitialFormCheck ] = useState(false);
  const [ modalInputs, setModalInputs ] = useState([]);
  const [ modalTeam, setModalTeam ] = useState([]);
  const [ adminTeamMember, setAdminTeamMember ] = useState(null);
  const [ modalHref, setModalHref ] = useState("");
  const [ modalIsLoading, setModalIsLoading ] = useState(false);

  // form state
  const [ inquirerConfirmationFromAddress, setInquirerConfirmationFromAddress ] = useState("");
  const [ inquirerEmailSubject, setInquirerEmailSubject ] = useState("");
  const [ inquirerEmailGreeting, setInquirerEmailGreeting ] = useState("");
  const [ inquirerConfirmationMessage, setInquirerConfirmationMessage ] = useState("");
  const [ inquirerConfirmationClosingSalutation, setInquirerConfirmationClosingSalutation ] = useState("");
  const [ adminNotificationAddress, setAdminNotificationAddress ] = useState("");
  const [ adminNotificationSubject, setAdminNotificationSubject ] = useState("");

  const modalTextRef = useRef(null);
  const modalNameRef = useRef(null);
  const modalEmailRef = useRef(null);
  const modalPhoneRef = useRef(null);
  const modalFormInitialCheckRef = useRef(false);
  const isSubmittingRef = useRef(false);


    const handleEditBio = () => {
      // needs to open the modal in the appropriate mode only
      console.log("Edit Bio?")
      setShowModal(true);

    }



  // const handleClearForm = () => {
  //   modalEmailRef.current?.blur();
  //   modalNameRef.current?.blur();
  //   modalPhoneRef.current?.blur();
  // };

  const handleOpenModal = (
    modalType: string, 
    modalTitle: string, 
    modalText: string, 
    teamMembers = [], 
    href = "",
    // form data
    inquirerConfirmationFromAddress = "",
    inquirerEmailSubject = "",
    inquirerEmailGreeting = "",
    inquirerConfirmationMessage = "",
    inquirerConfirmationClosingSalutation = "",
    adminNotificationAddress = "",
    adminNotificationSubject = "",
  ) => {
    // setShowModal(true);

    // setModalType(modalType);
    // setModalTitle(modalTitle);
    // setModalText(modalText);
    // setModalTeam(teamMembers);
    // setModalHref(href);
    
    // if (modalType === "CTAForm") {
    //   setAdminTeamMember(adminTeamMember);
    //   setInquirerConfirmationFromAddress(inquirerConfirmationFromAddress);
    //   setInquirerEmailSubject(inquirerEmailSubject);
    //   setInquirerEmailGreeting(inquirerEmailGreeting);
    //   setInquirerConfirmationMessage(inquirerConfirmationMessage);
    //   setInquirerConfirmationClosingSalutation(inquirerConfirmationClosingSalutation);
    //   setAdminNotificationAddress(adminNotificationAddress);
    //   setAdminNotificationSubject(adminNotificationSubject);
    // };
  };

  const handleClearModal = () => {
    setShowModal(false);
    setModalType(null);
    setModalTitle("");
    setModalText("");
    setModalInitialFormCheck(false);
    setModalInputs([]);
    setModalTeam([]);
    setAdminTeamMember(null);
    setModalHref("");
    setInquirerConfirmationFromAddress("");
    setInquirerEmailSubject("");
    setInquirerEmailGreeting("");
    setInquirerConfirmationMessage("");
    setInquirerConfirmationClosingSalutation("");
    setAdminNotificationAddress("");
    setAdminNotificationSubject("");
    modalFormInitialCheckRef.current = false;
    isSubmittingRef.current = false;
  };


  const contextValues: ModalContextValue = {
    showModal, 
    setShowModal,
    handleEditBio
    // modalType, 
    // setModalType,
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
    // handleOpenModal,
    // handleClearModal,
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
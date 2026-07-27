"use client";

import { type ChangeEvent, type SubmitEvent, useState } from "react";
import { useAppContext } from "@/hooks/hooks";
import { 
  isValidEmail, 
  isValidFirstName, 
  isValidLastName, 
  isValidMessage, 
  isValidSubject, 
  staggerToastsByN 
} from "@/utils/utils";
import { sendContactFormMessage } from "@/actions/contactActions";
import { toast } from "react-toastify";
import "./ContactForm.scss";

const MIN_LOADING_INTERVAL = Number(process.env.NEXT_PUBLIC_MIN_LOADING_INTERVAL);

const ContactForm = () => {
  const { handleNavigateHome, setAppIsLoading } = useAppContext();
  
  const [ firstName, setFirstName ] = useState("");
  const [ firstNameIsValid, setFirstNameIsValid ] = useState(true);

  const [ lastName, setLastName ] = useState("");
  const [ lastNameIsValid, setLastNameIsValid ] = useState(true);

  const [ email, setEmail ] = useState("");
  const [ emailIsValid, setEmailIsValid ] = useState(true);

  const [ subject, setSubject ] = useState("");
  const [ subjectIsValid, setSubjectIsValid ] = useState(true);
  
  const [ message, setMessage ] = useState("");
  const [ messageIsValid, setMessageIsValid ] = useState(true);

  const [ initialFormCheck, setInitialFormCheck ] = useState(false);
  const [ isSubmitting, setIsSubmitting ] = useState(false);


  const handleFirstNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const firstNameValue = e.target.value;
    setFirstName(firstNameValue);
    setFirstNameIsValid(isValidFirstName(firstNameValue));
  };
  
  const handleLastNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const lastNameValue = e.target.value;
    setLastName(lastNameValue);
    setLastNameIsValid(isValidLastName(lastNameValue));
  };
  
  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const emailValue = e.target.value;
    setEmail(emailValue);
    setEmailIsValid(isValidEmail(emailValue));
  };
  
  const handleSubjectChange = (e: ChangeEvent<HTMLInputElement>) => {
    const subjectValue = e.target.value;
    setSubject(subjectValue);
    setSubjectIsValid(isValidSubject(subjectValue));
  };
  
  const handleMessageChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const messageValue = e.target.value;
    setMessage(messageValue);
    setMessageIsValid(isValidMessage(messageValue));
  };

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!initialFormCheck) {
      setInitialFormCheck(true);
    }

    let errors = 0;

    if (!isValidFirstName(firstName)) {
      setFirstNameIsValid(false);
      staggerToastsByN("Invalid First Name", "error", errors);
      errors++;
    }

    if (!isValidLastName(lastName)) {
      setLastNameIsValid(false);
      staggerToastsByN("Invalid Last Name", "error", errors);
      errors++;
    }

    if (!isValidEmail(email)) {
      setEmailIsValid(false);
      staggerToastsByN("Invalid Email", "error", errors);
      errors++;
    }

    if (!isValidSubject(subject)) {
      setSubjectIsValid(false);
      staggerToastsByN("Invalid Subject", "error", errors);
      errors++;
    }

    if (!isValidMessage(message)) {
      setMessageIsValid(false);
      staggerToastsByN("Invalid Message", "error", errors);
      errors++;
    }

    if (errors > 0) {
      setIsSubmitting(false);
      return;
    }

    try {
      setAppIsLoading(true)

      const response = await sendContactFormMessage({
        firstName,
        lastName,
        email,
        subject,
        message,
      });

      staggerToastsByN(response.message, "success", 1);
      staggerToastsByN("Redirecting...", "info", 2);
      handleClearFormAndGoHome();

    } catch (error) {
      setIsSubmitting(false);
      setAppIsLoading(false)

      if (error instanceof Error) {
        toast.error(error.message);
        console.error("Error sending message:", error.message);
      } else {
        toast.error("An unknown error occurred");
        console.error("Error sending message:", error);
      }
    }
  };

  const handleCancel = () => {
    toast.info("Cancelling...");
    setAppIsLoading(true);
    
    setTimeout(() => {
      setAppIsLoading(false);
      handleClearFormAndGoHome();
    }, MIN_LOADING_INTERVAL * 2);
  };

  const handleClearFormAndGoHome = () => {
    setTimeout(() => {
      setFirstName("");
      setFirstNameIsValid(true);
      setLastName("");
      setLastNameIsValid(true);
      setEmail("");
      setEmailIsValid(true);
      setSubject("");
      setSubjectIsValid(true);
      setMessage("");
      setMessageIsValid(true);
      setIsSubmitting(false);
      
      setTimeout(() => {
        handleNavigateHome();
        setAppIsLoading(false);
      }, MIN_LOADING_INTERVAL * 2);
    }, MIN_LOADING_INTERVAL * 2);
  };

  return (
    <>
      <div className="contactForm">
        <div className="contactForm__modal">
          <h1 className="contactForm__title">
            Contact Amitha
          </h1>
          <form 
            className="contactForm__form"
            onSubmit={handleSubmit}
          >
            <div className="contactForm__nameContainer">
              <div className="contactForm__field">
                <label htmlFor="contactFormFirstName" className="contactForm__label">
                  First Name
                </label>

                <input 
                  id="contactFormFirstName"
                  type="text" 
                  className="contactForm__input contactForm__input--firstName"
                  value={firstName}
                  placeholder="First Name"
                  onChange={handleFirstNameChange}
                />
                <p className={`contactForm__errorMessage ${!firstNameIsValid && initialFormCheck
                    ? "visible" 
                    : ""}`
                  }
                >
                  First Name is invalid
                </p>
              </div>
              <div className="contactForm__field">
                <label htmlFor="contactFormLastName" className="contactForm__label">
                  Last Name
                </label>
                <input 
                  id="contactFormLastName"
                  type="text" 
                  className="contactForm__input contactForm__input--lastName"
                  value={lastName}
                  placeholder="Last Name"
                  onChange={handleLastNameChange}
                />
                <p className={`contactForm__errorMessage ${!lastNameIsValid && initialFormCheck 
                    ? "visible" 
                    : ""}`
                  }
                >
                  Last Name is invalid
                </p>
              </div>

            </div>

            <div className="contactForm__field">
              <label htmlFor="contactFormEmail" className="contactForm__label">
                Email Address
              </label>
              <input 
                id="contactFormEmail"
                type="text" 
                className="contactForm__input contactForm__input--email"
                value={email}
                placeholder="Email Address"
                onChange={handleEmailChange}
              />
              <p className={`contactForm__errorMessage ${!emailIsValid && initialFormCheck 
                  ? "visible" 
                  : ""}`
                }
              >
                Invalid Email
              </p>
            </div>

            <div className="contactForm__field">
              <label htmlFor="contactFormSubject" className="contactForm__label">
                Subject
              </label>
              <input 
                id="contactFormSubject"
                type="text" 
                className="contactForm__input contactForm__input--subject"
                value={subject}
                placeholder="Subject"
                onChange={handleSubjectChange}
              />
              <p className={`contactForm__errorMessage ${!subjectIsValid && initialFormCheck 
                  ? "visible" 
                  : ""}`
                }
              >
                Subject too short
              </p>
            </div>

            <div className="contactForm__field contactForm__field--message">
              <label 
                htmlFor="contactFormMessage"
                className="contactForm__label"
              >
                Message
              </label>
              <textarea 
                className="contactForm__input contactForm__input--message"
                id="contactFormMessage"
                value={message}
                placeholder="Message"
                onChange={handleMessageChange}
              ></textarea>
              <p 
                className={`contactForm__errorMessage ${!messageIsValid && initialFormCheck
                  ? "visible" 
                  : ""}`
                }
              >
                Message too short
              </p>
            </div>
            <div className="contactForm__button-container">
              <button 
                type="button" 
                className="contactForm__button contactForm__button--cancel"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className={`contactForm__button contactForm__button--send ${isSubmitting 
                  ? "disabled" 
                  : ""}`
                }
                disabled={isSubmitting}
              >
                Send
              </button>
            </div>

          </form>
        </div>
      </div>
    </>
  );
};

export default ContactForm;
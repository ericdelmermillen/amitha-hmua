"use client";

import { type ChangeEvent, type SubmitEvent, useState } from "react";
import { useAppContext } from "@/hooks/hooks";
import { useRouter } from "next/navigation";
import { isValidEmail, isValidFirstName, isValidLastName, isValidMessage, isValidSubject, staggerToastsByN } from "@/utils/utils";
import { sendContactFormMessage } from "@/actions/contactActions";
import { toast } from "react-toastify";
import "./ContactForm.scss";

// change validation UI to not show invalid until after first time submit attempted
// make send confirmation message to inquirer email

const ContactForm = () => {
  const { 
    setAppIsLoading,
    handleNavigateHome
  } = useAppContext();
  
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


  const router = useRouter();

  // input value & validty checking
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

    let errors = 0;

    if (!isValidFirstName(firstName)) {
      staggerToastsByN("Invalid First Name", "error", errors);
      setFirstNameIsValid(false);
      errors++;
    } 

    if (!isValidLastName(lastName)) {
      staggerToastsByN("Invalid Last Name", "error", errors);
      setLastNameIsValid(false);
      errors++;
    }

    if (!isValidEmail(email)) {
      setEmailIsValid(false);
      staggerToastsByN("Invalid Email", "error", errors);
      errors++;
    } 

    if (!isValidSubject(subject)) {
      staggerToastsByN("Invalid Subject", "error", errors);
      setSubjectIsValid(false);
      errors++;
    }
      
    if (!isValidMessage(message)) {
      staggerToastsByN("Invalid Message", "error", errors);
      setMessageIsValid(false);
      errors++;
    }

    if (errors > 0) {
      return;
    }
  
    try {
      setAppIsLoading(true)
      
      const response = await sendContactFormMessage({firstName, lastName, email, subject, message});
      toast.success(response.message)
      handleNavigateHome();
      } catch (error) {
    if (error instanceof Error) {
      toast.error(error.message);
      console.error("Error sending message:", error.message);
    } else {
      toast.error("An unknown error occurred");
      console.error("Error sending message:", error);
    }
  } finally {
    setAppIsLoading(false);
  }
};

  const handleCancel = () => {
    // clear form, maybe serve toast, timeout then navigate to /work
    console.log("Cancelling...")
    router.push("/work");
  }

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
                <label 
                  htmlFor="contactFormFirstName"
                  className="contactForm__label"
                >
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
                <p 
                  className={`contactForm__errorMessage ${!firstNameIsValid ? "visible" : ""}`}
                >
                  First Name is invalid
                </p>
              </div>
              <div className="contactForm__field">
                <label 
                  htmlFor="contactFormLastName"
                  className="contactForm__label"
                >
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
                <p 
                  className={`contactForm__errorMessage ${!lastNameIsValid ? "visible" : ""}`}
                >
                  Last Name is invalid
                </p>
              </div>

            </div>

            <div className="contactForm__field">
              <label 
                htmlFor="contactFormEmail"
                className="contactForm__label"
              >
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
              <p className={`contactForm__errorMessage ${!emailIsValid ? "visible" : ""}`}>
                Invalid Email
              </p>
            </div>

            <div className="contactForm__field">
              <label 
                htmlFor="contactFormSubject"
                className="contactForm__label"
              >
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
              <p 
                className={`contactForm__errorMessage ${!subjectIsValid ? "visible" : ""}`}
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
                className={`contactForm__errorMessage ${!messageIsValid 
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
                className="contactForm__button contactForm__button--send"
              >
                Send
              </button>
            </div>

          </form>
        </div>
      </div>
    </>
  )
};

export default ContactForm;
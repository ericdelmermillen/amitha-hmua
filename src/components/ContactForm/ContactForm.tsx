"use client";

import { type ChangeEvent, type SubmitEvent, useState } from "react";
import { useAppContext } from "@/hooks/hooks";
import { useRouter } from "next/navigation";
import { isValidEmail } from "@/utils/utils";
import { toast } from "react-toastify";

// change validation UI to not show invalid until after first time submit attempted

import "./ContactForm.scss";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const ContactForm = () => {
  const { 
    setAppIsLoading,
    handleNavigateHome
  } = useAppContext();
  
  const [ firstName, setFirstName ] = useState("");
  const [ firstNameIsInvalid, setFirstNameIsInvalid ] = useState(false);
  const [ shouldCheckFirstName, setShouldCheckFirstName ] = useState(false);
  
  const [ lastName, setLastName ] = useState("");
  const [ lastNameIsInvalid, setLastNameIsInvalid ] = useState(false);
  
  const [ email, setEmail ] = useState("");
  const [ emailIsInvalid, setEmailIsInvalid ] = useState(false);
  
  const [ subject, setSubject ] = useState("");
  const [ subjectIsInvalid, setSubjectIsInvalid ] = useState(false);
  
  const [ message, setMessage ] = useState("");
  const [ messageIsInvalid, setMessageIsInvalid ] = useState(false);

  const router = useRouter();

  const handleFirstNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFirstName(e.target.value); 

    if(shouldCheckFirstName) {
      setFirstNameIsInvalid(firstName.length >= 2);
    }
  };

  const handleShouldCheckFirstName = () => {
    setFirstNameIsInvalid(firstName.length < 2)
    setShouldCheckFirstName(true);
  };
  
  const handleLastNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLastName(e.target.value);
  };

  const handleShouldCheckLastName = () => {
    setLastNameIsInvalid(lastName.length < 2);
  };
  
  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleShouldCheckEmail = () => {
    setEmailIsInvalid(!isValidEmail(email));
  };
  
  const handleSubjectChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSubject(e.target.value);
  };

  const handleShouldCheckSubject = () => {
    setSubjectIsInvalid(subject.length <= 10);
  };
  
  const handleMessageChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const handleShouldCheckMessage = () => {
    setMessageIsInvalid(message.length <= 25);
  };

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("submitting")

    if(firstName.length < 2) {
      toast.error("Invalid First Name");
      return setFirstNameIsInvalid(true);
    } else {
      setFirstNameIsInvalid(false);
    }

    if(lastName.length < 2) {
      toast.error("Invalid Last Name");
      return setLastNameIsInvalid(true);
    } else {
      setLastNameIsInvalid(false);
    }

    if(isValidEmail(email)) {
      setEmailIsInvalid(false);
    } else {
      toast.error("Invalid Email");
      return setEmailIsInvalid(true);
    }

    if(subject.length <= 10) {
      toast.error("Invalid Subject");
      return setSubjectIsInvalid(true);
    } else {
      setSubjectIsInvalid(false);
    }

    if(message.length < 25) {
      toast.error("Invalid Message");
      return setMessageIsInvalid(true);
    } else {
      setMessageIsInvalid(false);
    }
    
    const formData = {
      firstName,
      lastName,
      email,
      subject,
      message
    };
  
    try {
      setAppIsLoading(true)
      const response = await fetch(`${BASE_URL}/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });
  
      if(!response.ok) {
        throw new Error("Failed to send message");
      }
      
      const responseData = await response.json(); 
  
      toast.success(`${responseData.message} Redirecting...`);
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
            <div className="contactForm__name-container">
              <div className="contactForm__firstName">
                <label 
                  htmlFor="firstName"
                  className="contactForm__label"
                >
                  First Name
                </label>
                <input 
                  type="text" 
                  className="contactForm__firstName-input" 
                  id="firstName"
                  value={firstName}
                  placeholder="First Name"
                  onChange={handleFirstNameChange}
                  onBlur={handleShouldCheckFirstName}
                />
                <p 
                  className={`contactForm__firstName-error ${firstNameIsInvalid ? "error" : ""}`}
                >
                  First Name is invalid
                </p>
              </div>
              <div className="contactForm__lastName">
                <label 
                  htmlFor="lastName"
                  className="contactForm__label"
                >
                  Last Name
                </label>
                <input 
                  type="text" 
                  className="contactForm__firstName-input" 
                  id="lastName"
                  value={lastName}
                  placeholder="Last Name"
                  onChange={handleLastNameChange}
                  onBlur={handleShouldCheckLastName}
                />
                <p 
                  className={`contactForm__lastName-error ${lastNameIsInvalid ? "error" : ""}`}
                >
                  Last Name is invalid
                </p>
              </div>

            </div>

            <div className="contactForm__email">
              <label 
                htmlFor="email"
                className="contactForm__label"
              >
                Email Address
              </label>
              <input 
                type="text" 
                className="contactForm__email-input" 
                id="email"
                value={email}
                placeholder="Email Address"
                onChange={handleEmailChange}
                onBlur={handleShouldCheckEmail}
              />
              <p 
                className={`contactForm__email-error ${emailIsInvalid ? "error" : ""}`}
              >
                Invalid Email
              </p>
            </div>

            <div className="contactForm__subject">
              <label 
                htmlFor="subject"
                className="contactForm__label"
              >
                Subject
              </label>
              <input 
                type="text" 
                className="contactForm__subject-input" 
                id="subject"
                value={subject}
                placeholder="Subject"
                onChange={handleSubjectChange}
                onBlur={handleShouldCheckSubject}
              />
              <p 
                className={`contactForm__subject-error ${subjectIsInvalid ? "error" : ""}`}
              >
                Subject must be at least 10 characters long
              </p>
            </div>

            <div className="contactForm__message">
              <label 
                htmlFor="message"
                className="contactForm__label"
              >
                Message
              </label>
              <textarea 
                className="contactForm__message-input" 
                id="message"
                value={message}
                placeholder="Message"
                onChange={handleMessageChange}
                onBlur={handleShouldCheckMessage}
              ></textarea>
              <p 
                className={`contactForm__message-error ${messageIsInvalid 
                  ? "error" 
                  : ""}`}
                >
                  Message must be at least 25 characters long
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
"use client";

import { type ChangeEvent, type SubmitEvent, useState, useEffect } from "react";
import { useAppContext } from "@/hooks/hooks"; 
import { isValidEmail, isValidPassword, staggerToastsByN } from "@/utils/utils";
import { toast } from "react-toastify";
import Hide from "@/assets/icons/Hide";
import Show from "../../assets/icons/Show";
import "./LoginForm.scss";

const MIN_LOADING_INTERVAL = Number(process.env.NEXT_PUBLIC_MIN_LOADING_INTERVAL);

const LoginForm = () => {
  const { setAppIsLoading, handleNavigateHome } = useAppContext();

  const [ isSafari, setIsSafari ] = useState(false);
  
  const [ email, setEmail ] = useState("");
  const [ emailIsValid, setEmailIsValid ] = useState(true);
  
  const [ password, setPassword ] = useState("");
  const [ passwordIsValid, setPasswordIsValid ] = useState(true);

  const [ initialFormCheck, setInitialFormCheck ] = useState(false);
  const [ showPassword, setShowPassword ] = useState(false);

  const [ isSubmitting, setIsSubmitting ] = useState(false);

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const emailValue = e.target.value;
    setEmail(emailValue);

    if (initialFormCheck) {
      handleCheckEmailIsValid(emailValue);
    };
  };

  const handleCheckEmailIsValid = (emailValue: string) => {
    setEmailIsValid(isValidEmail(emailValue));
  };
  
  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const passwordValue = e.target.value;
    setPassword(passwordValue);

    if (initialFormCheck) {
      handleCheckPasswordIsValid(passwordValue);
    };
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  };

  const handleCheckPasswordIsValid = (passwordValue: string) => {
    setPasswordIsValid(isValidPassword(passwordValue));
  };

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!initialFormCheck) {
      setInitialFormCheck(true);
    }

    let errors = 0;
  
    if (!isValidEmail(email)) {
      setEmailIsValid(false);
      staggerToastsByN("Invalid email", "error", errors);
      errors++;
    }
    
    if (!isValidPassword(password)) {
      setPasswordIsValid(false);
      staggerToastsByN("Invalid password", "error", errors);
      errors++;
    };

    if (errors > 0) {
      return;
    };
    
    
    // try {
      setIsSubmitting(true);
      setAppIsLoading(true);
    //   const response = await fetch(`${BASE_URL}/auth/login`, {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json"
    //     },
    //     body: JSON.stringify({
    //       email,
    //       password
    //     })
    //   });
  
    //   if (response.ok) {
    //     const data = await response.json();
    //     const { token, refreshToken } = data;
    //     localStorage.setItem("token", token);
    //     localStorage.setItem("refreshToken", refreshToken); 
    //     setIsLoggedIn(true);
    //     handleNavigateHome();

        // staggerToastsByN(response.message, "success", 1);
        // staggerToastsByN("Redirecting...", "info", 2);
        // handleClearFormAndGoHome();

    //   } else if (response.status === 401) {
    //     console.log("401");
    //     toast.error("Login Failed. Check Email & Password")
    //   } else if (response.status === 404) {
    //     console.log(`response.status: ${response.status}`)
    //     toast.error("User not found");
    //   };
    // } catch(error) {
    //   toast.error(error.message)
    //   console.error("Error:", error);
    // };
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
      setEmail("");
      setEmail("");
      setEmailIsValid(true);

      setIsSubmitting(false);
      
      setTimeout(() => {
        handleNavigateHome();
        setAppIsLoading(false);
      }, MIN_LOADING_INTERVAL * 2);
    }, MIN_LOADING_INTERVAL * 2);
  };

  // useEffect to check isSafari boolean after hydration on client
  useEffect(() => {
    const navigatorValue = navigator.userAgent.toLowerCase();
    setIsSafari(
      navigatorValue.includes("safari") && 
      (navigatorValue.includes("chrome") || navigatorValue.includes("mozilla")))
  }, []);

  return (
    <>
      <div className="loginForm">
        <div className="loginForm__modal">
          <h1 className="loginForm__title">
            Admin Login
          </h1>
          <form 
            className="loginForm__form"
            onSubmit={handleSubmit}>
            <div className="loginForm__group">
              <label htmlFor="email" className="loginForm__label">
                Email
              </label>
              <input
                type="text"
                id="email"
                className="loginForm__input"
                value={email}
                placeholder="Email"
                onChange={handleEmailChange}
              />
              <div 
                className={`loginForm__error ${!emailIsValid && initialFormCheck 
                  ? "email-error"
                  : ""}`}
              >
                Invalid Email
              </div>
            </div>
            <div className="loginForm__group">
              <label htmlFor="password" className="loginForm__label">
                  Password
              </label>
              <div className="passwordInput">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="loginForm__input"
                  value={password}
                  placeholder="Password"
                  onChange={handlePasswordChange}
                />

                <div 
                  className={`passwordInput__icon ${!isSafari ? "show": ""}`}
                  onClick={handleTogglePasswordVisibility}
                >

                  {showPassword 
                    ? <Hide className={"passwordInput__icon--hide"}/>
                    : <Show className={"passwordInput__icon--show"}/>
                  }
                </div>
              </div>
              <div 
                className={`loginForm__error ${!passwordIsValid && initialFormCheck && "password-error"}`}
              >
                Invalid Password
              </div>
            </div>
            <div className="loginForm__button-container">
              <button 
                type="submit" 
                className={`loginForm__button loginForm__button--login ${isSubmitting 
                  ? "disabled"
                  : ""
                }`}
                disabled={isSubmitting}
              >
                Login
              </button>
              <button 
                type="button" 
                className="loginForm__button loginForm__button--cancel"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default LoginForm;
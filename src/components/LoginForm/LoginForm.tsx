"use client";

import { useRouter } from "next/navigation";
import { 
  type ChangeEvent, 
  type SubmitEvent, 
  useState, 
  useEffect 
} from "react";
import { useAppContext } from "@/hooks/hooks"; 
import { isValidEmail, isValidPassword, staggerToastsByN } from "@/utils/utils";
import { loginUser } from "@/actions/authActions"
import { toast } from "react-toastify";
import Hide from "@/assets/icons/Hide";
import Show from "@/assets/icons/Show";
import "./LoginForm.scss";

const LoginForm = () => {
  const { 
    setAppIsLoading, 
    setIsLoggedIn,
    handleNavigateHome } = useAppContext();

  const [ isSafari, setIsSafari ] = useState(false);
  
  const [ email, setEmail ] = useState("");
  const [ emailIsValid, setEmailIsValid ] = useState(true);
  
  const [ password, setPassword ] = useState("");
  const [ passwordIsValid, setPasswordIsValid ] = useState(true);

  const [ initialFormCheck, setInitialFormCheck ] = useState(false);
  const [ showPassword, setShowPassword ] = useState(false);

  const [ isSubmitting, setIsSubmitting ] = useState(false);

  const router = useRouter();

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const emailValue = e.target.value;
    setEmail(emailValue);

    if (initialFormCheck) {
      handleCheckEmailIsValid(emailValue);
    }
  };

  const handleCheckEmailIsValid = (emailValue: string) => {
    setEmailIsValid(isValidEmail(emailValue));
  };
  
  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const passwordValue = e.target.value;
    setPassword(passwordValue);

    if (initialFormCheck) {
      handleCheckPasswordIsValid(passwordValue);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const handleCheckPasswordIsValid = (passwordValue: string) => {
    setPasswordIsValid(isValidPassword(passwordValue));
  };

  const handleSubmit = async (e: SubmitEvent) => {
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
    }
    
    try {
      setIsSubmitting(true);
      setAppIsLoading(true);
      const response = await loginUser({ email, password });

      if (!response.success) {
        toast.error(response.message);
        return;
      } 
      
      setIsLoggedIn(true)
      toast.success("Logging you in...")
      router.push("/work");
    } catch (error) {
      console.error("Login submission error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
      setAppIsLoading(false);
    }
  };

  const handleCancel = () => {
    toast.info("Cancelling...");
    setAppIsLoading(true);
    handleNavigateHome();
  };

  // useEffect to check isSafari boolean after hydration on client
  useEffect(() => {
    const userAgent = typeof navigator !== "undefined" ? navigator.userAgent.toLowerCase() : "";
    const isUsingSafari = userAgent.includes("safari") && 
      !userAgent.includes("chrome") && 
      !userAgent.includes("chromium") && 
      !userAgent.includes("crios");
    setIsSafari(isUsingSafari);
  }, []);

  return (
    <div className="loginForm">
      <div className="loginForm__modal">
        <h1 className="loginForm__title">
          Admin Login
        </h1>
        <form 
          className="loginForm__form"
          onSubmit={handleSubmit}
        >
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
            <div className={`loginForm__error ${!emailIsValid && initialFormCheck ? "email-error" : ""}`}>
              Invalid Email
            </div>
          </div>
          <div className="loginForm__group">
            <label htmlFor="password" className="loginForm__label">
                Password
            </label>
            <div className="passwordInput">
              <input
                type={!isSafari && showPassword ? "text" : "password"}
                id="password"
                className="loginForm__input"
                value={password}
                placeholder="Password"
                onChange={handlePasswordChange}
              />

              <button 
                className={`passwordInput__icon ${!isSafari ? "show": ""}`}
                onClick={handleTogglePasswordVisibility}
                type="button"
              >

                {showPassword 
                  ? <Hide className="passwordInput__icon--hide"/>
                  : <Show className="passwordInput__icon--show"/>
                }
              </button>
            </div>
            <div className={`loginForm__error ${!passwordIsValid && initialFormCheck ? "password-error" : ""}`}>
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
  );
};

export default LoginForm;
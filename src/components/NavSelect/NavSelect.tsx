"use client";

import { useSearchParams } from "next/navigation";
import { type MouseEvent, type TransitionEvent, useEffect, useRef } from "react";
import { NavSelectProps, ShootEntity } from "@/typing/interfaces";
import { useAppContext, useOutsideClick } from "@/hooks/hooks";
import { scrollToTop } from "@/utils/utils";
import DownIcon from "@/assets/icons/DownIcon";
import "./NavSelect.scss";

const MIN_LOADING_INTERVAL = parseInt(process.env.NEXT_PUBLIC_MIN_LOADING_INTERVAL || "250", 10);

const NavSelect = ({ selectOptions, modifierClass }: NavSelectProps) => {
  const navSelectRef = useRef<HTMLDivElement>(null);

  const {
    setSelectedTag,
    handleNavigateHome,
    setShowSideNav,
    navSelectValue, 
    setNavSelectValue,
    setAppIsLoading,
    showNavSelectOptions, 
    setShowNavSelectOptions,
  } = useAppContext();
  
  
  const handleOnOutsideClick = () => {
    setShowNavSelectOptions(false);
    setShowSideNav(false);
  };
  
  const outsideClickArgs = {
    targetRef: navSelectRef, 
    onOutsideClick: handleOnOutsideClick, 
    componentIsActive: showNavSelectOptions
  };

  useOutsideClick(outsideClickArgs);

  const searchParams = useSearchParams();

  const safeModifierClass = typeof modifierClass === "string" ? modifierClass : "";

  const showDefaultOption = 
    (!showNavSelectOptions && !navSelectValue) || 
    (showNavSelectOptions && !navSelectValue) || 
    (showNavSelectOptions && navSelectValue);

  const showSelectedOption = 
    (showNavSelectOptions && !navSelectValue) || 
    (!showNavSelectOptions && navSelectValue);

  const handleTransitionEnd = (e: TransitionEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) {
      return;
    }

    if (!showNavSelectOptions) {
      e.currentTarget.scrollTop = 0;
    }
  };
    
  const handleDownArrowClick = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setShowNavSelectOptions(prev => !prev);
  };

  const handleUpdateSelectValue = (option: ShootEntity) => {
    const isSamePageClick = option.name.toLowerCase() === searchParams.get("tag")?.toLowerCase();

    setAppIsLoading(true);
    setNavSelectValue(option.name);
    setShowNavSelectOptions(false);
    handleNavigateHome(option);
    
    setTimeout(() => {
      requestAnimationFrame(() => {
        setShowSideNav(false);
        scrollToTop();
        
        if (isSamePageClick) {
          setAppIsLoading(false);
        }

      })
    }, MIN_LOADING_INTERVAL);
  };

  const handleTopOptionClick = () => {
    setShowSideNav(false);
    setShowNavSelectOptions(false);

    if (showNavSelectOptions) {
      setNavSelectValue(null);
      return handleNavigateHome();
    } 

    if (navSelectValue) {
      const foundOption = selectOptions.find(({ name }) => name === navSelectValue);
      
      setTimeout(() => {
        if (foundOption) {
          setSelectedTag(foundOption);
        }
        handleNavigateHome(foundOption);
      }, MIN_LOADING_INTERVAL);
    } 
    else if (!navSelectValue) {
      setTimeout(() => {
        handleNavigateHome();
      }, MIN_LOADING_INTERVAL);
    }
  };
  
  // useEffect to keep select display value in sync with the active URL tag query param
  useEffect(() => {
    const locationTagName = searchParams.get("tag");
    setNavSelectValue(locationTagName ? locationTagName.toUpperCase() : null);
  }, [searchParams, setNavSelectValue]);

  return (
    <div 
      className={`navSelect ${showNavSelectOptions ? "tall" : "short"}`}
      ref={navSelectRef}
    >
      <div 
        className={`navSelect__inner ${showNavSelectOptions ? "tall" : ""}`}
        onTransitionEnd={handleTransitionEnd}
      >
        <div className={`navSelect__select ${showNavSelectOptions ? "tall" : ""}`} >
          <div 
            className={`navSelect__selectValue ${safeModifierClass} ${!showNavSelectOptions ? "short" : ""}`} 
              onClick={handleTopOptionClick}
          >
            <span className={`navSelect__default-option ${showDefaultOption ? "show" : "hide"}`}>
              WORK
            </span>
            <span className={`navSelect__default-option ${showSelectedOption ? "show" : "hide"}`}>
              {navSelectValue ? `# ${navSelectValue.toUpperCase()}` : null}
            </span>
            <div 
              className="navSelect__down"
              onClick={handleDownArrowClick}
            >
              <DownIcon 
                className={"navSelect__down-icon"}
                strokeClassName={"navSelect__down-stroke"}
              />
            </div>
          </div>

          {selectOptions.map(option => 

            <div 
              key={option.id} 
              className="navSelect__option"
              onClick={() => handleUpdateSelectValue(option)}
            >
              {`# ${option.name?.toUpperCase()}`}
            </div>

          )}
          
        </div>
      </div>
    </div>
  );
};

export default NavSelect;

// "use client";

// import { usePathname } from "next/navigation";
// import { type MouseEvent, type TransitionEvent, useEffect, useRef } from "react";
// import { NavSelectProps, ShootEntity } from "@/typing/interfaces";
// import { useAppContext, useOutsideClick } from "@/hooks/hooks";
// import { scrollToTop } from "@/utils/utils";
// import DownIcon from "@/assets/icons/DownIcon";
// import "./NavSelect.scss";

// const MIN_LOADING_INTERVAL = parseInt(process.env.NEXT_PUBLIC_MIN_LOADING_INTERVAL || "250", 10);

// const NavSelect = ({ selectOptions, modifierClass }: NavSelectProps) => {
//   const navSelectRef = useRef<HTMLDivElement>(null);
//   const pathname = usePathname();

//   const {
//     setSelectedTag,
//     handleNavigateHome,
//     setShowSideNav,
//     navSelectValue, 
//     setNavSelectValue,
//     setAppIsLoading,
//     showNavSelectOptions, 
//     setShowNavSelectOptions,
//   } = useAppContext();
  
//   const handleOnOutsideClick = () => {
//     setShowNavSelectOptions(false);
//     setShowSideNav(false);
//   };
  
//   const outsideClickArgs = {
//     targetRef: navSelectRef, 
//     onOutsideClick: handleOnOutsideClick, 
//     componentIsActive: showNavSelectOptions
//   };

//   useOutsideClick(outsideClickArgs);

//   const safeModifierClass = typeof modifierClass === "string" ? modifierClass : "";

//   const showDefaultOption = 
//     (!showNavSelectOptions && !navSelectValue) || 
//     (showNavSelectOptions && !navSelectValue) || 
//     (showNavSelectOptions && navSelectValue);

//   const showSelectedOption = 
//     (showNavSelectOptions && !navSelectValue) || 
//     (!showNavSelectOptions && navSelectValue);

//   const handleTransitionEnd = (e: TransitionEvent<HTMLDivElement>) => {
//     if (e.target !== e.currentTarget) {
//       return;
//     }

//     if (!showNavSelectOptions) {
//       e.currentTarget.scrollTop = 0;
//     }
//   };
    
//   const handleDownArrowClick = (e: MouseEvent<HTMLElement>) => {
//     e.stopPropagation();
//     setShowNavSelectOptions((prev) => {
//       return !prev;
//     });
//   };

//   const handleUpdateSelectValue = (option: ShootEntity) => {
//     let currentTagParam = "";
//     if (typeof window !== "undefined") {
//       const urlParams = new URLSearchParams(window.location.search);
//       currentTagParam = urlParams.get("tag") || "";
//     }

//     const isSamePageClick = option.name.toLowerCase() === currentTagParam.toLowerCase();

//     setAppIsLoading(true);
//     setNavSelectValue(option.name);
//     setShowNavSelectOptions(false);
//     handleNavigateHome(option);
    
//     setTimeout(() => {
//       requestAnimationFrame(() => {
//         setShowSideNav(false);
//         scrollToTop();
        
//         if (isSamePageClick) {
//           setAppIsLoading(false);
//         }
//       });
//     }, MIN_LOADING_INTERVAL);
//   };

//   const handleTopOptionClick = () => {
//     setShowSideNav(false);
//     setShowNavSelectOptions(false);

//     if (showNavSelectOptions) {
//       setNavSelectValue(null);
//       return handleNavigateHome();
//     } 

//     if (navSelectValue) {
//       const foundOption = selectOptions.find(({ name }) => {
//         return name === navSelectValue;
//       });
      
//       setTimeout(() => {
//         if (foundOption) {
//           setSelectedTag(foundOption);
//         }
//         handleNavigateHome(foundOption);
//       }, MIN_LOADING_INTERVAL);
//     } else if (!navSelectValue) {
//       setTimeout(() => {
//         handleNavigateHome();
//       }, MIN_LOADING_INTERVAL);
//     }
//   };
  
//   // Keep select display value in sync with the active URL tag query param via window.location
//   useEffect(() => {
//     if (typeof window === "undefined") {
//       return;
//     }

//     const urlParams = new URLSearchParams(window.location.search);
//     const locationTagName = urlParams.get("tag");
//     setNavSelectValue(locationTagName ? locationTagName.toUpperCase() : null);
//   }, [pathname, setNavSelectValue]);

//   return (
//     <div 
//       className={`navSelect ${showNavSelectOptions ? "tall" : "short"}`}
//       ref={navSelectRef}
//     >
//       <div 
//         className={`navSelect__inner ${showNavSelectOptions ? "tall" : ""}`}
//         onTransitionEnd={handleTransitionEnd}
//       >
//         <div className={`navSelect__select ${showNavSelectOptions ? "tall" : ""}`} >
//           <div 
//             className={`navSelect__selectValue ${safeModifierClass} ${!showNavSelectOptions ? "short" : ""}`} 
//             onClick={handleTopOptionClick}
//           >
//             <span className={`navSelect__default-option ${showDefaultOption ? "show" : "hide"}`}>
//               WORK
//             </span>
//             <span className={`navSelect__default-option ${showSelectedOption ? "show" : "hide"}`}>
//               {navSelectValue ? `# ${navSelectValue.toUpperCase()}` : null}
//             </span>
//             <div 
//               className="navSelect__down"
//               onClick={handleDownArrowClick}
//             >
//               <DownIcon 
//                 className={"navSelect__down-icon"}
//                 strokeClassName={"navSelect__down-stroke"}
//               />
//             </div>
//           </div>

//           {selectOptions.map((option) => {
//             return (
//               <div 
//                 key={option.id} 
//                 className="navSelect__option"
//                 onClick={() => {
//                   return handleUpdateSelectValue(option);
//                 }}
//               >
//                 {`# ${option.name?.toUpperCase()}`}
//               </div>
//             );
//           })}
          
//         </div>
//       </div>
//     </div>
//   );
// };

// export default NavSelect;
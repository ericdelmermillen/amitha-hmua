"use client";

import { usePathname, useParams, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect, DragEvent, MouseEvent } from "react";
import { ShootSummary } from "@/typing/interfaces";
import { useAppContext } from "@/hooks/hooks";
import { getShootSummaries } from "@/actions/shootActions";
import { normalizeCasing } from "@/utils/utils";
import { toast } from "react-toastify";
import Link from "next/link";
// import { checkTokenExpiration } from "@/actions/authActions";
import Shoot from "@/components/Shoot/Shoot";
// import ShootPlaceHolder from "../ShootPlaceholder/ShootPlaceHolder.jsx";
import "./Shoots.scss";

// const itemsPerPage = 1;
// const itemsPerPage = 2;
// const itemsPerPage = 4;
// const itemsPerPage = 6;
// const itemsPerPage = 10;
const itemsPerPage = 12;
// const itemsPerPage = 100;


const Shoots = () => {

  const { 
    isLoggedIn,
    setIsLoggedIn,
    scrollYPos, 
    tags,
    // minLoadingInterval, 
    selectedTag, 
    setSelectedTag, 
    // prevURL, 
    // showDeleteOrEditModal,
    // setShowDeleteOrEditModal,
    // setShootDetails,
    shootOrderIsEditable, 
    setShootOrderIsEditable,
    appIsLoading,
    setAppIsLoading
  } = useAppContext();
  
  const [ shoots, setShoots ] = useState<ShootSummary[]>([]);;

  const [ isFetching, setIsFetching ] = useState<boolean>(false);
  
  const [ isInitialShootsLoad, setIsInitialShootsLoad ] = useState(true);


  const [ currentPage, setCurrentPage ] = useState(1);
  // const [ currentShootId, setCurrentShootId ] = useState(shoot_id);
  const [ currentShootId, setCurrentShootId ] = useState<number | null>(null);

  // const [ activeDragShoot, setActiveDragShoot ] = useState({id: -1}); 
  const [ activeDragShoot, setActiveDragShoot ] = useState<ShootSummary | null>(null);

  const [ finalPageLoaded, setFinalPageLoaded ] = useState(false);

  const sentinelRef = useRef<HTMLDivElement | null>(null);


  const searchParams = useSearchParams();
  const tagParam = searchParams.get("tag");
  const params = useParams();
  const shootID = params?.id ? Number(params.id) : null;

  const pathname = usePathname();
  const isOnShootDetails = pathname.startsWith("/shoot/");

  const handleShootDragStart = (
  e: DragEvent<HTMLDivElement> | MouseEvent<HTMLDivElement>, 
  shootID: number
) => {
  const selectedShoot = shoots.find(shoot => shoot.shootID === shootID);
  setActiveDragShoot(selectedShoot || null);
};
  
  const handleNewShootID = (shootId: number) => {
    // setShootDetails(null);
    setCurrentShootId(shootId);
  };

  const makeOrderEditable = () => {
    setShootOrderIsEditable(true);
    setActiveDragShoot(null);
    toast.info("Drag shoots into desired order then Save to update");
  };

  const saveNewOrder = async () => {
    setShootOrderIsEditable(false);
    setAppIsLoading(true);
    setAppIsLoading(false);

    // const tokenIsExpired = await checkTokenExpiration(setIsLoggedIn, navigate);

    // if (tokenIsExpired) {
    //   return;
    // };
    
    if (isLoggedIn) {      
      toast.info("Updating database. One sec...");

      // const new_shoot_order = [];
  
      // for (const shoot of shoots) {
      //   const updateObj = {};
      //   updateObj.shoot_id = shoot.shoot_id;
      //   updateObj.display_order = shoot.display_order;
      //   new_shoot_order.push(updateObj);
      // };

      // try {
      //   const response = await fetch(`${BASE_URL}/shoots/updateorder`, {
      //     method: "PATCH",
      //     headers: {
      //       "Content-Type": "application/json",
      //       "Authorization": `Bearer ${localStorage.getItem("token")}`
      //     },
      //     body: JSON.stringify({ new_shoot_order})
      //   });

      //   if (response.ok) {
      //     toast.success("Database updated.");
      //     setIsLoading(false);
      //   };
        
      // } catch(error) {
      //   console.log(error);
      //   toast.error("Error updating database...");
      //   setIsLoading(false);
      // };
    };

    // setShootOrderIsEditable(false);
    setActiveDragShoot(null);
  };

  const handleDropShootTarget = (
    dropTargetShootID: number,
    dropTargetShootDisplayOrder: number
  ) => {
    if (!activeDragShoot) {
      return;
    }

    setShoots((prevShoots) => {
      const activeDraggedShootID = activeDragShoot.shootID;
      const activeDraggedShootOldDisplayOrder = activeDragShoot.displayOrder;

      const highestDisplayOrder = prevShoots.reduce((maxDisplayOrder, shoot) => {
        const currentOrder = parseInt(shoot.displayOrder as any, 10) || 0;
        return currentOrder > maxDisplayOrder ? currentOrder : maxDisplayOrder;
      }, 0);

      const updatedShoots = prevShoots.map((shoot) => ({ ...shoot }));

      for (const shoot of updatedShoots) {
        if (dropTargetShootID !== activeDraggedShootID) {
          if (dropTargetShootDisplayOrder === highestDisplayOrder) {
            if (shoot.shootID === dropTargetShootID) {
              shoot.displayOrder = dropTargetShootDisplayOrder - 1;
            } else if (shoot.shootID === activeDraggedShootID) {
              shoot.displayOrder = dropTargetShootDisplayOrder;
            } else if (
              shoot.displayOrder < dropTargetShootDisplayOrder &&
              shoot.displayOrder >= activeDraggedShootOldDisplayOrder
            ) {
              shoot.displayOrder = shoot.displayOrder - 1;
            }
          } else if (activeDraggedShootOldDisplayOrder > dropTargetShootDisplayOrder) {
            if (shoot.shootID === dropTargetShootID) {
              shoot.displayOrder = dropTargetShootDisplayOrder + 1;
            } else if (shoot.shootID === activeDraggedShootID) {
              shoot.displayOrder = dropTargetShootDisplayOrder;
            } else if (
              shoot.displayOrder > dropTargetShootDisplayOrder &&
              shoot.displayOrder <= activeDraggedShootOldDisplayOrder
            ) {
              shoot.displayOrder = shoot.displayOrder + 1;
            }
          } else if (dropTargetShootDisplayOrder > activeDraggedShootOldDisplayOrder) {
            if (shoot.shootID === dropTargetShootID) {
              shoot.displayOrder = dropTargetShootDisplayOrder - 1;
            } else if (shoot.shootID === activeDraggedShootID) {
              shoot.displayOrder = dropTargetShootDisplayOrder;
            } else if (
              shoot.displayOrder <= dropTargetShootDisplayOrder &&
              shoot.displayOrder > activeDraggedShootOldDisplayOrder
            ) {
              shoot.displayOrder = shoot.displayOrder - 1;
            }
          }
        }
      }

      updatedShoots.sort((a, b) => a.displayOrder - b.displayOrder);
      return updatedShoots;
    });

    setActiveDragShoot(null);
  };

  
  // useEffect to attach intersection observer and handle fetching of shoots data
  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel || finalPageLoaded || isFetching) {
      return;
    }

    const observer = new IntersectionObserver(async (entries) => {
      const target = entries[0];

      if (target.isIntersecting || currentPage === 1) {
        setIsFetching(true);
        setAppIsLoading(true);

        console.log(selectedTag)

        try {
          const data = await getShootSummaries({
            tagID: selectedTag?.id || undefined,
            page: currentPage,
            limit: itemsPerPage,
          });

          const { shootSummaries, isFinalPage } = data;       

          let filteredShoots = [...shootSummaries];

          if (isOnShootDetails) {
            const currentShootIdNum = shootID;
            filteredShoots = shootSummaries.filter(shoot => shoot.shootID !== currentShootIdNum);
          }

          setShoots(prevShoots => [...prevShoots, ...filteredShoots.filter(shoot => !prevShoots.some(prev => prev.shootID === shoot.shootID))]);

          if (isFinalPage || shootSummaries.length === 0) {
            setFinalPageLoaded(true);
          } else {
            setCurrentPage((prev) => prev + 1);
          }
        } catch (error) {
          console.error(`Error loading page ${currentPage} shoots:`, error);
        } finally {
          setIsFetching(false);
          setAppIsLoading(false);
        }
      }
    }, { rootMargin: "200px" });

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [currentPage, finalPageLoaded, isFetching, itemsPerPage, selectedTag, isOnShootDetails, shootID]);

  // useEffect to clear state on updating selectedTag in NavSelect
  useEffect(() => {
    setShoots([]);
    setCurrentPage(1);
    setFinalPageLoaded(false);
  }, [selectedTag?.id, tagParam]);

  // useEffect to sync URL searchParam to selectedTag state
  useEffect(() => {
    if (!tags.length) {
      return;
    }

    if (tagParam) {
      const matchedTag = tags.find((tag) => tag.tagName.toLowerCase() === tagParam.toLowerCase());

      if (matchedTag && matchedTag.id !== selectedTag?.id) {
        setSelectedTag(matchedTag);
      }
    } else if (selectedTag !== null && !isOnShootDetails) {
      setSelectedTag(null);
    }
  }, [tagParam, tags, selectedTag]);
  
  
  return (
    <div className="shoots">

      {isOnShootDetails 
        ? (  
            <h3 className="shoots__shootDetailsHeading">
              Other {selectedTag ? normalizeCasing(selectedTag.tagName) : null} Shoots
            </h3>
          )
        : null
      }
      
      <div className={`shoots__inner ${isOnShootDetails ? "onShootDetails" : ""}`}>

        {shoots.map(shoot => (

          <Link
            href={`/shoot/${shoot.shootID}`} 
            key={shoot.shootID}
          >

              <Shoot
                key={shoot.shootID}
                shootID={shoot.shootID}
                displayOrder={shoot.displayOrder}
                thumbnailURL={shoot.thumbnailURL}
                models={shoot.models}
                photographers={shoot.photographers}
                isOnShootDetails={isOnShootDetails}
                handleNewShootID={handleNewShootID}
                shootOrderIsEditable={shootOrderIsEditable}
                handleShootDragStart={handleShootDragStart}
                handleDropShootTarget={handleDropShootTarget}
                // tags={shoot.tags}
              />
            </Link>
        ))}

      </div>
      
      {isLoggedIn && !isOnShootDetails && finalPageLoaded && !shootOrderIsEditable
      // !selectedTag && 

        ? <div className="shoots__button-container">
            <button
              className="shoots__editShootOrder"
              onClick={makeOrderEditable}
            >
              Edit Order
            </button>
          </div>

        : isLoggedIn && !isOnShootDetails && finalPageLoaded && shootOrderIsEditable
        // !selectedTag && 
        
        ? <div className="shoots__button-container">
            <button
              className="shoots__editShootOrder"
              onClick={saveNewOrder}
            >
              Save Order
            </button>
          </div>
        
        : null
      }

      <div className="shoots__sentinel" ref={sentinelRef}></div>

    </div>
  );
};

export default Shoots; 
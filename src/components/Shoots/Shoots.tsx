"use client";

import { usePathname, useParams, useSearchParams, useRouter } from "next/navigation";
import { useState, useRef, useEffect, DragEvent, MouseEvent } from "react";
import { ShootSummary } from "@/typing/interfaces";
import { useAppContext } from "@/hooks/hooks";
import { getShootSummaries } from "@/actions/shootActions";
import { normalizeCasing } from "@/utils/utils";
import { toast } from "react-toastify";
import Link from "next/link";
import Shoot from "@/components/Shoot/Shoot";
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
    // setIsLoggedIn,
    // scrollYPos, 
    tags,
    selectedTag, 
    setSelectedTag, 
    // prevURL, 
    // showDeleteOrEditModal,
    // setShowDeleteOrEditModal,
    // setShootDetails,
    shootOrderIsEditable, 
    setShootOrderIsEditable,
    // appIsLoading,
    setAppIsLoading,
    shoots, 
    setShoots,
    shouldUpdateShoots, 
    setShouldUpdateShoots,
    currentShootsPage, 
    setCurrentShootsPage,
    finalShootsPageLoaded, 
    setFinalShootsPageLoaded,
    handleRefreshShoots
  } = useAppContext();

  const searchParams = useSearchParams();
  const tagParam = searchParams.get("tag");
  const params = useParams();
  const shootID = params?.id ? Number(params.id) : null;

  const pathname = usePathname();
  const isOnShootDetails = pathname.startsWith("/shoot/");
  
  const router = useRouter();

  const [ currentShootId, setCurrentShootId ] = useState<number | null>(null);

  const [ activeDragShoot, setActiveDragShoot ] = useState<ShootSummary | null>(null);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const isFetchingRef = useRef(false);

  const handleShootDragStart = (e: DragEvent<HTMLDivElement> | MouseEvent<HTMLDivElement>, shootID: number) => {
    const selectedShoot = shoots.find(shoot => shoot.shootID === shootID);
    setActiveDragShoot(selectedShoot || null);
  };
  
  const handleNewShootID = (shootId: number) => {
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

  const handleDropShootTarget = (dropTargetShootID: number, dropTargetShootDisplayOrder: number) => {
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

  // useEffect to fetch shoots
  useEffect(() => {
    // Guard: If tag is in URL but selectedTag hasn't resolved from DB tags yet, wait
    if (tagParam && selectedTag === null) {
      return;
    }

    // Guard: Ensure selectedTag in state matches tagParam in URL to avoid stale tag fetches
    if (tagParam && selectedTag && selectedTag.tagName.toLowerCase() !== tagParam.toLowerCase()) {
      return;
    }

    if (!finalShootsPageLoaded && shouldUpdateShoots) {
      const fetchShoots = async () => {
        isFetchingRef.current = true;
        setAppIsLoading(true);

        try {
          const data = await getShootSummaries({
            tagID: selectedTag?.id || undefined,
            page: currentShootsPage,
            limit: itemsPerPage,
          });

          const { shootSummaries, isFinalPage } = data;

          let filteredShoots = [...shootSummaries];

          if (isOnShootDetails && shootID) {
            filteredShoots = shootSummaries.filter((shoot) => shoot.shootID !== shootID);
          }

          setShoots((prevShoots) => [
            ...prevShoots,
            ...filteredShoots.filter(
              (shoot) => !prevShoots.some((prev) => prev.shootID === shoot.shootID)
            ),
          ]);

          if (isFinalPage || shootSummaries.length < itemsPerPage) {
            setFinalShootsPageLoaded(true);
          }
        } catch (error) {
          console.error(`Error loading shoots for page ${currentShootsPage}:`, error);
        } finally {
          isFetchingRef.current = false;
          setAppIsLoading(false);
          setShouldUpdateShoots(false);
        }
      };

      fetchShoots();
    }
  }, [shouldUpdateShoots, selectedTag, currentShootsPage, isOnShootDetails, shootID, tagParam, setAppIsLoading]);

  // useEffect for IntersectionObserver infinite scroll pagination
  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel || finalShootsPageLoaded) {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      const target = entries[0];

      if (target.isIntersecting && !isFetchingRef.current && !finalShootsPageLoaded && shoots.length > 0) {
        setCurrentShootsPage((prevPage) => prevPage + 1);
        setShouldUpdateShoots(true);
      }
    }, { rootMargin: "200px" });

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [finalShootsPageLoaded, shoots.length]);

  // useEffect to sync URL tag param with AppContext
  useEffect(() => {
    if (!tags.length) {
      return;
    }

    if (tagParam) {
      const matchedTag = tags.find(
        (tag) => tag.tagName.toLowerCase() === tagParam.toLowerCase()
      );

      if (matchedTag) {
        if (matchedTag.id !== selectedTag?.id) {
          setSelectedTag(matchedTag);
          handleRefreshShoots();
        }
      } else {
        // Tag param exists in URL but does not match any valid tag from DB
        setSelectedTag(null);
        router.push("/notfound");
      }
    } else if (selectedTag !== null && !isOnShootDetails) {
      // Navigating from /work?tag=... back to /work
      setSelectedTag(null);
      handleRefreshShoots();
    }
  }, [tagParam, tags, selectedTag, isOnShootDetails, router]);

  // useEffect to clear shoots state and trigger load when navigating or changing tags
  useEffect(() => {
    handleRefreshShoots()
  }, [pathname]);

  
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

          <Link key={shoot.shootID} href={`/shoot/${shoot.shootID}`}>
            <Shoot
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
            />
          </Link>

        ))}

      </div>
      
      {isLoggedIn && !isOnShootDetails && finalShootsPageLoaded && !shootOrderIsEditable && !selectedTag 

        ? (
            <div className="shoots__button-container">
              <button
                className="shoots__editShootOrder"
                onClick={makeOrderEditable}
              >
                Edit Order
              </button>
            </div>
          )

        : isLoggedIn && !isOnShootDetails && finalShootsPageLoaded && shootOrderIsEditable && !selectedTag ? 

          (
            <div className="shoots__button-container">
              <button
                className="shoots__editShootOrder"
                onClick={saveNewOrder}
                >
                Save Order
              </button>
            </div>
          )
        : null
      }

      <div className="shoots__sentinel" ref={sentinelRef}></div>
    </div>
  );
};

export default Shoots; 
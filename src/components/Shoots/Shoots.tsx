"use client";

import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef, useEffect } from "react";
import { useAppContext } from "@/hooks/hooks";
import { getShootSummaries, updateShootOrder } from "@/actions/shootActions";
import { normalizeCasing } from "@/utils/utils";
import { 
  type DragEndEvent,
  DndContext, 
  closestCenter,
  MouseSensor,
  TouchSensor, 
  useSensor,
  useSensors
} from "@dnd-kit/core";
import { 
  SortableContext, 
  rectSortingStrategy, 
  arrayMove 
} from "@dnd-kit/sortable";
import { toast } from "react-toastify";
import Shoot from "@/components/Shoot/Shoot";
import "./Shoots.scss";

// ***Uncancelled in-flight request / dangling promise race condition:
// If a fetch is in flight and the user navigates away or switches tags, the promise resolution 
// can execute after unmount/cleanup, dirtying global AppContext with stale shoot data.

const DND_ACTIVATION_DISTANCE = parseInt(process.env.NEXT_PUBLIC_DND_ACTIVATION_DISTANCE || "8", 10);
const itemsPerPage = 12;

const ShootsFallback = ({ isOnShootDetails = false, itemsPerPage = 12 }) => {
  return (
    <div className="shoots">
      
      {isOnShootDetails && (
        <h3 className="shoots__shootDetailsHeading">
          Loading Shoots...
        </h3>
      )}

      <div className={`shoots__inner ${isOnShootDetails ? "onShootDetails" : ""}`}>
        
        {Array.from({ length: itemsPerPage }).map((_, index) => <div key={index} className="shoot" />)}
      
      </div>
    </div>
  );
};

const Shoots = () => {
  const { 
    isLoggedIn,
    tags,
    selectedTag, 
    setSelectedTag, 
    shootOrderIsEditable, 
    setShootOrderIsEditable,
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

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const isFetchingRef = useRef(false);

  const finalShootsPageLoadedRef = useRef(finalShootsPageLoaded);
  finalShootsPageLoadedRef.current = finalShootsPageLoaded;

  const showSaveOrder = isLoggedIn && !isOnShootDetails && finalShootsPageLoaded && shootOrderIsEditable && !selectedTag;

  const showEditOrder = isLoggedIn && !isOnShootDetails && finalShootsPageLoaded && !shootOrderIsEditable && !selectedTag;

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: DND_ACTIVATION_DISTANCE,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setShoots((prevShoots) => {
      const oldIndex = prevShoots.findIndex((shoot) => shoot.shootID === active.id);
      const newIndex = prevShoots.findIndex((shoot) => shoot.shootID === over.id);

      if (oldIndex === -1 || newIndex === -1) {
        return prevShoots;
      }

      const reordered = arrayMove(prevShoots, oldIndex, newIndex);

      // Resynchronize displayOrder to match new 1-based order
      return reordered.map((shoot, idx) => ({
        ...shoot,
        displayOrder: idx + 1,
      }));
    });
  };

  const makeOrderEditable = () => {
    setShootOrderIsEditable(true);
    toast.info("Drag shoots into desired order then Save to update");
  };

  const saveNewOrder = async () => {
    setShootOrderIsEditable(false);
    setAppIsLoading(true);
    
    if (isLoggedIn) {      
      toast.info("Updating database. One sec...");

      try {
        const orderedIDs = shoots.map((shoot) => shoot.shootID);

        const response = await updateShootOrder(orderedIDs);

        if (response.success) {
          toast.success("Database updated.");
        }
      } catch(error) {
        console.log(error);
        toast.error("Error updating database...");
      } finally {
        setAppIsLoading(false);
      }
    };

    setShootOrderIsEditable(false);
  };

  // useEffect to fetch shoots
  useEffect(() => {
    if (tagParam && selectedTag === null) {
      return;
    }

    // Guard: Ensure selectedTag in state matches tagParam in URL to avoid stale tag fetches
    if (tagParam && selectedTag && selectedTag.name.toLowerCase() !== tagParam.toLowerCase()) {
      return;
    }

    if (!tagParam && selectedTag !== null && !isOnShootDetails) {
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

          setShoots((prevShoots) => {
            if (currentShootsPage === 1) {
              return filteredShoots;
            }

            return [
              ...prevShoots,
              ...filteredShoots.filter(
                (shoot) => !prevShoots.some((prev) => prev.shootID === shoot.shootID)
              ),
            ];
          });

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

    if (!sentinel || shoots.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(entries => {
      const target = entries[0];

      if (target.isIntersecting && !isFetchingRef.current && !finalShootsPageLoadedRef.current) {
        setCurrentShootsPage(prevPage => prevPage + 1);
        setShouldUpdateShoots(true);
      }
    }, { rootMargin: "200px" });

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [shoots.length, setCurrentShootsPage, setShouldUpdateShoots]);

  // useEffect to sync URL tag param with AppContext
  useEffect(() => {
    if (!tags.length) {
      return;
    }

    if (tagParam) {
      const matchedTag = tags.find(
        (tag) => tag.name.toLowerCase() === tagParam.toLowerCase()
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
      setSelectedTag(null);
      handleRefreshShoots();
    }
  }, [tagParam, tags, selectedTag, isOnShootDetails, router]);

  // Clear shoots and selectedTag on unmount so leaving /work doesn't leave stale data in context
  useEffect(() => {
    handleRefreshShoots();

    return () => {
      setSelectedTag(null);
      setShootOrderIsEditable(false);
      handleRefreshShoots();
    };
  }, []);
  
  return (
    <div className="shoots">

      {isOnShootDetails &&

        <h3 className="shoots__shootDetailsHeading">
          Other {selectedTag ? normalizeCasing(selectedTag.name || "") : null} Shoots
        </h3>

      }
      
      <div className={`shoots__inner ${isOnShootDetails ? "onShootDetails" : ""}`}>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >

          <SortableContext
            items={shoots.map((shoot) => shoot.shootID)}
            strategy={rectSortingStrategy}
          >          
            {shoots.map(({ shootID, displayOrder, thumbnailURL, models, photographers }) => 

              <Shoot
                key={shootID} 
                shootID={shootID}
                tagParam={tagParam}
                displayOrder={displayOrder}
                thumbnailURL={thumbnailURL}
                models={models}
                photographers={photographers}
                isOnShootDetails={isOnShootDetails}
                shootOrderIsEditable={shootOrderIsEditable}
              />

            )}
          </SortableContext>

        </DndContext>


      </div>
      
      {showEditOrder

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

        : showSaveOrder ? 

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
    
      {!finalShootsPageLoaded 
    
        ? <div className="shoots__sentinel" ref={sentinelRef}></div> 
        : null
      }

    </div>
  );
};

export default Shoots; 
export { ShootsFallback };
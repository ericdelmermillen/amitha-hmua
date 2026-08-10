import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../AppContext.jsx';
import { toast } from 'react-toastify';
import { checkTokenExpiration } from '../../utils/utils.js';
import Shoot from '../Shoot/Shoot.tsx/index.js';
import ShootPlaceHolder from '../ShootPlaceholder/ShootPlaceHolder.jsx';
import './Shoots.scss';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const windowHeight = window.innerHeight;
const overScrollThreshold = window.innerHeight * 0.9; 

const Shoots = () => {

  const { shoot_id } = useParams();
  
  const { 
    isLoggedIn,
    setIsLoggedIn,
    scrollYPos, 
    prevScrollYPos,
    setIsLoading,
    minLoadingInterval, 
    selectedTag, 
    prevURL, 
    showDeleteOrEditModal,
    setShowDeleteOrEditModal,
    setShootDetails,
    isOrderEditable, 
    setIsOrderEditable,
    isLoading
  } = useAppContext();
  
  const [ shouldUpdateShoots, setShouldUpdateShoots ] = useState(false);
  
  const [ isInitialShootsLoad, setIsInitialShootsLoad ] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const { pathname, search } = location;
    const currentURL = pathname.concat(search);

  const [ shootsData, setShootsData ] = useState([]);
  const [ currentPage, setCurrentPage ] = useState(1);
  const [ isOnShootDetails, setIsOnShootDetails ] = useState(location.pathname.includes('/shoot/'));
  const [ currentShootId, setCurrentShootId ] = useState(shoot_id);

  const [ activeDragShoot, setActiveDragShoot ] = useState({id: -1}); 

  // const itemsPerPage = 1;
  // const itemsPerPage = 2;
  // const itemsPerPage = 4;
  // const itemsPerPage = 6;
  // const itemsPerPage = 10;
  const itemsPerPage = 12;
  // const itemsPerPage = 100;

  const [ finalPageLoaded, setFinalPageLoaded ] = useState(false);
    
  const handleOverScroll = () => {
    const distanceToBottom =  windowHeight - scrollYPos;

    if(!finalPageLoaded && !isLoading){
      
      if(distanceToBottom <= overScrollThreshold) {
        setShouldUpdateShoots(true);
        shootsData.length > 0 
        ? setCurrentPage(c => c + 1)
        : setCurrentPage(1);
      };
    };
  };
  
  const handleNewShootId = useCallback((shootId) => {
    setShootDetails(null);
    setCurrentShootId(shootId);
  }, []);

  const makeOrderEditable = () => {
    setIsOrderEditable(true);
    setActiveDragShoot({id: -1});
    toast.info("Drag shoots into desired order then Save to update");
  };

  const saveNewOrder = async () => {
    setIsOrderEditable(false);
    setIsLoading(true);

    const tokenIsExpired = await checkTokenExpiration(setIsLoggedIn, navigate);

    if(tokenIsExpired) {
      return;
    };
    
    if(isLoggedIn) {      
      toast.info("Updating database. One sec...");

      const new_shoot_order = [];
  
      for(const shoot of shootsData) {
        const updateObj = {};
        updateObj.shoot_id = shoot.shoot_id;
        updateObj.display_order = shoot.display_order;
        new_shoot_order.push(updateObj);
      };

      try {
        const response = await fetch(`${BASE_URL}/shoots/updateorder`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ new_shoot_order})
        });

        if(response.ok) {
          toast.success("Database updated.");
          setIsLoading(false);
        };
        
      } catch(error) {
        console.log(error);
        toast.error("Error updating database...");
        setIsLoading(false);
      };
    };

    setIsOrderEditable(false);
    setActiveDragShoot({id: -1});
  };

  const handleShootDragStart = useCallback((shoot_id) => {
    setActiveDragShoot(() => shootsData.find(shoot => shoot.shoot_id === shoot_id));
  }, [shootsData]);

  const handleDropShootTarget = useCallback((dropTargetShootId, dropTargetShootDisplayOrder) => {
    setShootsData(prevShootsData => {
      const activeDraggedShootId = activeDragShoot.shoot_id;
      const activeDraggedShootOldDisplayOrder = activeDragShoot.display_order;
  
      const highestDisplayOrder = prevShootsData.reduce((maxDisplayOrder, shoot) => {
        return Math.max(maxDisplayOrder, shoot.display_order);
      }, 0);
  
      const updatedShootsData = prevShootsData.map(shoot => ({ ...shoot }));
  
      for (const shoot of updatedShootsData) {
        if (dropTargetShootId !== activeDraggedShootId) {
          if (dropTargetShootDisplayOrder === highestDisplayOrder) {
            if (shoot.shoot_id === dropTargetShootId) {
              shoot.display_order = dropTargetShootDisplayOrder - 1;
            } else if (shoot.shoot_id === activeDraggedShootId) {
              shoot.display_order = dropTargetShootDisplayOrder;
            } else if (shoot.display_order < dropTargetShootDisplayOrder && shoot.display_order >= activeDraggedShootOldDisplayOrder) {
              shoot.display_order--;
            };
          } else if (activeDraggedShootOldDisplayOrder > dropTargetShootDisplayOrder) {
            if (shoot.shoot_id === dropTargetShootId) {
              shoot.display_order = dropTargetShootDisplayOrder + 1;
            } else if (shoot.shoot_id === activeDraggedShootId) {
              shoot.display_order = dropTargetShootDisplayOrder;
            } else if (shoot.display_order > dropTargetShootDisplayOrder && shoot.display_order <= activeDraggedShootOldDisplayOrder) {
              shoot.display_order++;
            };
          } else if (dropTargetShootDisplayOrder > activeDraggedShootOldDisplayOrder) {
            if (shoot.shoot_id === dropTargetShootId) {
              shoot.display_order = dropTargetShootDisplayOrder - 1;
            } else if (shoot.shoot_id === activeDraggedShootId) {
              shoot.display_order = dropTargetShootDisplayOrder;
            } else if (shoot.display_order <= dropTargetShootDisplayOrder && shoot.display_order > activeDraggedShootOldDisplayOrder) {
              shoot.display_order--;
            };
          };
        };
      };
      updatedShootsData.sort((a, b) => a.display_order - b.display_order);
      return updatedShootsData;
    });
  
    setActiveDragShoot({id: -1});
  }, [activeDragShoot.id]);

  // fetchAllShoots useEffect
  useEffect(() => {
    let finalPageFetched = false;

    if (location.search.split("=")[1] && selectedTag === null) {
      return;
    };
    
    if (!finalPageLoaded && (shouldUpdateShoots) ) {

      const fetchShoots = async () => {
        setIsLoading(true)
      
        try {
          const response = selectedTag === null
            ? await fetch(`${BASE_URL}/shoots/all?page=${currentPage}&limit=${itemsPerPage}`)
            : await fetch(`${BASE_URL}/shoots/all?tag_id=${selectedTag.id}&page=${currentPage}&limit=${itemsPerPage}`);
          
          if (response.ok) {
            const { shootSummaries, isFinalPage } = await response.json();            

            finalPageFetched = isFinalPage;
            
            const data = shootSummaries;
            
            let filteredData = [...data];

            if (filteredData.length < itemsPerPage) {
              finalPageFetched = true;
            };
            
            if (isOnShootDetails) {
              const currentShoot = shoot_id;
              filteredData = data.filter(shoot => shoot.shoot_id !== +currentShoot);
            };
            
            setShootsData(prevShoots => [...prevShoots, ...filteredData.filter(shoot => !prevShoots.some(prev => prev.shoot_id === shoot.shoot_id))]);
          };
        } catch(error) {
          console.log(`Error fetching shoots: ${error}`);
          toast.error(`Failed to fetch shoots: ${error}`);
        } finally {
          setTimeout(() => {
            setIsLoading(false); 
            setShouldUpdateShoots(false);
            setIsInitialShootsLoad(false);
          }, minLoadingInterval);

          if(finalPageFetched) {
            setTimeout(() => {
              setFinalPageLoaded(true);
            }, minLoadingInterval);
          };
        };
      };
      fetchShoots();
    };
    
    setShouldUpdateShoots(false);
  }, [shouldUpdateShoots, isOnShootDetails, currentPage, shoot_id, shootsData.length, selectedTag]);

  // handleOverScroll useEffect
  useEffect(() => {
    if(!finalPageLoaded) {
      handleOverScroll();
    };
  }, [scrollYPos, prevScrollYPos, shootsData.length]);

  // useEffect to clear shoots state when navigating to page
  useEffect(() => {
    if(currentURL !== prevURL || showDeleteOrEditModal) {

      setTimeout(() => {
        setIsInitialShootsLoad(true);
      }, minLoadingInterval);
        setShootsData([]);
        setShowDeleteOrEditModal(false);
        setCurrentPage(1);
        setFinalPageLoaded(false);
  
        if(pathname.includes('work')) {
          setShouldUpdateShoots(true);
          setShootsData([]);
        };
      };
    }, [location]);

  return (
    <>
      <div className="shoots">

        <div 
          className={`shoots__placeholders ${isInitialShootsLoad && isOnShootDetails
          ? "show onShootDetails"
          : isInitialShootsLoad && !isOnShootDetails
          ? "show"
          : ""}`}
        >

        </div>
        
        <div className={`shoots__inner ${
          isOnShootDetails 
            ? "onShootDetails"
            : ""
          }`}
        >

          {shootsData.map((shoot, idx) => (
            <Link 
              to={`/shoot/${shoot.shoot_id}`} 
              key={shoot.shoot_id}
            >
              {isLoggedIn ? idx + 1 : ""}

                <Shoot
                  key={shoot.shoot_id}
                  shoot_id={shoot.shoot_id}
                  display_order={shoot.display_order}
                  thumbnail_url={shoot.thumbnail_url}
                  models={shoot.models}
                  photographers={shoot.photographers}
                  isOnShootDetails={isOnShootDetails}
                  handleNewShootId={handleNewShootId}
                  isOrderEditable={isOrderEditable}
                  handleShootDragStart={handleShootDragStart}
                  handleDropShootTarget={handleDropShootTarget}
                  tags={shoot.tags}
                />
            </Link>
          ))}
          
          {!isInitialShootsLoad && !finalPageLoaded 
          
            ?

              (Array.from({ length: itemsPerPage }, (_, idx) => 

                <ShootPlaceHolder 
                  isOnShootDetails={isOnShootDetails}
                  key={idx}
                />
                )
              )

            : null

          }

        </div>

        {isLoggedIn && !isOnShootDetails && finalPageLoaded && !selectedTag && !isOrderEditable

          ? <div className="shoots__button-container">
              <button
                className="shoots__editShootOrder"
                onClick={makeOrderEditable}
              >
                Edit Order
              </button>
            </div>

          : isLoggedIn && !isOnShootDetails && finalPageLoaded && !selectedTag && isOrderEditable
          
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

      </div>
    </>
  )};

export default Shoots; 
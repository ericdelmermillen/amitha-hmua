import Shoots from "@/components/Shoots/Shoots";
import "./ShootDetailsPage.scss";
import { useAppContext } from "@/hooks/hooks";

const ShootDetailsPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  // const { selectedTag } = useAppContext()
  return (
    <div className="shootDetailsPage">
      <div className="shootDetailsPage__inner">

        {/* *** */}
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <h1 className="shootDetailsPage__heading">Shoot {id}</h1>
        
        {/* *** */}


        <div className="shootDetailsPage__photos">   

          <div className={`shootDetailsPage__photo-placeholders`}
          >
            <div className="shootDetailsPage__date-placeholder"></div>
            <div className="shootDetailsPage__photo-placeholder shootDetailsPage__photo-placeholder--1"></div>
            <div className="shootDetailsPage__detail-placeholders">
              <div className="shootDetailsPage__detail-placeholder"></div>
              <div className="shootDetailsPage__detail-placeholder"></div>
            </div>
            <div className="shootDetailsPage__photo-placeholder"></div>
            <div className="shootDetailsPage__photo-placeholder"></div>
            <div className="shootDetailsPage__photo-placeholder"></div>
            <div className="shootDetailsPage__photo-placeholder"></div>
          </div>
          
          {/* {photos && photos.map((photo, idx) => 
            <div 
              className={`shootDetailsPage__photo-container ${componentIsLoaded 
                ? "show"
              : ""}`}
              key={idx}
            >
              
              {idx === 0 && 

                <h4 
                  className={`shootDetailsPage__date ${shootDetailsPage 
                    ? "show"
                    : ""}`}
                >
                  {formattedDate && formattedDate}
                </h4>
              }
              
              <img 
                className='shootDetailsPage__photo'
                src={photo.photo_url} 
                alt={`Photo from photo shoot ${shoot_id}`} 
                onClick={() => handleSetLightBoxImages(idx)}
                onLoad={idx === photos.length - 1 
                  ? handlePhotosLoaded 
                  : null} 
              />

              {idx === 0 && 
                (
                  <>
                    <div className="shootDetailsPage__info">
                      
                      <h3   
                        className={`shootDetailsPage__models ${shootDetailsPage && "show"}`}
                      >
                        {shootDetailsPage 
                          ? (
                            <span 
                              className={"shootDetailsPage__models-label"}>
                                {models.length > 1 
                                ? "Models: " 
                                : "Model: "}
                            </span>
                            )
                          : null
                        }
                      
                        {shootDetailsPage && models.length > 1 
                            ? models.join(", ") 
                            : models
                        }
                      </h3>

                      <h3   
                        className={`shootDetailsPage__photographers ${shootDetailsPage 
                          ? "show"
                          : ""}`}
                      >
                        {photographers 
                          ? 
                            <span className="shootDetailsPage__photographers-label">
                              {"Photos: "}
                            </span>              

                          : null
                        }

                        {shootDetailsPage && photographers.length > 1 
                          ? photographers.join(", ") 
                          : photographers}
                      </h3>

                      <h3   
                        className={`shootDetailsPage__photographers ${shootDetailsPage 
                          ? "show"
                          : ""}`}
                      >
                        {/* showing shoot tags if logged in to help with debugging */}
                        {/* {isLoggedIn && shootDetailsPage && shootDetailsPage.tags.length < 1
                          ? `Tags: ${shootDetailsPage.tags}`
                          : isLoggedIn && shootDetailsPage && shootDetailsPage.tags.length >= 1  && !shootDetailsPage.tags !== null
                          ? `Tags: ${shootDetailsPage.tags.join(", ")}`
                          : null}
                      </h3>
                    </div>
                  </>

                )}
            </div>
          )}  */}


        </div>

      </div>
      <div className="shootDetails__divider"></div>
      <div className="shootDetails__bottom">
        <Shoots />
      </div>
    </div>
  )};

export default ShootDetailsPage;
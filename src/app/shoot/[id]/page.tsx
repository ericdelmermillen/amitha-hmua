import { redirect } from "next/navigation";
import { ShootDetailsPageProps } from "@/typing/interfaces";
import { getShootByID } from "@/actions/shootActions"
import Image from "next/image";
import Shoots from "@/components/Shoots/Shoots";
import "./ShootDetailsPage.scss";

const ShootDetailsPage = async ({ params }: ShootDetailsPageProps) => {
  const { id } = await params;
  const shootIdNum = parseInt(id, 10);

  if (isNaN(shootIdNum)) {
    redirect("/not-found");
  }

  let data;

  try {
    data = await getShootByID(shootIdNum);

  } catch (error) {
    console.error(`Error fetching shoot details for ID ${shootIdNum}:`, error);
    throw error;
  }

  // refactor to use notFound() after implementing Text Themes
  if (!data) {
    redirect("/not-found");
  }

  const {
    shoot_id: shootID,
    photographers,
    models,
    photo_urls: photos,
    shoot_date: date
  } = data;

  const formattedDate = date 
    ? new Date(date).toLocaleString("en-US", { month: "short", year: "numeric" }) 
    : "";

  return (
    <div className="shootDetailsPage">
      <div className="shootDetailsPage__inner">

        <div className="shootDetailsPage__photos">   
          
          {photos && photos.map((photo, idx) => 

            <div key={photo.photo_url} className="shootDetailsPage__photo-container">
              
              {idx === 0 && 

                <h4 className="shootDetailsPage__date">
                  {formattedDate}
                </h4>
              }

              <div className="shootDetailsPage__imageBox">

                <Image 
                  src={photo.photo_url} 
                  alt={`Photo from photo shoot ${shootID}`} 
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="shootDetailsPage__image"
                  priority={idx === 0}
                  fill
                />

              </div>

              {idx === 0 && 

                (
                  <div className="shootDetailsPage__info">
                    <h3 className="shootDetailsPage__models">

                    <span className={"shootDetailsPage__models-label"}>
                      {models.length > 1 ? "Models: " : "Model: "}
                    </span>
                      {models.join(", ")}
                    </h3>

                    <h3 className="shootDetailsPage__photographers">

                      <span className="shootDetailsPage__photographers-label">
                        {"Photos: "}
                      </span>              

                      {photographers.join(", ")}
                    </h3>
                  </div>
                )}

            </div>
          )}  

        </div>

      </div>
      <div className="shootDetailsPage__divider"></div>
      <div className="shootDetailsPage__bottom">
        <Shoots />
      </div>
    </div>
  )};

export default ShootDetailsPage;
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShootDetailsPageProps } from "@/typing/interfaces";
import { Suspense } from "react";
import { getShootByID } from "@/actions/shootActions"
import Shoots, { ShootsFallback } from "@/components/Shoots/Shoots";
import "./ShootDetailsPage.scss";
import ShootPhotosGallery from "@/components/ShootPhotosGalery/ShootPhotosGalery";

const ShootDetailsPage = async ({ params }: ShootDetailsPageProps) => {
  const { id } = await params;
  const shootIdNum = parseInt(id, 10);

  if (isNaN(shootIdNum)) {
    redirect(`/not-found?shoot=${id}`);
  }

  let data;

  try {
    const response = await getShootByID(shootIdNum);
    data = response?.data;

  } catch (error) {
    console.error(`Error fetching shoot details for ID ${shootIdNum}:`, error);
    throw error;
  }

  if (!data) {
    redirect(`/not-found?shoot=${id}`);
  }

  const {
    shoot_id: shootID,
    photographers,
    models,
    photo_urls: photos,
    shoot_date: date
  } = data;

  const formattedDate = date
    ? new Date(`${date}T00:00:00`).toLocaleString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "";

  return (
    <div className="shootDetailsPage">
      <div className="shootDetailsPage__inner">

        <ShootPhotosGallery 
          photos={photos}
          formattedDate={formattedDate}
          models={models}
          photographers={photographers}
          shootID={id}
        />

      </div>
      <div className="shootDetailsPage__divider"></div>
      <div className="shootDetailsPage__bottom">
        <Suspense fallback={<ShootsFallback isOnShootDetails={true} />}>
          <Shoots />
        </Suspense>
      </div>
    </div>
  );
};

const generateMetadata = async ( {params }: ShootDetailsPageProps): Promise<Metadata> => {
  const { id } = await params;
  const shootIdNum = parseInt(id, 10);

  if (isNaN(shootIdNum)) {
    return {
      title: "Shoot Not Found | Amitha HMUA",
    };
  }

  try {
    const response = await getShootByID(shootIdNum);
    const shootData = response.data;

    if (!response?.success || !shootData) {
      return {
        title: "Shoot Not Found | Amitha HMUA",
      };
    }

    const modelNames = shootData?.models.join(", ");
    const photographerNames = shootData?.photographers.join(", ");
    const primaryImage = shootData?.photo_urls?.at(0)?.photo_url || "";

    const title = `Shoot #${shootData?.shoot_id}${modelNames ? ` - ${modelNames}` : ""} | Amitha HMUA`;
    const description = `Hair and Makeup by Amitha Millen-Suwanta.${photographerNames ? ` Photography by ${photographerNames}.` : ""}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: primaryImage ? [{ url: primaryImage }] : [],
      },
    };
  } catch {
    return {
      title: "Portfolio Shoot | Amitha HMUA",
    };
  }
};

export default ShootDetailsPage;
export { generateMetadata };
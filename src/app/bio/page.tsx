import type { Metadata } from "next";
import Image from "next/image";
import { BioResponse } from "@/typing/interfaces";
import { getBio } from "@/actions/bioActions";
import { toast } from "react-toastify";
import { splitOnNewLine } from "@/utils/utils";
import ClientButton from "@/components/ClientButton/ClientButton";
import "./BioPage.scss";


const BioPage = async () => {
  let response: BioResponse;

  try {
    response = await getBio();
  } catch (error) {
    console.error("Failed to load bio:", error);
    toast.error("An error occured. Please try again later.")
    throw error;
  }

  if (!response.success || !response.data) {
    throw new Error(response.message ?? "Failed to load bio data");
  }

  const {
    bioName,
    bioText,
    bioImgURL,
    bioImageNotSet
  } = response.data;
  
return (
    <div className="bioPage">
      <div className={"bioPage__inner"}>

        <div className="bioPage__hero-container">

          <div className="bioPage__heroImg-container">

            {bioImageNotSet

              ? (
                  <div className="bioPage__heroImg--missing">
                    <h3 className="bioPage__missingImg">
                      No Image Set
                    </h3>
                  </div>
                )
              : (
                <Image
                  className="bioPage__heroImg"
                  src={bioImgURL}
                  alt={`Hero Image of ${bioName}`}
                  sizes="(max-width: 768px) calc(100vw - 4rem), 50vw"
                  fill
                  priority
                  // onClick={handleSetLightBox}
                />
              )

            }

          </div>
          <h3 className={`bioPage__heroName`}>
            {bioName}
          </h3>

          <div className="bioPage__button-container">
            <ClientButton text="Edit Bio" buttonType="editBio" />
          </div>

        </div>
        <div className="bioPage__divider"></div>

        <div className="bioPage__text-container">

          {bioText.length > 0 && splitOnNewLine(bioText).map((paragraph, idx) => 

            <p key={idx} className={"bioPage__text"}>
              {paragraph}
            </p>

          )}

        </div>

      </div>

    </div>
  );
};


const generateMetadata = async (): Promise<Metadata> => {
  try {
    const response = await getBio();

    if (!response.success || !response.data) {
      return {
        title: "Bio | Amitha HMUA",
        description: "Learn more about hair and makeup artist Amitha Millen-Suwanta.",
      };
    }

    const { bioName, bioText, bioImgURL, bioImageNotSet } = response.data;
    const cleanBioSnippet = bioText
      ? `${bioText.slice(0, 155).trim()}...`
      : "Toronto-based professional hair and makeup artist specializing in bridal and editorial artistry.";

    const title = `About ${bioName} | Amitha HMUA`;

    return {
      title,
      description: cleanBioSnippet,
      alternates: {
        canonical: "/bio",
      },
      openGraph: {
        title,
        description: cleanBioSnippet,
        url: "/bio",
        type: "profile",
        images: !bioImageNotSet && bioImgURL
          ? [
              {
                url: bioImgURL,
                width: 1200,
                height: 1500,
                alt: `Portrait of ${bioName}`,
              },
            ]
          : [],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description: cleanBioSnippet,
        images: !bioImageNotSet && bioImgURL ? [bioImgURL] : [],
      },
    };
  } catch {
    return {
      title: "About | Amitha HMUA",
      description: "Learn more about hair and makeup artist Amitha Millen-Suwanta.",
    };
  }
};

export { generateMetadata };

export default BioPage;
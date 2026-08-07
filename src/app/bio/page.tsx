import Image from "next/image";
import { BioResponse } from "@/typing/interfaces";
import { getBio } from "@/actions/bioActions";
import { toast } from "react-toastify";
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
  };

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
    <>
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
              <ClientButton
                text="Edit Bio"
                buttonType="editBio"
              />
            </div>

          </div>
          <div className="bioPage__divider"></div>

          <div className="bioPage__text-container">

            {bioText.length 
              ? bioText
                  .split("\n")
                  .filter((paragraph) => paragraph.trim() !== "")
                  .map((paragraph, idx) => 

                (<p 
                  className={"bioPage__text"}
                  key={idx}
                >
                  {paragraph}
                </p>))

              : null
            }

          </div>

        </div>

      </div>
    </>
  );
};

export default BioPage;
import "./BioPage.scss";

const BioPage = () => {

return (
    <>
      <div className="bio">
        <div 
          className={"bio__inner"}
        >
          {/* *** */}
          <br></br>
          <br></br>
          <br></br>
          <br></br>
          <br></br>
          <h1 className="bioPage__heading">
            Bio Page
          </h1>

          {/* *** */}
          <div className="bio__hero-container">

            <div className="bio__heroImg-container">

              <div 
                className={`bio__heroImg--placeholder}`
              }
              ></div>
              {/* <img
                className={`bio__heroImg`}
                src={bioImg}
                alt={`Hero Image of ${bioName}`}
                onClick={handleSetLightBox}
                onLoad={() => setIsComponentLoaded(true)}
              /> */}
            </div>
            <h3 className={`bio__heroCaption`}
            >
              {/* {bioName} */}
              <span className="bio__heroCaption--placeholder"></span>
            </h3>


        {/* {isLoggedIn 
          ? 
            <div className="bio__button-container">
              <button
                className='bio__edit-button'
                onClick={handleEditBioClick}
                >
                Edit Bio
              </button>
            </div>

          : null
        } */}
          </div>
          <div className="bio__divider"></div>
          <div className="bio__text-container">
            <div className={`bio__text-placeholders `}>
              <div className="bio__text-placeholder">
                <div className="bio__placeholder-textLine"></div>
                <div className="bio__placeholder-textLine"></div>
                <div className="bio__placeholder-textLine"></div>
                <div className="bio__placeholder-textLine"></div>
                <div className="bio__placeholder-textLine bio__placeholder-textLine--50"></div>
              </div>
              <div className="bio__text-placeholder">
                <div className="bio__placeholder-textLine"></div>
                <div className="bio__placeholder-textLine"></div>
                <div className="bio__placeholder-textLine"></div>
                <div className="bio__placeholder-textLine bio__placeholder-textLine--75"></div>
              </div>
              <div className="bio__text-placeholder">
                <div className="bio__placeholder-textLine"></div>
                <div className="bio__placeholder-textLine"></div>
                <div className="bio__placeholder-textLine"></div>
                <div className="bio__placeholder-textLine bio__placeholder-textLine--25"></div>
              </div>

            </div>

            {/* {bioText.length 
              ? bioText
                  .split("\n")
                  .filter((paragraph) => paragraph.trim() !== "")
                  .map((paragraph, idx) => 

                (<p 
                  className={`bio__text ${componentIsLoaded 
                    ? "show" 
                    : ""}`}
                  key={idx}
                >
                  {paragraph}
                </p>))

              : null
            } */}

          </div>

        </div>

      </div>
    </>
  );
};

export default BioPage;
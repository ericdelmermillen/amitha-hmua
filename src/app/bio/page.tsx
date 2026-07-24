import "./BioPage.scss";

const BioPage = () => {

return (
    <>
      <div className="bioPage">
        <div 
          className={"bioPage__inner"}
        >

          <div className="bioPage__hero-container">

                      {/* *** */}
          <br></br>
          <br></br>
          <br></br>
          <br></br>
          <br></br>
          <br></br>
          <br></br>
          <h1 className="bioPage__heading">
            Bio Page
          </h1>

            <div className="bioPage__heroImg-container">

              <div 
                className={`bioPage__heroImg--placeholder}`
              }
              ></div>
              {/* <img
                className={`bioPage__heroImg`}
                src={bioImg}
                alt={`Hero Image of ${bioName}`}
                onClick={handleSetLightBox}
                onLoad={() => setIsComponentLoaded(true)}
              /> */}
            </div>
            <h3 className={`bioPage__heroCaption`}
            >
              {/* {bioName} */}
              <span className="bioPage__heroCaption--placeholder"></span>
            </h3>


        {/* {isLoggedIn 
          ? 
            <div className="bioPage__button-container">
              <button
                className='bioPage__edit-button'
                onClick={handleEditBioClick}
                >
                Edit Bio
              </button>
            </div>

          : null
        } */}
          </div>
          <div className="bioPage__divider"></div>
          <div className="bioPage__text-container">
            <div className={`bioPage__text-placeholders `}>
              <div className="bioPage__text-placeholder">
                <div className="bioPage__placeholder-textLine"></div>
                <div className="bioPage__placeholder-textLine"></div>
                <div className="bioPage__placeholder-textLine"></div>
                <div className="bioPage__placeholder-textLine"></div>
                <div className="bioPage__placeholder-textLine bio__placeholder-textLine--50"></div>
              </div>
              <div className="bioPage__text-placeholder">
                <div className="bioPage__placeholder-textLine"></div>
                <div className="bioPage__placeholder-textLine"></div>
                <div className="bioPage__placeholder-textLine"></div>
                <div className="bioPage__placeholder-textLine bio__placeholder-textLine--75"></div>
              </div>
              <div className="bioPage__text-placeholder">
                <div className="bioPage__placeholder-textLine"></div>
                <div className="bioPage__placeholder-textLine"></div>
                <div className="bioPage__placeholder-textLine"></div>
                <div className="bioPage__placeholder-textLine bio__placeholder-textLine--25"></div>
              </div>

            </div>

            {/* {bioText.length 
              ? bioText
                  .split("\n")
                  .filter((paragraph) => paragraph.trim() !== "")
                  .map((paragraph, idx) => 

                (<p 
                  className={`bioPage__text ${componentIsLoaded 
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
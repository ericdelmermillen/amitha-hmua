import { notFound } from "next/navigation";
import "./EditBioPage.scss";

const EditBioPage = () => {

  if (!true) {
    notFound();
  }

return (
    <>
      <div className="editBioPage">
        <div className="editBioPage__inner">
          {/* *** */}
          <br></br>
          <br></br>
          <br></br>
          <br></br>
          <br></br>
          {/* *** */}
          <h1 className="editBioPage__heading">
            Edit Your Bio
          </h1>

          <form className="editBioPage__form">

            <div className="editBioPage__hero-section">

              <div className="editBioPage__photoUpload">

                <div className="editBioPage__photoInput">
                  {/* <PhotoInput 
                    shootPhoto={inputPhotos[0]}
                    setShootPhotos={setInputPhotos}                  
                    handleImageChange={handleImageChange}
                  /> */}
                </div>

              </div>

              {/* <input 
                type="text" 
                className="editBioPage__bio-caption" 
                value={newBioName}
                onChange={(e) => handleBioCaptionChange(e)}
              /> */}
            </div>

            <div className="editBioPage__text-section">
              
              {/* <textarea 
                className='editBioPage__bio-text'
                name="" 
                id=""
                onChange={(e) => handleBioTextChange(e)}
                value={newBioText}
              /> */}


            </div>

            
          </form>
          <div className="editBioPage__button-container">
            <div 
              className="editBioPage__button"
              // onClick={handleCancel}
            >
              Cancel
            </div>
            <div 
              className="editBioPage__button"
              // onClick={(e) => handleSubmitBioUpdate(e)}
            >
              Update
            </div>
          </div>

        </div>
      </div>
    </>
  )};

export default EditBioPage;
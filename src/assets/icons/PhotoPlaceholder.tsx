import { IconProps } from "@/typing/interfaces";

const PhotoPlaceholder = ({ className, strokeClassName }: IconProps) => {
  return (
    <>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 81 76.556"
        className={className}
        strokeWidth="0"
        >
        <g 
          id="Group_4109" 
          data-name="Group 4109" 
          transform="translate(77.5 -136.5)"
          className={className}
        >
          <g 
            id="Group_919" 
            data-name="Group 919" 
            transform="translate(-180 -102)"
            className={strokeClassName}
          >
            <g 
              id="Group_890" 
              data-name="Group 890" 
              transform="translate(103 239)"
            >
              <path 
                id="Path_1261" 
                data-name="Path 1261" 
                d="M0,0H80V75.556H0Z" 
                strokeWidth="1"
                className={strokeClassName}
              />
            </g>
            <g 
              id="Group_4110" 
              data-name="Group 4110" 
              transform="translate(112 251)"
              className={className}
            >
              <g 
                id="Path_1379" 
                data-name="Path 1379" 
                className={strokeClassName}
              >
                <path 
                  d="M0,0H62V51.571H0Z" 
                />
                <path 
                  d="M 1 0.9999961853027344 L 1 50.57095718383789 L 61 50.57095718383789 L 61 0.9999961853027344 L 1 0.9999961853027344 M 0 -3.814697265625e-06 L 62 -3.814697265625e-06 L 62 51.57095718383789 L 0 51.57095718383789 L 0 -3.814697265625e-06 Z" 
                  className={className}
                />
              </g>
              <path
                id="ic_add_a_photo_24px" 
                d="M5.031,5.19V1H8.385V5.19h5.031V7.983H8.385v4.19H5.031V7.983H0V5.19Zm5.031,8.38V9.38h5.031V5.19h11.74L29.9,7.983h5.316a3.122,3.122,0,0,1,3.354,2.793v16.76a3.122,3.122,0,0,1-3.354,2.793H8.385a3.122,3.122,0,0,1-3.354-2.793V13.57ZM21.8,26.14c4.629,0,8.385-3.128,8.385-6.983s-3.757-6.983-8.385-6.983-8.385,3.128-8.385,6.983S17.173,26.14,21.8,26.14Zm-5.367-6.983c0,2.472,2.4,4.469,5.367,4.469s5.367-2,5.367-4.469-2.4-4.469-5.367-4.469S16.435,16.684,16.435,19.156Z" 
                transform="translate(13 9.09)" 
              />
            </g>
          </g>
        </g>
      </svg>
    </>
  )};

export default PhotoPlaceholder;
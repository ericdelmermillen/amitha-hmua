import { IconProps } from "@/typing/interfaces";

const EditIcon = ({ className, strokeClassName }: IconProps) => {
  return (
    <>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={className}
        width="17.003" 
        height="17.002" 
        viewBox="0 0 17.003 17.002"
      >
        <g 
          id="ic_border_color_24px" 
          transform="translate(-4 0.002)"
        >
          <path 
            id="Path_81" 
            data-name="Path 81" 
            d="M17.75,7,14,3.25l-10,10V17H7.75Zm2.96-2.96a1,1,0,0,0,0-1.41L18.37.29a1,1,0,0,0-1.41,0L15,2.25,18.75,6Z"
            className={strokeClassName}
          />
        </g>
      </svg>      
    </>
  )};

export default EditIcon;
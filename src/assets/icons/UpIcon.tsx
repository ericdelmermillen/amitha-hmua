import { IconProps } from "@/typing/interfaces";

const UpIcon = ({ className, strokeClassName }: IconProps) => {
  return (
    <>
      <svg 
        className={className} 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 20 20"
      >
        <g 
          id="Group_190" 
          data-name="Group 190" 
          transform="translate(-341 -288)"
        >
          <g 
            id="Group_59" 
            data-name="Group 59" 
            transform="translate(346 295.5)"
          >
          <path 
            id="Path_51" 
            data-name="Path 51" 
            d="M237,103l-5-5-5,5" 
            transform="translate(-227 -98)" 
            fill="none" 
            className={strokeClassName}
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeMiterlimit="10"
            strokeWidth="2"/>
          </g>
          <rect 
            id="Rectangle_1" 
            data-name="Rectangle 1" 
            width="20" 
            height="20" 
            transform="translate(341 288)" 
            fill="none"/>
        </g>
      </svg>
    </>
  )};

export default UpIcon;
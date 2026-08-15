import { IconProps } from "@/typing/interfaces";

const AddIcon = ({ className, strokeClassName }: IconProps) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="20" 
      height="20" 
      viewBox="0 0 20 20" 
      className={className}
    >
      <g 
        id="Group_191" 
        data-name="Group 191" 
        transform="translate(-450 -178)"
      >
        <g 
          id="Group_24" 
          data-name="Group 24" 
          transform="translate(140 176)"
        >
          <line
            id="Line_4"
            data-name="Line 4"
            y2="12"
            transform="translate(320 6)"
            fill="none"
            stroke="#000"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeMiterlimit="10"
            strokeWidth="2"
            className={strokeClassName} 
          />
          <line
            id="Line_5"
            data-name="Line 5"
            x1="12"
            transform="translate(314 12)"
            fill="none"
            stroke="#000"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeMiterlimit="10"
            strokeWidth="2"
            className={strokeClassName}
          />
        </g>
        <rect 
          id="Rectangle_2" 
          data-name="Rectangle 2" 
          width="20" 
          height="20" 
          transform="translate(450 178)" 
          fill="none" 
        />
      </g>
    </svg>
  )};

export default AddIcon;

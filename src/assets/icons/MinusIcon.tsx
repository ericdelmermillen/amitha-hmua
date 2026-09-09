import { IconProps } from "@/typing/interfaces";

const MinusIcon = ({ className }: IconProps) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="20" 
      height="20" 
      viewBox="0 0 20 20"
    >
      <g 
        id="Group_190" 
        data-name="Group 190" 
        transform="translate(-352 -1)"
      >
        <line
          className={className}
          id="Line_6"
          data-name="Line 6"
          x1="10"
          transform="translate(357.5 11.5)"
          fill="none"
          stroke="#000"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeMiterlimit="10"
          strokeWidth="2.5"
        />
        <rect
          id="Rectangle_1"
          data-name="Rectangle 1"
          width="20"
          height="20"
          transform="translate(352 1)"
          fill="none"
        />
      </g>
    </svg>
  )};

export default MinusIcon;

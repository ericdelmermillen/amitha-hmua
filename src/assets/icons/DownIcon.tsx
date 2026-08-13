import { IconProps } from "@/typing/interfaces";

const DownIcon = ({ className, strokeClassName }: IconProps) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 83.396 44.812"
      className={className}
    >
      <path 
        id="Path_1" 
        data-name="Path 1" 
        d="M1530.436,80.478l39.486,38.427-39.486,41.453" transform="translate(162.082 -1528.625) rotate(90)" fill="none" 
        strokeLinecap="round" 
        strokeWidth="12"
        className={strokeClassName}
      />
    </svg>
  );
};

export default DownIcon;

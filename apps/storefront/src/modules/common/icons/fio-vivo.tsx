import React from "react"

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: string | number
  color?: string
}

const FioVivo: React.FC<IconProps> = ({
  size = "20",
  color = "#2A2018",
  ...attributes
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 256 256"
      fill="none"
      {...attributes}
    >
      <g fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="128" cy="132" r="92" strokeWidth="11" />
        <path d="M128 130C93 117 94 78 128 52C162 78 163 117 128 130Z" strokeWidth="8" />
        <path d="M128 130C93 117 94 78 128 52C162 78 163 117 128 130Z" strokeWidth="8" transform="rotate(60 128 132)" />
        <path d="M128 130C93 117 94 78 128 52C162 78 163 117 128 130Z" strokeWidth="8" transform="rotate(120 128 132)" />
        <path d="M128 130C93 117 94 78 128 52C162 78 163 117 128 130Z" strokeWidth="8" transform="rotate(180 128 132)" />
        <path d="M128 130C93 117 94 78 128 52C162 78 163 117 128 130Z" strokeWidth="8" transform="rotate(240 128 132)" />
        <path d="M128 130C93 117 94 78 128 52C162 78 163 117 128 130Z" strokeWidth="8" transform="rotate(300 128 132)" />
      </g>
      <path d="M55 103C57 68 88 45 125 45C145 45 156 53 155 66C154 78 143 83 132 77" fill="none" stroke="#B8642F" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default FioVivo

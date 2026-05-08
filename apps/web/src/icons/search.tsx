export default function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      {...props}
    >
      <g fill="none" stroke="currentColor">
        <circle cx={11} cy={11} r={7}></circle>
        <path strokeLinecap="round" d="m20 20l-3-3"></path>
      </g>
    </svg>
  );
}

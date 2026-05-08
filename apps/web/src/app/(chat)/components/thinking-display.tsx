export default function ThinkingDisplay({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon: React.JSX.Element;
}) {
  return (
    <div className="text-primary-500 flex items-center gap-2">
      {icon}
      <span className="shimmer-text flex font-medium">
        <span>{children}</span>
        <span className="dots flex gap-0.5">
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </span>
      </span>
    </div>
  );
}

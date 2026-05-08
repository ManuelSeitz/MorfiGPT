export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative mt-5 flex h-[calc(100vh-52px)] translate-y-13 flex-col items-center gap-5 overflow-y-auto px-5 transition-all duration-300">
      {children}
    </div>
  );
}

export default function ProductsGrid({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid w-full grid-cols-1 place-items-center gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {children}
    </div>
  );
}

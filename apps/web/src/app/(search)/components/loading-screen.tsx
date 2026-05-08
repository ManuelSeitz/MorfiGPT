import ProductsGrid from "./product-grid";
import ProductSkeleton from "./product-skeleton";

export default function LoadingScreen() {
  return (
    <section className="relative mx-auto mt-10 h-[60dvh] w-full max-w-5xl overflow-hidden opacity-50">
      <div className="to-primary-50 pointer-events-none absolute inset-0 z-10 bg-linear-to-b from-transparent from-30%" />
      <ProductsGrid>
        {new Array(8).fill(null).map((_, i) => (
          <ProductSkeleton key={i} animate />
        ))}
      </ProductsGrid>
    </section>
  );
}

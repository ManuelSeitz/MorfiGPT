import clsx from "clsx";

export default function ProductSkeleton({ animate }: { animate?: boolean }) {
  return (
    <article
      className={clsx(
        "bg-primary-50 border-primary-300 flex w-full max-w-2xs flex-col items-center gap-5 rounded-xl border p-3",
        "**:data-[animate=true]:animate-pulse [&_div]:rounded-lg",
      )}
    >
      <div data-animate={animate} className="bg-primary-200 size-36 shrink-0" />
      <main className="w-full space-y-3">
        <div data-animate={animate} className="flex flex-col gap-2">
          <div className="bg-primary-200 h-4 w-4/5" />
          <div className="bg-primary-100 h-3 w-1/3" />
        </div>
        <div
          data-animate={animate}
          className="flex items-center justify-between"
        >
          <div className="bg-primary-200 h-4 w-1/4" />
          <div className="bg-primary-200 size-5 rounded-full!" />
        </div>
      </main>
    </article>
  );
}

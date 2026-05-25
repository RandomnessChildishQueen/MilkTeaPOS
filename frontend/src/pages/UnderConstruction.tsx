import Header from "@/components/Header.tsx";

export default function UnderConstruction({ page }: { page: string }) {
  return (
    <>
      <Header text={page} />
      <div className="flex flex-1 items-center justify-center h-full">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">
            You clicked <span className="text-primary">{page}</span>!
          </h1>
          <img
            className="h-100 w-auto flex justify-center items-center m-auto"
            src="images/under_construction.png"
            alt="Under Construction"
          />
          <p className="text-muted-foreground">
            But the page is still under construction. Come back later!
          </p>
        </div>
      </div>
    </>
  );
}

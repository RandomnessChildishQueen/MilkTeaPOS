import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

export default function SortControls() {
  const [nameSort, setNameSort] = useState<"asc" | "desc" | null>(null);
  const [priceSort, setPriceSort] = useState<"asc" | "desc" | null>(null);

  const cycleSort = (
    current: "asc" | "desc" | null,
    setSort: (val: "asc" | "desc" | null) => void,
  ) => {
    if (current === null) setSort("asc");
    else if (current === "asc") setSort("desc");
    else setSort(null);
  };

  return (
    <div className="flex gap-2 w-1/5 ml-2">
      <Button
        variant="outline"
        className="h-10 w-1/2 justify-between"
        onClick={() => cycleSort(nameSort, setNameSort)}
      >
        Name
        {nameSort === "asc" && <ArrowUp className="ml-2 h-4 w-4" />}
        {nameSort === "desc" && <ArrowDown className="ml-2 h-4 w-4" />}
        {nameSort === null && (
          <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground opacity-50" />
        )}
      </Button>

      <Button
        variant="outline"
        className="h-10 w-1/2 justify-between"
        onClick={() => cycleSort(priceSort, setPriceSort)}
      >
        Price
        {priceSort === "asc" && <ArrowUp className="ml-2 h-4 w-4" />}
        {priceSort === "desc" && <ArrowDown className="ml-2 h-4 w-4" />}
        {priceSort === null && (
          <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground opacity-50" />
        )}
      </Button>
    </div>
  );
}

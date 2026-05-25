import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

export default function SortControls({
  onSortChange,
}: {
  onSortChange: (
    nameSort: "asc" | "desc" | null,
    priceSort: "asc" | "desc" | null,
  ) => void;
}) {
  const [nameSort, setNameSort] = useState<"asc" | "desc" | null>(null);
  const [priceSort, setPriceSort] = useState<"asc" | "desc" | null>(null);

  const cycleSort = (
    current: "asc" | "desc" | null,
    setSort: (val: "asc" | "desc" | null) => void,
    other: "asc" | "desc" | null,
    isName: boolean,
  ) => {
    const next = current === null ? "asc" : current === "asc" ? "desc" : null;
    setSort(next);
    onSortChange(isName ? next : other, isName ? other : next);
  };

  return (
    <div className="flex gap-2 w-1/5 ml-2">
      <Button
        variant="outline"
        className="h-10 w-1/2 justify-between"
        onClick={() => cycleSort(nameSort, setNameSort, priceSort, true)}
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
        onClick={() => cycleSort(priceSort, setPriceSort, nameSort, false)}
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

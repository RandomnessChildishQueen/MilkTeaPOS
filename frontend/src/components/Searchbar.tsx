import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

interface SearchbarProps {
  className?: string;
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
}

export default function Searchbar({
  className,
  value,
  onChange,
  onSearch,
}: SearchbarProps) {
  return (
    <div className="flex w-full">
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSearch()}
        placeholder="Search..."
        className={cn("w-full bg-primary-foreground", className)}
      />
      <Button onClick={onSearch} className={cn("md:w-[50px]", className)}>
        <Search />
      </Button>
    </div>
  );
}

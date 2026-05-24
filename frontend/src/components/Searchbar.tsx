import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

export default function Searchbar({ className }: { className?: string }) {
  return (
    <div className="flex w-full">
      <Input
        type="text"
        className={cn("w-full bg-primary-foreground", className)}
      />
      <Button className={cn("md:w-[50px]", className)}>
        <Search />
      </Button>
    </div>
  );
}

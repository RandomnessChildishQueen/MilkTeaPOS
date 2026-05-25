import { client } from "@/utils/api.ts";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import Header from "@/components/Header.tsx";
import Searchbar from "@/components/Searchbar.tsx";
import SortControls from "@/components/SortControls.tsx";
import ImageUpload from "@/components/ImageUpload.tsx";

import { useFlavors } from "@/hooks/useFlavors.ts";

function Menu() {
  const [searchQuery, setSearchQuery] = useState("");
  const [nameSort, setNameSort] = useState<"asc" | "desc" | null>(null);
  const [priceSort, setPriceSort] = useState<"asc" | "desc" | null>(null);
  return (
    <>
      <Header text="Menu" />
      <div className="p-4 flex-1">
        <div>
          <SearchLayer
            onSearch={setSearchQuery}
            onSortChange={(n, p) => {
              setNameSort(n);
              setPriceSort(p);
            }}
          />
          <MenuNav />
        </div>
        <div className="flex flex-col gap-y-5">
          <CupSizes />
          <AvailableFlavors
            searchQuery={searchQuery}
            nameSort={nameSort}
            priceSort={priceSort}
          />
        </div>
      </div>
    </>
  );
}

function SearchLayer({
  onSearch,
  onSortChange,
}: {
  onSearch: (query: string) => void;
  onSortChange: (
    nameSort: "asc" | "desc" | null,
    priceSort: "asc" | "desc" | null,
  ) => void;
}) {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    onSearch(query);
  };

  return (
    <div className="flex flex-row justify-start mb-5">
      <div className="w-4/5 h-9">
        <Searchbar
          value={query}
          onChange={setQuery}
          onSearch={handleSearch}
          className="w-full h-10"
        />
      </div>
      <SortControls onSortChange={onSortChange} />
    </div>
  );
}

function MenuNav() {
  return (
    <nav className="flex flex-row justify-start gap-x-4 py-4">
      <Button variant="outline" className="text-accent text-lg h-12 w-28">
        Flavors
      </Button>
      <Button variant="outline" className="text-accent text-lg h-12 w-28">
        Add ons
      </Button>
    </nav>
  );
}

function CupSizes() {
  const { cupSizes } = useFlavors();

  return (
    <div className="flex flex-col gap-2 justify-start">
      <h2 className="py-2">Cup Sizes</h2>
      <div className="flex flex-row gap-2 items-center">
        {cupSizes.map((size) => (
          <Card key={size} className="p-4">
            {size}
          </Card>
        ))}
        <Button className="p-4">+</Button>
      </div>
    </div>
  );
}

function AvailableFlavors({
  searchQuery,
  nameSort,
  priceSort,
}: {
  searchQuery: string;
  nameSort: "asc" | "desc" | null;
  priceSort: "asc" | "desc" | null;
}) {
  const { flavors, filteredFlavors } = useFlavors(searchQuery);

  const displayFlavors = [...(searchQuery ? filteredFlavors : flavors)].sort(
    (a, b) => {
      if (nameSort) {
        return nameSort === "asc"
          ? a.flavor_name.localeCompare(b.flavor_name)
          : b.flavor_name.localeCompare(a.flavor_name);
      }
      if (priceSort) {
        const aPrice = a.variants[0]?.base_price ?? 0;
        const bPrice = b.variants[0]?.base_price ?? 0;
        return priceSort === "asc" ? aPrice - bPrice : bPrice - aPrice;
      }
      return 0;
    },
  );

  return (
    <div className="flex flex-col flex-wrap gap-2 justify-start">
      <div className="flex flex-row flex-wrap gap-2 items-center justify-between">
        <h2 className="py-2">Flavors</h2>
        <AddFlavorModal />
      </div>
      {displayFlavors.length === 0 ? (
        <div className="flex flex-col justify-center p-8 text-center">
          <p>No flavors available. Start adding flavors!</p>
        </div>
      ) : (
        displayFlavors.map((flavor) => (
          <Card
            key={flavor.flavor_id}
            className="flex flex-row justify-between items-center overflow-hidden"
          >
            <CardHeader className="flex flex-1 flex-row items-center justify-start space-y-0 gap-4 p-4 bg-card z-10">
              <img
                src={flavor.image_url || ""}
                alt={flavor.flavor_name}
                className="min-w-15 w-20 h-15 shrink-0 object-cover rounded-md bg-muted"
                onError={(e) => {
                  e.currentTarget.onerror = null; // prevent infinite loop
                  e.currentTarget.src = `https://placehold.co/40x40/e2e8f0/94a3b8?text=${encodeURIComponent(flavor.flavor_name[0])}`;
                }}
              />
              <CardTitle>{flavor.flavor_name}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-3 flex-row items-baseline gap-10 justify-around">
              <div className="flex flex-col items-start gap-2 text-start">
                {flavor.variants.map((variant) => (
                  <p key={variant.size}>
                    Price ({variant.size}): {variant.base_price}
                  </p>
                ))}
              </div>
              <p>Stock: {flavor.in_stock ? "In Stock" : "Out of Stock"}</p>
            </CardContent>
            <CardFooter className="flex flex-1 flex-row border-none gap-2">
              <button className="bg-secondary p-2 rounded-md" type="button">
                Edit
              </button>
              <button className="bg-secondary p-2 rounded-md" type="button">
                {flavor.in_stock ? "Unavailable" : "Available"}
              </button>
              <button
                className="bg-danger p-2 rounded-md text-primary-foreground"
                type="button"
              >
                Delete
              </button>
            </CardFooter>
          </Card>
        ))
      )}
    </div>
  );
}

function AddFlavorModal() {
  const {
    newFlavor,
    setNewFlavor,
    generateFlavorId,
    cupSizes,
    handleAddFlavor,
    errors,
  } = useFlavors();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="p-4 h-10">+ New Flavor</Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={(e) => handleAddFlavor(e)}>
          <DialogHeader>
            <DialogTitle>New Flavor</DialogTitle>
          </DialogHeader>
          <Field className="mx-auto flex justify-center items-center w-1/3 h-40 text-center">
            <ImageUpload
              onChange={(file) => setNewFlavor({ ...newFlavor, image: file })}
            />
          </Field>
          <FieldGroup className="flex flex-col">
            <Field>
              <Label htmlFor="flavor_name">Flavor Name</Label>
              <Input
                id="flavor_name"
                value={newFlavor.flavor_name}
                className={errors.flavor_name ? "border-red-500" : ""}
                onChange={(e) =>
                  setNewFlavor({ ...newFlavor, flavor_name: e.target.value })
                }
              />
              {errors.flavor_name && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.flavor_name}
                </p>
              )}
            </Field>
            <Field className="flex flex-col">
              <div className="flex flex-row">
                <Label className="flex flex-1" htmlFor="flavor_id">
                  Flavor ID
                </Label>
                <Input
                  className={
                    errors.flavor_id
                      ? "border-red-500 flex flex-2"
                      : "flex flex-2"
                  }
                  id="flavor_id"
                  value={newFlavor.flavor_id}
                  onChange={(e) =>
                    setNewFlavor({ ...newFlavor, flavor_id: e.target.value })
                  }
                />
                <Button
                  className="flex flex-1"
                  type="button"
                  onClick={async () => {
                    const generated = await generateFlavorId(
                      newFlavor.flavor_name,
                    );
                    setNewFlavor({
                      ...newFlavor,
                      flavor_id: generated,
                    });
                  }}
                >
                  Generate ID
                </Button>
              </div>
              {errors.flavor_id && (
                <p className="text-sm text-red-500 mt-1">{errors.flavor_id}</p>
              )}
            </Field>
          </FieldGroup>
          <FieldGroup className="flex flex-row">
            {cupSizes.map((size) => {
              const matchingSizePriceObj = newFlavor.size_prices.find(
                (item) => item.size === size,
              );
              const price = matchingSizePriceObj
                ? matchingSizePriceObj.base_price
                : "";

              return (
                <Field key={size} className="flex flex-1">
                  <Label htmlFor={`${size}_price`}>Price ({size})</Label>
                  <Input
                    id={`${size}_price`}
                    type="number"
                    min="0"
                    onKeyDown={(e) => {
                      if (e.key === "-" || e.key === "e") {
                        e.preventDefault();
                      }
                    }}
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => {
                      const updatedPrice = e.target.value;

                      const updatedSizePrices = [...newFlavor.size_prices];
                      const targetIndex = updatedSizePrices.findIndex(
                        (item) => item.size === size,
                      );
                      if (targetIndex >= 0) {
                        updatedSizePrices[targetIndex] = {
                          ...updatedSizePrices[targetIndex],
                          base_price: updatedPrice,
                        };
                      } else {
                        updatedSizePrices.push({
                          size,
                          base_price: updatedPrice,
                        });
                      }
                      setNewFlavor({
                        ...newFlavor,
                        size_prices: updatedSizePrices,
                      });
                    }}
                  />
                </Field>
              );
            })}
          </FieldGroup>
          {errors.prices && (
            <p className="text-sm text-red-500 text-center w-full mb-2">
              {errors.prices}
            </p>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Add Flavor</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default Menu;

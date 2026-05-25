import { client } from "@/utils/api.ts";
import { uploadFile } from "@/utils/fileUpload.ts";
import { useState, useEffect } from "react";

import type { InferResponseType } from "hono/client";

type Flavor = InferResponseType<typeof client.api.flavor.all.$get>;

type SizePriceInput = {
  size: string;
  base_price: string;
};

type CreateFlavorInput = {
  flavor_id: string;
  flavor_name: string;
  in_stock?: boolean;
  image: File;
  size_prices: SizePriceInput[];
};

export function useFlavors(searchQuery: string = "") {
  const API_URL = import.meta.env.VITE_API_URL;
  const [flavors, setFlavors] = useState<Flavor>([]);
  const [cupSizes, setCupSizes] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [filteredFlavors, setFilteredFlavors] = useState([]);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      const res = await client.api.flavor.search.$get({
        query: { name: searchQuery },
      });
      const data = await res.json();
      setFilteredFlavors(data);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  useEffect(() => {
    async function fetchCupSizes() {
      try {
        const response = await client.api.flavor.sizes.$get();
        const data = await response.json();
        if (Array.isArray(data)) {
          setCupSizes(data);
        } else {
          console.error("Backend returned empty or invalid array:", data);
          setCupSizes(["M", "L"]);
        }
      } catch (error) {
        console.error("Failed to fetch cup sizes:", error);
        setCupSizes(["Medio", "Largrande"]);
      }
    }
    fetchCupSizes();
  }, []);

  const [newFlavor, setNewFlavor] = useState<CreateFlavorInput>({
    flavor_id: "",
    flavor_name: "",
    in_stock: true,
    image: null as unknown as File,
    size_prices: cupSizes.map((size) => ({ size, base_price: "" })),
  });

  useEffect(() => {
    async function fetchFlavors() {
      try {
        const response = await client.api.flavor.all.$get();
        const data = await response.json();

        if (Array.isArray(data)) {
          if (Array.isArray(data)) {
            const normalized = data.map((f) => ({
              ...f,
              image_url: f.image_url?.startsWith("/")
                ? `${API_URL}${f.image_url}`
                : f.image_url,
            }));
            setFlavors(normalized);
          }
        } else {
          console.error("Backend returned invalid flavors data:", data);
          setFlavors([]);
        }
      } catch (error) {
        console.error("Failed to fetch flavors:", error);
      }
    }
    fetchFlavors();
  }, []);

  const handleAddFlavor = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrors({});
    const formErrors: { [key: string]: string } = {};

    if (!newFlavor.flavor_name) {
      formErrors.flavor_name = "Flavor name is required.";
    }
    if (!newFlavor.flavor_id) {
      formErrors.flavor_id = "Please generate a Flavor ID.";
    }

    const hasEmptyPrices = newFlavor.size_prices.some((p) => !p.base_price);
    if (hasEmptyPrices) {
      formErrors.prices = "All sizes must have a price.";
    }

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      //upload image first
      const imageUrl = await uploadFile(newFlavor.image);

      if (!imageUrl) {
        alert("Failed to upload image");
        return;
      }

      const createFlavorInput = {
        flavor_id: newFlavor.flavor_id,
        flavor_name: newFlavor.flavor_name,
        in_stock: newFlavor.in_stock ?? true,
        image_url: imageUrl,
        size_prices: newFlavor.size_prices,
      };

      const response = await client.api.flavor.add.$post({
        json: createFlavorInput,
      });

      if (!response.ok) {
        alert("Failed to add flavor");
        return;
      }
      alert("Flavor added successfully");

      window.location.reload();
    } catch (error) {
      console.error("Failed to add flavor:", error);
    }
  };

  const generateFlavorId = async (flavor_name: string): Promise<string> => {
    if (!flavor_name) {
      alert("Try inputting a flavor name first.");
      return "";
    }

    try {
      const response = await client.api.flavor["generate-id"].$get({
        query: { flavor_name },
      });
      const data = await response.json();

      if (!data) {
        alert("No Flavor ID generated.");
        return "";
      }

      if ("error" in data) {
        console.error("Backend Error:", data.error);
        alert(`Failed to generate ID: ${data.error}`);
        return "";
      }

      return data.flavor_id;
    } catch (e) {
      console.error("Failed to generate flavor ID:", e);
      return "";
    }
  };

  return {
    flavors,
    cupSizes,
    newFlavor,
    setNewFlavor,
    handleAddFlavor,
    generateFlavorId,
    errors,
    filteredFlavors,
    setFilteredFlavors,
  };
}

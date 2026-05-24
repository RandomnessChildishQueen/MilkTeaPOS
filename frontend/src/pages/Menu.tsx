import { client } from "@/utils/api.ts";
import { useState, useEffect } from "react";
import Header from "@/components/Header.tsx";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import type { InferResponseType } from "hono/client";

type Flavor = InferResponseType<typeof client.api.flavor.all.$get>;

function Menu() {
  const [flavors, setFlavors] = useState<Flavor>([]);

  useEffect(() => {
    async function fetchFlavors() {
      const response = await client.api.flavor.all.$get();
      const data = await response.json();
      setFlavors(data);
    }
    fetchFlavors();
  }, []);

  return (
    <>
      <Header text="Menu" />
      <div className="flex justify-start my-5 mx-5">
        <Input className="w-4/5" />
        <Button>Search</Button>
      </div>
      {flavors.map((flavor) => (
        <Card key={flavor.flavor_id}>
          <CardHeader>
            <CardTitle>{flavor.flavor_name}</CardTitle>
          </CardHeader>
          <CardContent></CardContent>
        </Card>
      ))}
    </>
  );
}

export default Menu;

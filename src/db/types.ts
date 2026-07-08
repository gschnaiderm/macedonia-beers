import { z } from "zod";

// Types definition for db JSONB "attributes" field

export const beerAttributesSchema = z.object({
  ibu: z.number().int().min(0).max(150).optional(),
  abv: z.number().min(0).max(20).optional(),
  color: z.string().max(100).optional(),
});

export type BeerAttributes = z.infer<typeof beerAttributesSchema>;

// union type for all products attributes
export type ProductsAttributes = BeerAttributes;
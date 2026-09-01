export class CreateProductDto {
  name: string;
  description?: string;
  priceInCents: number;
  currency: string;
}
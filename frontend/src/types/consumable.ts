export interface Consumable {
  id: string;
  name: string;
  description: string;
  packageQuantity: number;
  price: number;
  unitPrice: number;
  tags: string[];
  storeLink?: string;
  imageData?: string; // Base64 encoded image data
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateConsumableInput {
  name: string;
  description: string;
  packageQuantity: number;
  price: number;
  tags: string[];
  storeLink?: string;
  imageData?: string;
}

export interface UpdateConsumableInput {
  id: string;
  name?: string;
  description?: string;
  packageQuantity?: number;
  price?: number;
  tags?: string[];
  storeLink?: string;
  imageData?: string;
}

export interface ProjectConsumableInput {
  quantity: number;
  consumableId: string;
}

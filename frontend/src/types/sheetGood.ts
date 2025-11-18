export interface SheetGood {
  id: string;
  name: string;
  description: string;
  width: number;
  length: number;
  thickness: number;
  price: number;
  materialType: string;
  tags: string[];
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSheetGoodInput {
  name: string;
  description: string;
  width: number;
  length: number;
  thickness: number;
  price: number;
  materialType: string;
  tags: string[];
}

export interface UpdateSheetGoodInput {
  id: string;
  name?: string;
  description?: string;
  width?: number;
  length?: number;
  thickness?: number;
  price?: number;
  materialType?: string;
  tags?: string[];
}

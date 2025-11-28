export interface CutList {
  id: string;
  width: number;
  thickness: number;
  length: number;
  quantity: number;
  description?: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCutListInput {
  projectId: string;
  width: number;
  thickness: number;
  length: number;
  quantity: number;
  description?: string;
}

export interface UpdateCutListInput {
  width?: number;
  thickness?: number;
  length?: number;
  quantity?: number;
  description?: string;
  isCompleted?: boolean;
}

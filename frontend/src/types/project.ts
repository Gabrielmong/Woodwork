import type { Lumber } from './lumber';

// 1 Costa Rican vara = 33 inches (0.8382 meters)
export const VARA_TO_INCHES = 33;

export const ProjectStatus = {
  PLANNED: 'PLANNED',
  IN_PROGRESS: 'IN_PROGRESS',
  FINISHING: 'FINISHING',
  COMPLETED: 'COMPLETED',
} as const;

export type ProjectStatus = (typeof ProjectStatus)[keyof typeof ProjectStatus];

export interface Board {
  id: string;
  width: number;
  thickness: number;
  length: number;
  quantity: number;
  lumberId: string;
  lumber?: Lumber;
  boardFeet: number;
}

export interface ProjectSheetGood {
  id: string;
  quantity: number;
  sheetGoodId: string;
  sheetGood?: {
    id: string;
    name: string;
    description: string;
    width: number;
    length: number;
    thickness: number;
    price: number;
    materialType: string;
    tags: string[];
  };
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  boards?: Board[];
  finishIds?: string[]; // array of finish IDs (for form input)
  finishes?: Array<{ id: string; name: string; price: number }>; // populated finishes from backend
  projectSheetGoods: ProjectSheetGood[];
  laborCost: number;
  miscCost: number;
  additionalNotes?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SharedProject {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  boards: Board[];
  finishes?: Array<{
    id: string;
    name: string;
    price: number;
    imageData?: string;
    description: string;
  }>;
  projectSheetGoods: ProjectSheetGood[];
  laborCost: number;
  miscCost: number;
  additionalNotes?: string;
  totalBoardFeet: number;
  materialCost: number;
  finishCost: number;
  sheetGoodsCost: number;
  totalCost: number;
  createdBy: string;
  currency: string;
  createdAt: string;
}

export interface CreateBoardInput {
  width: number;
  thickness: number;
  length: number;
  quantity: number;
  lumberId: string;
}

export interface CreateProjectSheetGoodInput {
  quantity: number;
  sheetGoodId: string;
}

export interface CreateProjectInput {
  name: string;
  description: string;
  status?: ProjectStatus;
  boards?: CreateBoardInput[];
  finishIds?: string[];
  projectSheetGoods?: CreateProjectSheetGoodInput[];
  laborCost: number;
  miscCost: number;
  additionalNotes?: string;
}

export interface UpdateProjectInput {
  id: string;
  name?: string;
  description?: string;
  status?: ProjectStatus;
  boards?: CreateBoardInput[];
  finishIds?: string[];
  projectSheetGoods?: CreateProjectSheetGoodInput[];
  laborCost?: number;
  miscCost?: number;
  additionalNotes?: string;
}

// Calculation helpers
export function calculateBoardFootage(board: Board): number {
  const lengthInInches = board.length * VARA_TO_INCHES;
  const boardFeet = (board.width * board.thickness * lengthInInches) / 144;
  return boardFeet * board.quantity;
}

export function calculateTotalBoardFootage(boards: Board[]): number {
  return boards.reduce((total, board) => total + calculateBoardFootage(board), 0);
}

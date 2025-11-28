import type {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
  Board,
  CreateBoardInput,
  ProjectFinish,
  CreateProjectFinishInput,
  ProjectSheetGood,
  CreateProjectSheetGoodInput,
  ProjectConsumable,
  CreateProjectConsumableInput,
} from '../../types/project';
import { VARA_TO_INCHES, ProjectStatus } from '../../types/project';

export function createBoard(input: CreateBoardInput): Board {
  const lengthInInches = input.length * VARA_TO_INCHES;
  const boardFeet = (input.width * input.thickness * lengthInInches) / 144;

  return {
    id: crypto.randomUUID(),
    ...input,
    boardFeet: boardFeet * input.quantity,
  };
}

export function createProjectFinish(input: CreateProjectFinishInput): ProjectFinish {
  return {
    id: crypto.randomUUID(),
    ...input,
  };
}

export function createProjectSheetGood(input: CreateProjectSheetGoodInput): ProjectSheetGood {
  return {
    id: crypto.randomUUID(),
    ...input,
  };
}

export function createProjectConsumable(input: CreateProjectConsumableInput): ProjectConsumable {
  return {
    id: crypto.randomUUID(),
    ...input,
  };
}

export function createProject(input: CreateProjectInput): Project {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name: input.name,
    description: input.description,
    status: input.status || ProjectStatus.PLANNED,
    price: input.price || 0,
    measurementUnit: input.measurementUnit || 'inches',
    boards: input?.boards?.map(createBoard),
    projectFinishes: input.projectFinishes?.map(createProjectFinish) || [],
    projectSheetGoods: input.projectSheetGoods?.map(createProjectSheetGood) || [],
    projectConsumables: input.projectConsumables?.map(createProjectConsumable) || [],
    laborCost: input.laborCost,
    miscCost: input.miscCost,
    additionalNotes: input.additionalNotes,
    isDeleted: false,
    createdAt: now,
    updatedAt: now,
  };
}

export function updateProjectItem(
  project: Project,
  updates: Omit<UpdateProjectInput, 'id'>
): Project {
  return {
    ...project,
    name: updates.name ?? project.name,
    description: updates.description ?? project.description,
    status: updates.status ?? project.status,
    price: updates.price ?? project.price,
    boards: updates.boards ? updates.boards.map(createBoard) : project.boards,
    projectFinishes: updates.projectFinishes
      ? updates.projectFinishes.map(createProjectFinish)
      : project.projectFinishes,
    projectSheetGoods: updates.projectSheetGoods
      ? updates.projectSheetGoods.map(createProjectSheetGood)
      : project.projectSheetGoods,
    projectConsumables: updates.projectConsumables
      ? updates.projectConsumables.map(createProjectConsumable)
      : project.projectConsumables,
    laborCost: updates.laborCost ?? project.laborCost,
    miscCost: updates.miscCost ?? project.miscCost,
    additionalNotes: updates.additionalNotes ?? project.additionalNotes,
    updatedAt: new Date().toISOString(),
  };
}

export function softDeleteProjectItem(project: Project): Project {
  return {
    ...project,
    isDeleted: true,
    updatedAt: new Date().toISOString(),
  };
}

export function restoreProjectItem(project: Project): Project {
  return {
    ...project,
    isDeleted: false,
    updatedAt: new Date().toISOString(),
  };
}

export function findProjectById(projects: Project[], id: string): Project | undefined {
  return projects.find((project) => project.id === id);
}

export function filterActiveProjects(projects: Project[]): Project[] {
  return projects.filter((project) => !project.isDeleted);
}

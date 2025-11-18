import type {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
  Board,
  CreateBoardInput,
  ProjectSheetGood,
  CreateProjectSheetGoodInput,
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

export function createProjectSheetGood(input: CreateProjectSheetGoodInput): ProjectSheetGood {
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
    boards: input?.boards?.map(createBoard),
    finishIds: input.finishIds,
    projectSheetGoods: input.projectSheetGoods?.map(createProjectSheetGood) || [],
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
    boards: updates.boards ? updates.boards.map(createBoard) : project.boards,
    finishIds: updates.finishIds ?? project.finishIds,
    projectSheetGoods: updates.projectSheetGoods
      ? updates.projectSheetGoods.map(createProjectSheetGood)
      : project.projectSheetGoods,
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

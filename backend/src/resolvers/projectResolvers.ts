import { PrismaClient } from '@prisma/client';
import { requireAuth, requireOwnership } from '../middleware/auth';
import { NotFoundError } from '../utils/errors';

const prisma = new PrismaClient();

// Helper function to calculate board feet
// Formula: (width × thickness × length_in_inches) / 144 × quantity
// 1 vara = 33 inches
const calculateBoardFeet = (
  width: number,
  thickness: number,
  length: number,
  quantity: number
): number => {
  const lengthInInches = length * 33;
  return ((width * thickness * lengthInInches) / 144) * quantity;
};

export const projectResolvers = {
  Query: {
    projects: async (
      _: any,
      { includeDeleted = false }: { includeDeleted?: boolean },
      context: any
    ) => {
      const user = requireAuth(context);
      return prisma.project.findMany({
        where: {
          userId: user.userId,
          ...(includeDeleted ? {} : { isDeleted: false }),
        },
        include: {
          boards: {
            include: {
              lumber: true,
            },
          },
          finishes: true,
          projectSheetGoods: {
            include: {
              sheetGood: true,
            },
          },
        },
        // place status 'in progress' projects first, then order by updatedAt descending
        orderBy: [
          {
            status: 'asc',
          },
          {
            updatedAt: 'desc',
          },
        ],
      });
    },

    project: async (_: any, { id }: { id: string }, context: any) => {
      const project = await prisma.project.findUnique({
        where: { id },
        include: {
          boards: {
            include: {
              lumber: true,
            },
          },
          finishes: true,
          projectSheetGoods: {
            include: {
              sheetGood: true,
            },
          },
        },
      });

      if (!project) {
        throw new NotFoundError('Project not found');
      }

      requireOwnership(context, project.userId);

      return project;
    },

    // Public query - no authentication required
    sharedProject: async (_: any, { id }: { id: string }) => {
      const project = await prisma.project.findUnique({
        where: { id },
        include: {
          boards: {
            include: {
              lumber: true,
            },
          },
          finishes: true,
          projectSheetGoods: {
            include: {
              sheetGood: true,
            },
          },
          user: {
            select: {
              firstName: true,
              lastName: true,
              settings: {
                select: {
                  currency: true,
                },
              },
            },
          },
        },
      });

      if (!project) {
        throw new NotFoundError('Project not found');
      }

      // Only allow sharing of non-deleted projects
      if (project.isDeleted) {
        throw new NotFoundError('Project not found');
      }

      return project;
    },
  },

  Mutation: {
    createProject: async (_: any, { input }: any, context: any) => {
      const user = requireAuth(context);
      const { boards, finishIds, projectSheetGoods, ...projectData } = input;

      return prisma.project.create({
        data: {
          ...projectData,
          userId: user.userId,
          ...(boards &&
            boards.length > 0 && {
              boards: {
                create: boards,
              },
            }),
          ...(finishIds &&
            finishIds.length > 0 && {
              finishes: {
                connect: finishIds.map((id: string) => ({ id })),
              },
            }),
          ...(projectSheetGoods &&
            projectSheetGoods.length > 0 && {
              projectSheetGoods: {
                create: projectSheetGoods,
              },
            }),
        },
        include: {
          boards: {
            include: {
              lumber: true,
            },
          },
          finishes: true,
          projectSheetGoods: {
            include: {
              sheetGood: true,
            },
          },
        },
      });
    },

    updateProject: async (_: any, { id, input }: any, context: any) => {
      const { boards, finishIds, projectSheetGoods, ...projectData } = input;

      const project = await prisma.project.findUnique({
        where: { id },
      });

      if (!project) {
        throw new NotFoundError('Project not found');
      }

      requireOwnership(context, project.userId);

      // Delete existing boards if boards are being updated
      if (boards) {
        await prisma.board.deleteMany({
          where: { projectId: id },
        });
      }

      // Delete existing project sheet goods if they are being updated
      if (projectSheetGoods) {
        await prisma.projectSheetGood.deleteMany({
          where: { projectId: id },
        });
      }

      return prisma.project.update({
        where: { id },
        data: {
          ...projectData,
          ...(boards && {
            boards: {
              create: boards,
            },
          }),
          ...(finishIds && {
            finishes: {
              set: finishIds.map((finishId: string) => ({ id: finishId })),
            },
          }),
          ...(projectSheetGoods && {
            projectSheetGoods: {
              create: projectSheetGoods,
            },
          }),
        },
        include: {
          boards: {
            include: {
              lumber: true,
            },
          },
          finishes: true,
          projectSheetGoods: {
            include: {
              sheetGood: true,
            },
          },
        },
      });
    },

    deleteProject: async (_: any, { id }: { id: string }, context: any) => {
      const project = await prisma.project.findUnique({
        where: { id },
      });

      if (!project) {
        throw new NotFoundError('Project not found');
      }

      requireOwnership(context, project.userId);

      return prisma.project.update({
        where: { id },
        data: { isDeleted: true },
        include: {
          boards: {
            include: {
              lumber: true,
            },
          },
          finishes: true,
          projectSheetGoods: {
            include: {
              sheetGood: true,
            },
          },
        },
      });
    },

    restoreProject: async (_: any, { id }: { id: string }, context: any) => {
      const project = await prisma.project.findUnique({
        where: { id },
      });

      if (!project) {
        throw new NotFoundError('Project not found');
      }

      requireOwnership(context, project.userId);

      return prisma.project.update({
        where: { id },
        data: { isDeleted: false },
        include: {
          boards: {
            include: {
              lumber: true,
            },
          },
          finishes: true,
          projectSheetGoods: {
            include: {
              sheetGood: true,
            },
          },
        },
      });
    },

    hardDeleteProject: async (_: any, { id }: { id: string }, context: any) => {
      const project = await prisma.project.findUnique({
        where: { id },
      });

      if (!project) {
        throw new NotFoundError('Project not found');
      }

      requireOwnership(context, project.userId);

      await prisma.project.delete({
        where: { id },
      });
      return true;
    },
  },

  // Field resolvers for computed values
  Project: {
    totalBoardFeet: (parent: any) => {
      return parent.boards.reduce((total: number, board: any) => {
        return (
          total + calculateBoardFeet(board.width, board.thickness, board.length, board.quantity)
        );
      }, 0);
    },

    materialCost: (parent: any) => {
      return parent.boards.reduce((total: number, board: any) => {
        const boardFeet = calculateBoardFeet(
          board.width,
          board.thickness,
          board.length,
          board.quantity
        );
        return total + boardFeet * board.lumber.costPerBoardFoot;
      }, 0);
    },

    sheetGoodsCost: (parent: any) => {
      return parent.projectSheetGoods.reduce((total: number, projectSheetGood: any) => {
        return total + projectSheetGood.sheetGood.price * projectSheetGood.quantity;
      }, 0);
    },

    finishCost: (parent: any) => {
      return parent.finishes.reduce((total: number, finish: any) => {
        return total + finish.price;
      }, 0);
    },

    totalCost: (parent: any) => {
      const materialCost = parent.boards.reduce((total: number, board: any) => {
        const boardFeet = calculateBoardFeet(
          board.width,
          board.thickness,
          board.length,
          board.quantity
        );
        return total + boardFeet * board.lumber.costPerBoardFoot;
      }, 0);

      const finishCost = parent.finishes.reduce((total: number, finish: any) => {
        return total + finish.price;
      }, 0);

      const sheetGoodsCost = parent.projectSheetGoods.reduce(
        (total: number, projectSheetGood: any) => {
          return total + projectSheetGood.sheetGood.price * projectSheetGood.quantity;
        },
        0
      );

      return materialCost + finishCost + sheetGoodsCost + parent.laborCost + parent.miscCost;
    },
  },

  Board: {
    boardFeet: (parent: any) => {
      return calculateBoardFeet(parent.width, parent.thickness, parent.length, parent.quantity);
    },
  },

  // Field resolvers for SharedProject
  SharedProject: {
    totalBoardFeet: (parent: any) => {
      if (!parent.boards || parent.boards.length === 0) return 0;
      return parent.boards.reduce((total: number, board: any) => {
        return (
          total + calculateBoardFeet(board.width, board.thickness, board.length, board.quantity)
        );
      }, 0);
    },

    materialCost: (parent: any) => {
      if (!parent.boards || parent.boards.length === 0) return 0;
      return parent.boards.reduce((total: number, board: any) => {
        const boardFeet = calculateBoardFeet(
          board.width,
          board.thickness,
          board.length,
          board.quantity
        );
        return total + boardFeet * (board.lumber?.costPerBoardFoot || 0);
      }, 0);
    },

    finishCost: (parent: any) => {
      if (!parent.finishes || parent.finishes.length === 0) return 0;
      return parent.finishes.reduce((total: number, finish: any) => {
        return total + (finish?.price || 0);
      }, 0);
    },

    sheetGoodsCost: (parent: any) => {
      if (!parent.projectSheetGoods || parent.projectSheetGoods.length === 0) return 0;
      return parent.projectSheetGoods.reduce((total: number, projectSheetGood: any) => {
        return total + (projectSheetGood.sheetGood?.price || 0) * projectSheetGood.quantity;
      }, 0);
    },

    totalCost: (parent: any) => {
      const boards = parent.boards || [];
      const finishes = parent.finishes || [];
      const projectSheetGoods = parent.projectSheetGoods || [];

      const materialCost = boards.reduce((total: number, board: any) => {
        const boardFeet = calculateBoardFeet(
          board.width,
          board.thickness,
          board.length,
          board.quantity
        );
        return total + boardFeet * (board.lumber?.costPerBoardFoot || 0);
      }, 0);

      const finishCost = finishes.reduce((total: number, finish: any) => {
        return total + (finish?.price || 0);
      }, 0);

      const sheetGoodsCost = projectSheetGoods.reduce((total: number, projectSheetGood: any) => {
        return total + (projectSheetGood.sheetGood?.price || 0) * projectSheetGood.quantity;
      }, 0);

      return (
        materialCost +
        finishCost +
        sheetGoodsCost +
        (parent.laborCost || 0) +
        (parent.miscCost || 0)
      );
    },

    createdBy: (parent: any) => {
      return `${parent.user?.firstName || ''} ${parent.user?.lastName || ''}`.trim() || 'Unknown';
    },

    currency: (parent: any) => {
      return parent.user?.settings?.currency || 'USD';
    },
  },
};

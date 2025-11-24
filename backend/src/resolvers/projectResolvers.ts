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
          projectFinishes: {
            include: {
              finish: true,
            },
          },
          projectSheetGoods: {
            include: {
              sheetGood: true,
            },
          },
          projectConsumables: {
            include: {
              consumable: true,
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
          projectFinishes: {
            include: {
              finish: true,
            },
          },
          projectSheetGoods: {
            include: {
              sheetGood: true,
            },
          },
          projectConsumables: {
            include: {
              consumable: true,
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
          projectFinishes: {
            include: {
              finish: true,
            },
          },
          projectSheetGoods: {
            include: {
              sheetGood: true,
            },
          },
          projectConsumables: {
            include: {
              consumable: true,
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
      const { boards, projectFinishes, projectSheetGoods, projectConsumables, ...projectData } = input;

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
          ...(projectFinishes &&
            projectFinishes.length > 0 && {
              projectFinishes: {
                create: projectFinishes,
              },
            }),
          ...(projectSheetGoods &&
            projectSheetGoods.length > 0 && {
              projectSheetGoods: {
                create: projectSheetGoods,
              },
            }),
          ...(projectConsumables &&
            projectConsumables.length > 0 && {
              projectConsumables: {
                create: projectConsumables,
              },
            }),
        },
        include: {
          boards: {
            include: {
              lumber: true,
            },
          },
          projectFinishes: {
            include: {
              finish: true,
            },
          },
          projectSheetGoods: {
            include: {
              sheetGood: true,
            },
          },
          projectConsumables: {
            include: {
              consumable: true,
            },
          },
        },
      });
    },

    updateProject: async (_: any, { id, input }: any, context: any) => {
      const { boards, projectFinishes, projectSheetGoods, projectConsumables, ...projectData } = input;

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

      // Delete existing project finishes if they are being updated
      if (projectFinishes) {
        await prisma.projectFinish.deleteMany({
          where: { projectId: id },
        });
      }

      // Delete existing project sheet goods if they are being updated
      if (projectSheetGoods) {
        await prisma.projectSheetGood.deleteMany({
          where: { projectId: id },
        });
      }

      // Delete existing project consumables if they are being updated
      if (projectConsumables) {
        await prisma.projectConsumable.deleteMany({
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
          ...(projectFinishes && {
            projectFinishes: {
              create: projectFinishes,
            },
          }),
          ...(projectSheetGoods && {
            projectSheetGoods: {
              create: projectSheetGoods,
            },
          }),
          ...(projectConsumables && {
            projectConsumables: {
              create: projectConsumables,
            },
          }),
        },
        include: {
          boards: {
            include: {
              lumber: true,
            },
          },
          projectFinishes: {
            include: {
              finish: true,
            },
          },
          projectSheetGoods: {
            include: {
              sheetGood: true,
            },
          },
          projectConsumables: {
            include: {
              consumable: true,
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
          projectFinishes: {
            include: {
              finish: true,
            },
          },
          projectSheetGoods: {
            include: {
              sheetGood: true,
            },
          },
          projectConsumables: {
            include: {
              consumable: true,
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
          projectFinishes: {
            include: {
              finish: true,
            },
          },
          projectSheetGoods: {
            include: {
              sheetGood: true,
            },
          },
          projectConsumables: {
            include: {
              consumable: true,
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
      return parent.projectFinishes.reduce((total: number, projectFinish: any) => {
        const percentageDecimal = projectFinish.percentageUsed / 100;
        return total + (projectFinish.finish.price * percentageDecimal * projectFinish.quantity);
      }, 0);
    },

    consumableCost: (parent: any) => {
      return parent.projectConsumables.reduce((total: number, projectConsumable: any) => {
        const unitPrice = projectConsumable.consumable.price / projectConsumable.consumable.packageQuantity;
        return total + projectConsumable.quantity * unitPrice;
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

      const finishCost = parent.projectFinishes.reduce((total: number, projectFinish: any) => {
        const percentageDecimal = projectFinish.percentageUsed / 100;
        return total + (projectFinish.finish.price * percentageDecimal * projectFinish.quantity);
      }, 0);

      const sheetGoodsCost = parent.projectSheetGoods.reduce(
        (total: number, projectSheetGood: any) => {
          return total + projectSheetGood.sheetGood.price * projectSheetGood.quantity;
        },
        0
      );

      const consumableCost = parent.projectConsumables.reduce(
        (total: number, projectConsumable: any) => {
          const unitPrice = projectConsumable.consumable.price / projectConsumable.consumable.packageQuantity;
          return total + projectConsumable.quantity * unitPrice;
        },
        0
      );

      return materialCost + finishCost + sheetGoodsCost + consumableCost + parent.laborCost + parent.miscCost;
    },
  },

  Board: {
    boardFeet: (parent: any) => {
      return calculateBoardFeet(parent.width, parent.thickness, parent.length, parent.quantity);
    },
  },

  ProjectFinish: {
    finish: (parent: any) => parent.finish,
    finishId: (parent: any) => parent.finishId,
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
      if (!parent.projectFinishes || parent.projectFinishes.length === 0) return 0;
      return parent.projectFinishes.reduce((total: number, projectFinish: any) => {
        const percentageDecimal = projectFinish.percentageUsed / 100;
        return total + ((projectFinish.finish?.price || 0) * percentageDecimal * projectFinish.quantity);
      }, 0);
    },

    sheetGoodsCost: (parent: any) => {
      if (!parent.projectSheetGoods || parent.projectSheetGoods.length === 0) return 0;
      return parent.projectSheetGoods.reduce((total: number, projectSheetGood: any) => {
        return total + (projectSheetGood.sheetGood?.price || 0) * projectSheetGood.quantity;
      }, 0);
    },

    consumableCost: (parent: any) => {
      if (!parent.projectConsumables || parent.projectConsumables.length === 0) return 0;
      return parent.projectConsumables.reduce((total: number, projectConsumable: any) => {
        const unitPrice = (projectConsumable.consumable?.price || 0) / (projectConsumable.consumable?.packageQuantity || 1);
        return total + projectConsumable.quantity * unitPrice;
      }, 0);
    },

    totalCost: (parent: any) => {
      const boards = parent.boards || [];
      const projectFinishes = parent.projectFinishes || [];
      const projectSheetGoods = parent.projectSheetGoods || [];
      const projectConsumables = parent.projectConsumables || [];

      const materialCost = boards.reduce((total: number, board: any) => {
        const boardFeet = calculateBoardFeet(
          board.width,
          board.thickness,
          board.length,
          board.quantity
        );
        return total + boardFeet * (board.lumber?.costPerBoardFoot || 0);
      }, 0);

      const finishCost = projectFinishes.reduce((total: number, projectFinish: any) => {
        const percentageDecimal = projectFinish.percentageUsed / 100;
        return total + ((projectFinish.finish?.price || 0) * percentageDecimal * projectFinish.quantity);
      }, 0);

      const sheetGoodsCost = projectSheetGoods.reduce((total: number, projectSheetGood: any) => {
        return total + (projectSheetGood.sheetGood?.price || 0) * projectSheetGood.quantity;
      }, 0);

      const consumableCost = projectConsumables.reduce((total: number, projectConsumable: any) => {
        const unitPrice = (projectConsumable.consumable?.price || 0) / (projectConsumable.consumable?.packageQuantity || 1);
        return total + projectConsumable.quantity * unitPrice;
      }, 0);

      return (
        materialCost +
        finishCost +
        sheetGoodsCost +
        consumableCost +
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

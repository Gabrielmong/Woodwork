import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth';

const prisma = new PrismaClient();

// Helper function to calculate board feet
const calculateBoardFeet = (
  width: number,
  thickness: number,
  length: number,
  quantity: number
): number => {
  const lengthInInches = length * 33; // 1 vara = 33 inches
  return ((width * thickness * lengthInInches) / 144) * quantity;
};

export const dashboardResolvers = {
  Query: {
    dashboardStats: async (_: any, __: any, context: any) => {
      const user = requireAuth(context);

      // Get all active projects with their boards and finishes
      // Active projects are those that are not deleted and not completed
      const projects = await prisma.project.findMany({
        where: {
          userId: user.userId,
          isDeleted: false,
          status: {
            not: 'COMPLETED',
          },
        },
        include: {
          boards: {
            include: {
              lumber: true,
            },
          },
          finishes: true,
        },
      });

      // Get counts
      const totalProjects = projects.length;
      const totalLumber = await prisma.lumber.count({
        where: {
          userId: user.userId,
          isDeleted: false,
        },
      });
      const totalFinishes = await prisma.finish.count({
        where: {
          userId: user.userId,
          isDeleted: false,
        },
      });
      const totalSheetGoods = await prisma.sheetGood.count({
        where: {
          userId: user.userId,
          isDeleted: false,
        },
      });
      const totalTools = await prisma.tool.count({
        where: {
          userId: user.userId,
          isDeleted: false,
        },
      });

      // Get all active tools to calculate total value
      const tools = await prisma.tool.findMany({
        where: {
          userId: user.userId,
          isDeleted: false,
        },
      });

      // Calculate total tools value
      const totalToolsValue = tools.reduce((total, tool) => {
        return total + tool.price;
      }, 0);

      // Calculate total board feet and total project cost
      let totalBoardFeet = 0;
      let totalProjectCost = 0;
      let totalProfit = 0;

      projects.forEach((project) => {
        // Calculate material cost
        const materialCost = project.boards.reduce((total, board) => {
          const boardFeet = calculateBoardFeet(
            board.width,
            board.thickness,
            board.length,
            board.quantity
          );
          totalBoardFeet += boardFeet;
          return total + boardFeet * board.lumber.costPerBoardFoot;
        }, 0);

        // Calculate finish cost
        const finishCost = project.finishes.reduce((total, finish) => {
          return total + finish.price;
        }, 0);

        totalProjectCost += materialCost + finishCost + project.laborCost + project.miscCost;

        totalProfit += project.laborCost;
      });

      const avgCostPerBF = totalBoardFeet > 0 ? totalProjectCost / totalBoardFeet : 0;

      return {
        totalProjects,
        totalLumber,
        totalFinishes,
        totalSheetGoods,
        totalTools,
        totalProjectCost,
        totalBoardFeet,
        totalProfit,
        avgCostPerBF,
        totalToolsValue,
      };
    },
  },
};

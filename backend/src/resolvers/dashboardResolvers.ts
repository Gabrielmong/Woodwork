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
      const allProjects = await prisma.project.findMany({
        where: {
          userId: user.userId,
          isDeleted: false,
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
        },
      });

      const notActive = ['COMPLETED', 'PRICE'];

      // Filter out completed projects
      const projects = allProjects.filter((project) => !notActive.includes(project.status));

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
      const totalConsumables = await prisma.consumable.count({
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

      allProjects.forEach((project) => {
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

        // Calculate finish cost (with percentage)
        const finishCost = project.projectFinishes.reduce((total, projectFinish) => {
          const percentageDecimal = projectFinish.percentageUsed / 100;
          return total + projectFinish.finish.price * percentageDecimal;
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
        totalConsumables,
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

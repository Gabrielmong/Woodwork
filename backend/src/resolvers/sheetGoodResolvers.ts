import { PrismaClient } from '@prisma/client';
import { requireAuth, requireOwnership } from '../middleware/auth';
import { NotFoundError } from '../utils/errors';

const prisma = new PrismaClient();

export const sheetGoodResolvers = {
  Query: {
    sheetGoods: async (
      _: any,
      { includeDeleted = false }: { includeDeleted?: boolean },
      context: any
    ) => {
      const user = requireAuth(context);

      return prisma.sheetGood.findMany({
        where: {
          userId: user.userId,
          ...(includeDeleted ? {} : { isDeleted: false }),
        },
        orderBy: { createdAt: 'desc' },
      });
    },

    sheetGood: async (_: any, { id }: { id: string }, context: any) => {
      const sheetGood = await prisma.sheetGood.findUnique({
        where: { id },
      });

      if (!sheetGood) {
        throw new NotFoundError('SheetGood not found');
      }

      requireOwnership(context, sheetGood.userId);

      return sheetGood;
    },
  },

  Mutation: {
    createSheetGood: async (_: any, { input }: any, context: any) => {
      const user = requireAuth(context);

      return prisma.sheetGood.create({
        data: {
          ...input,
          userId: user.userId,
        },
      });
    },

    updateSheetGood: async (_: any, { id, input }: any, context: any) => {
      const sheetGood = await prisma.sheetGood.findUnique({
        where: { id },
      });

      if (!sheetGood) {
        throw new NotFoundError('SheetGood not found');
      }

      requireOwnership(context, sheetGood.userId);

      return prisma.sheetGood.update({
        where: { id },
        data: input,
      });
    },

    deleteSheetGood: async (_: any, { id }: { id: string }, context: any) => {
      const sheetGood = await prisma.sheetGood.findUnique({
        where: { id },
      });

      if (!sheetGood) {
        throw new NotFoundError('SheetGood not found');
      }

      requireOwnership(context, sheetGood.userId);

      return prisma.sheetGood.update({
        where: { id },
        data: { isDeleted: true },
      });
    },

    restoreSheetGood: async (_: any, { id }: { id: string }, context: any) => {
      const sheetGood = await prisma.sheetGood.findUnique({
        where: { id },
      });

      if (!sheetGood) {
        throw new NotFoundError('SheetGood not found');
      }

      requireOwnership(context, sheetGood.userId);

      return prisma.sheetGood.update({
        where: { id },
        data: { isDeleted: false },
      });
    },

    hardDeleteSheetGood: async (_: any, { id }: { id: string }, context: any) => {
      const sheetGood = await prisma.sheetGood.findUnique({
        where: { id },
      });

      if (!sheetGood) {
        throw new NotFoundError('SheetGood not found');
      }

      requireOwnership(context, sheetGood.userId);

      await prisma.sheetGood.delete({
        where: { id },
      });
      return true;
    },
  },
};

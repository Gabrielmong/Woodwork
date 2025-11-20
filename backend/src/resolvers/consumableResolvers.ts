import { PrismaClient } from '@prisma/client';
import { requireAuth, requireOwnership } from '../middleware/auth';
import { NotFoundError } from '../utils/errors';

const prisma = new PrismaClient();

export const consumableResolvers = {
  Query: {
    consumables: async (
      _: any,
      { includeDeleted = false }: { includeDeleted?: boolean },
      context: any
    ) => {
      const user = requireAuth(context);

      return prisma.consumable.findMany({
        where: {
          userId: user.userId,
          ...(includeDeleted ? {} : { isDeleted: false }),
        },
        orderBy: { createdAt: 'desc' },
      });
    },

    consumable: async (_: any, { id }: { id: string }, context: any) => {
      const consumable = await prisma.consumable.findUnique({
        where: { id },
      });

      if (!consumable) {
        throw new NotFoundError('Consumable not found');
      }

      requireOwnership(context, consumable.userId);

      return consumable;
    },
  },

  Mutation: {
    createConsumable: async (_: any, { input }: any, context: any) => {
      const user = requireAuth(context);

      return prisma.consumable.create({
        data: {
          ...input,
          userId: user.userId,
        },
      });
    },

    updateConsumable: async (_: any, { id, input }: any, context: any) => {
      const consumable = await prisma.consumable.findUnique({
        where: { id },
      });

      if (!consumable) {
        throw new NotFoundError('Consumable not found');
      }

      requireOwnership(context, consumable.userId);

      return prisma.consumable.update({
        where: { id },
        data: input,
      });
    },

    deleteConsumable: async (_: any, { id }: { id: string }, context: any) => {
      const consumable = await prisma.consumable.findUnique({
        where: { id },
      });

      if (!consumable) {
        throw new NotFoundError('Consumable not found');
      }

      requireOwnership(context, consumable.userId);

      return prisma.consumable.update({
        where: { id },
        data: { isDeleted: true },
      });
    },

    restoreConsumable: async (_: any, { id }: { id: string }, context: any) => {
      const consumable = await prisma.consumable.findUnique({
        where: { id },
      });

      if (!consumable) {
        throw new NotFoundError('Consumable not found');
      }

      requireOwnership(context, consumable.userId);

      return prisma.consumable.update({
        where: { id },
        data: { isDeleted: false },
      });
    },

    hardDeleteConsumable: async (_: any, { id }: { id: string }, context: any) => {
      const consumable = await prisma.consumable.findUnique({
        where: { id },
      });

      if (!consumable) {
        throw new NotFoundError('Consumable not found');
      }

      requireOwnership(context, consumable.userId);

      await prisma.consumable.delete({
        where: { id },
      });
      return true;
    },
  },

  Consumable: {
    unitPrice: (parent: any) => {
      return parent.price / parent.packageQuantity;
    },
  },
};

import { PrismaClient } from '@prisma/client';
import { requireOwnership } from '../middleware/auth';
import { NotFoundError } from '../utils/errors';

const prisma = new PrismaClient();

export const cutListResolvers = {
  Query: {
    cutLists: async (_: any, { projectId }: { projectId: string }, context: any) => {
      // Verify user owns the project
      const project = await prisma.project.findUnique({
        where: { id: projectId },
      });
      if (!project) throw new NotFoundError('Project not found');
      requireOwnership(context, project.userId);

      return prisma.cutList.findMany({
        where: { projectId },
        orderBy: [{ isCompleted: 'asc' }, { createdAt: 'desc' }],
      });
    },

    cutList: async (_: any, { id }: { id: string }, context: any) => {
      const cutList = await prisma.cutList.findUnique({
        where: { id },
        include: { project: true },
      });

      if (!cutList) throw new NotFoundError('Cut list item not found');
      requireOwnership(context, cutList.project.userId);

      return cutList;
    },
  },

  Mutation: {
    createCutList: async (_: any, { input }: any, context: any) => {
      // Verify user owns the project
      const project = await prisma.project.findUnique({
        where: { id: input.projectId },
      });
      if (!project) throw new NotFoundError('Project not found');
      requireOwnership(context, project.userId);

      return prisma.cutList.create({
        data: {
          width: input.width,
          thickness: input.thickness,
          length: input.length,
          quantity: input.quantity,
          description: input.description,
          projectId: input.projectId,
        },
      });
    },

    updateCutList: async (_: any, { id, input }: any, context: any) => {
      const cutList = await prisma.cutList.findUnique({
        where: { id },
        include: { project: true },
      });

      if (!cutList) throw new NotFoundError('Cut list item not found');
      requireOwnership(context, cutList.project.userId);

      return prisma.cutList.update({
        where: { id },
        data: {
          ...(input.width !== undefined && { width: input.width }),
          ...(input.thickness !== undefined && { thickness: input.thickness }),
          ...(input.length !== undefined && { length: input.length }),
          ...(input.quantity !== undefined && { quantity: input.quantity }),
          ...(input.description !== undefined && { description: input.description }),
          ...(input.isCompleted !== undefined && { isCompleted: input.isCompleted }),
        },
      });
    },

    deleteCutList: async (_: any, { id }: { id: string }, context: any) => {
      const cutList = await prisma.cutList.findUnique({
        where: { id },
        include: { project: true },
      });

      if (!cutList) throw new NotFoundError('Cut list item not found');
      requireOwnership(context, cutList.project.userId);

      await prisma.cutList.delete({ where: { id } });
      return true;
    },

    toggleCutListComplete: async (_: any, { id }: { id: string }, context: any) => {
      const cutList = await prisma.cutList.findUnique({
        where: { id },
        include: { project: true },
      });

      if (!cutList) throw new NotFoundError('Cut list item not found');
      requireOwnership(context, cutList.project.userId);

      return prisma.cutList.update({
        where: { id },
        data: { isCompleted: !cutList.isCompleted },
      });
    },
  },
};

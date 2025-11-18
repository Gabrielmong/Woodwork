import { GraphQLScalarType, Kind } from 'graphql';
import { userResolvers } from './userResolvers';
import { lumberResolvers } from './lumberResolvers';
import { finishResolvers } from './finishResolvers';
import { sheetGoodResolvers } from './sheetGoodResolvers';
import { toolResolvers } from './toolResolvers';
import { projectResolvers } from './projectResolvers';
import { settingsResolvers } from './settingsResolvers';
import { dashboardResolvers } from './dashboardResolvers';

// Custom DateTime scalar
const dateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'DateTime custom scalar type',
  serialize(value: any) {
    if (value instanceof Date) {
      return value.toISOString();
    }
    throw Error('GraphQL DateTime Scalar serializer expected a `Date` object');
  },
  parseValue(value: any) {
    if (typeof value === 'string') {
      return new Date(value);
    }
    throw new Error('GraphQL DateTime Scalar parser expected a `string`');
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  },
});

// Merge all resolvers
export const resolvers = {
  DateTime: dateTimeScalar,

  Query: {
    ...userResolvers.Query,
    ...lumberResolvers.Query,
    ...finishResolvers.Query,
    ...sheetGoodResolvers.Query,
    ...toolResolvers.Query,
    ...projectResolvers.Query,
    ...settingsResolvers.Query,
    ...dashboardResolvers.Query,
  },

  Mutation: {
    ...userResolvers.Mutation,
    ...lumberResolvers.Mutation,
    ...finishResolvers.Mutation,
    ...sheetGoodResolvers.Mutation,
    ...toolResolvers.Mutation,
    ...projectResolvers.Mutation,
    ...settingsResolvers.Mutation,
  },

  // Field resolvers
  Project: projectResolvers.Project,
  Board: projectResolvers.Board,
  SharedProject: projectResolvers.SharedProject,
};

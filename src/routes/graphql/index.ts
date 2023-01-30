import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { FastifyInstance } from 'fastify';
import { graphqlBodySchema } from './schema';
import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLList,
  GraphQLID,
} from 'graphql';
import { graphUser } from './types/user';
import { graphProfile } from './types/profile';
import { graphPost } from './types/post';
import { graphMemberType } from './types/memberType';

const querySchema = new GraphQLObjectType({
  name: 'Query',
  fields: {
    users: {
      type: new GraphQLList(graphUser),
      resolve: async (source: any, args: unknown, fastify: FastifyInstance) =>
        await fastify.db.users.findMany(),
    },
    user: {
      type: graphUser,
      args: {
        id: { type: GraphQLID },
      },
      resolve: async (_: any, args: any, fastify: FastifyInstance) =>
        fastify.db.users.findOne({
          key: 'id',
          equals: args.id,
        }),
    },
    profiles: {
      type: new GraphQLList(graphProfile),
      resolve: async (_: any, args: any, fastify: FastifyInstance) =>
        await fastify.db.profiles.findMany(),
    },
    profile: {
      type: graphProfile,
      args: {
        id: { type: GraphQLID },
      },
      resolve: async (_: any, args: any, fastify: FastifyInstance) =>
        await fastify.db.profiles.findOne({ key: 'id', equals: args.id }),
    },
    posts: {
      type: new GraphQLList(graphPost),
      resolve: async (_: any, args: any, fastify: FastifyInstance) =>
        await fastify.db.posts.findMany(),
    },
    post: {
      type: graphPost,
      args: {
        id: { type: GraphQLID },
      },
      resolve: async (_: any, args: any, fastify: FastifyInstance) =>
        await fastify.db.posts.findOne({ key: 'id', equals: args.id }),
    },
    memberTypes: {
      type: new GraphQLList(graphMemberType),
      resolve: async (_: any, args: any, fastify: FastifyInstance) =>
        await fastify.db.memberTypes.findMany(),
    },
    memberType: {
      type: graphMemberType,
      args: {
        id: { type: GraphQLID },
      },
      resolve: async (_: any, args: any, fastify: FastifyInstance) =>
        await fastify.db.memberTypes.findOne({ key: 'id', equals: args.id }),
    },
  },
});

const schema = new GraphQLSchema({
  query: querySchema,
});

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.post(
    '/',
    {
      schema: {
        body: graphqlBodySchema,
      },
    },
    async function (request, reply) {
      const { query, variables } = request.body;

      return await graphql({
        schema,
        source: String(query),
        variableValues: variables,
        contextValue: fastify,
      });
    }
  );
};

export default plugin;

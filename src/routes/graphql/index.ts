import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { FastifyInstance } from 'fastify';
import { graphqlBodySchema } from './schema';
import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLList,
  GraphQLID,
  GraphQLNonNull,
} from 'graphql';
import { graphUser } from './types/user';
import { graphProfile } from './types/profile';
import { graphPost } from './types/post';
import { graphMemberType } from './types/memberType';
import { createUserInput } from './types/createUserInput';
import { createProfileInput } from './types/createProfileInput';
import { createPostnput } from './types/createPostnput';

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

const mutationSchema = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    createUser: {
      type: graphUser,
      args: {
        data: {
          type: new GraphQLNonNull(createUserInput),
        },
      },
      resolve: async (_: any, args: any, fastify: FastifyInstance) => {
        const user = await fastify.db.users.create(args.data);

        return user;
      },
    },
    createProfile: {
      type: graphProfile,
      args: {
        data: {
          type: new GraphQLNonNull(createProfileInput),
        },
      },
      resolve: async (_: any, args: any, fastify: FastifyInstance) => {
        const { userId, memberTypeId } = args.data;

        const user = await fastify.db.users.findOne({
          key: 'id',
          equals: userId,
        });

        if (user === null) {
          throw fastify.httpErrors.badRequest('No user');
        }

        const profileByUserId = await fastify.db.profiles.findOne({
          key: 'userId',
          equals: userId,
        });

        if (profileByUserId !== null) {
          throw fastify.httpErrors.badRequest('Profile exists');
        }

        const memberType = await fastify.db.memberTypes.findOne({
          key: 'id',
          equals: memberTypeId,
        });

        if (memberType === null) {
          throw fastify.httpErrors.badRequest('No member type');
        }

        const profile = await fastify.db.profiles.create(args.data);

        return profile;
      },
    },
    createPost: {
      type: graphPost,
      args: {
        data: {
          type: new GraphQLNonNull(createPostnput),
        },
      },
      resolve: async (_: any, args: any, fastify: FastifyInstance) => {
        const { userId } = args.data;

        const user = await fastify.db.users.findOne({
          key: 'id',
          equals: userId,
        });

        if (user === null) {
          throw fastify.httpErrors.badRequest('No User');
        }

        const post = await fastify.db.posts.create(args.data);

        return post;
      },
    },
  },
});

const schema = new GraphQLSchema({
  query: querySchema,
  mutation: mutationSchema,
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

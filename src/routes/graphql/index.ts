import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { FastifyInstance } from 'fastify';
import * as depthLimit from 'graphql-depth-limit';
import { graphqlBodySchema } from './schema';
import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLList,
  GraphQLID,
  GraphQLNonNull,
  parse,
  validate,
} from 'graphql';
import { graphUser } from './types/user';
import { graphProfile } from './types/profile';
import { graphPost } from './types/post';
import { graphMemberType } from './types/memberType';
import { createUserInput } from './types/createUserInput';
import { createProfileInput } from './types/createProfileInput';
import { createPostnput } from './types/createPostnput';
import { updateUserInput } from './types/updateUserInput';
import { updateProfileInput } from './types/updateProfileInput';
import { updatePostInput } from './types/updatePostInput';
import { updateMemberTypeInput } from './types/updateMemberTypeInput';
import { subscribeToUserInput } from './types/subscribeToUserInput';
import { unsubscribeFromUserInput } from './types/unsubscribeFromUserInput';

const DEPTH_LIMIT = 6;

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
    updateUser: {
      type: graphUser,
      args: {
        userId: { type: GraphQLID },
        data: {
          type: updateUserInput,
        },
      },
      resolve: async (_: any, args: any, fastify: FastifyInstance) => {
        const id = args.userId;

        const user = await fastify.db.users.findOne({ key: 'id', equals: id });

        if (user === null) {
          throw fastify.httpErrors.notFound('No User');
        }

        const changedUser = await fastify.db.users.change(id, args.data);

        return changedUser;
      },
    },
    updateProfile: {
      type: graphProfile,
      args: {
        profileId: { type: GraphQLID },
        data: {
          type: updateProfileInput,
        },
      },
      resolve: async (_: any, args: any, fastify: FastifyInstance) => {
        const { userId } = args.data;

        const user = await fastify.db.users.findOne({
          key: 'id',
          equals: userId,
        });

        if (user === null) {
          throw fastify.httpErrors.notFound('No User with such user ID');
        }

        const profile = await fastify.db.profiles.findOne({
          key: 'id',
          equals: args.profileId,
        });

        if (profile === null) {
          throw fastify.httpErrors.notFound('No Profile');
        }

        const updatedProfile = await fastify.db.profiles.change(
          args.profileId,
          args.data
        );

        return updatedProfile;
      },
    },
    updatePost: {
      type: graphPost,
      args: {
        postId: { type: GraphQLID },
        data: {
          type: updatePostInput,
        },
      },
      resolve: async (_: any, args: any, fastify: FastifyInstance) => {
        const { userId } = args.data;

        const user = await fastify.db.users.findOne({
          key: 'id',
          equals: userId,
        });

        if (user === null) {
          throw fastify.httpErrors.notFound('No User with such user ID');
        }

        const post = await fastify.db.posts.findOne({
          key: 'id',
          equals: args.postId,
        });

        if (post === null) {
          throw fastify.httpErrors.notFound('No Post');
        }

        const changedPost = await fastify.db.posts.change(
          args.postId,
          args.data
        );

        return changedPost;
      },
    },
    updateMemberType: {
      type: graphMemberType,
      args: {
        memberTypeId: { type: GraphQLID },
        data: {
          type: updateMemberTypeInput,
        },
      },
      resolve: async (_: any, args: any, fastify: FastifyInstance) => {
        const memberType = await fastify.db.memberTypes.findOne({
          key: 'id',
          equals: args.memberTypeId,
        });

        if (memberType === null) {
          throw fastify.httpErrors.badRequest('No Member type');
        }

        const updatedMemberType = await fastify.db.memberTypes.change(
          args.memberTypeId,
          args.data
        );

        return updatedMemberType;
      },
    },
    subscribeToUser: {
      type: graphUser,
      args: {
        data: { type: subscribeToUserInput },
      },
      resolve: async (_: any, args: any, fastify: FastifyInstance) => {
        const { currentUserId, subscribeToUserId } = args.data;

        const currentUser = await fastify.db.users.findOne({
          key: 'id',
          equals: currentUserId,
        });

        if (currentUser === null) {
          throw fastify.httpErrors.notFound('NO Current user');
        }

        const userToSubscribe = await fastify.db.users.findOne({
          key: 'id',
          equals: subscribeToUserId,
        });

        if (userToSubscribe === null) {
          throw fastify.httpErrors.notFound('No User to subscribe');
        }

        if (userToSubscribe.subscribedToUserIds.includes(currentUserId)) {
          throw fastify.httpErrors.badRequest('User already subscribed');
        }

        userToSubscribe.subscribedToUserIds.push(currentUserId);

        const updatedSubscribee = await fastify.db.users.change(
          subscribeToUserId,
          userToSubscribe
        );

        return updatedSubscribee;
      },
    },
    unsubscribeFromUser: {
      type: graphUser,
      args: {
        data: { type: unsubscribeFromUserInput },
      },
      resolve: async (_: any, args: any, fastify: FastifyInstance) => {
        const { currentUserId, unsubscribeFromUserId } = args.data;

        const userUnsubscribeFrom = await fastify.db.users.findOne({
          key: 'id',
          equals: unsubscribeFromUserId,
        });

        if (userUnsubscribeFrom === null) {
          throw fastify.httpErrors.notFound('No User to unsubscribe');
        }

        const currentUser = await fastify.db.users.findOne({
          key: 'id',
          equals: currentUserId,
        });

        if (currentUser === null) {
          throw fastify.httpErrors.notFound('No Current user');
        }

        if (!userUnsubscribeFrom.subscribedToUserIds.includes(currentUserId)) {
          throw fastify.httpErrors.badRequest('User not subscribed');
        }

        const subscribedToUserIds =
          userUnsubscribeFrom.subscribedToUserIds.filter(
            (subscribedToUserId) => subscribedToUserId !== currentUser.id
          );

        const updatedUser = await fastify.db.users.change(
          unsubscribeFromUserId,
          { subscribedToUserIds }
        );

        return updatedUser;
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
      const queryAsString = String(query);

      const errors = validate(schema, parse(queryAsString), [
        depthLimit(DEPTH_LIMIT),
      ]);

      if (errors.length > 0) {
        const errorResponse = {
          errors,
          data: null,
        };

        return errorResponse;
      }

      return await graphql({
        schema,
        source: queryAsString,
        variableValues: variables,
        contextValue: fastify,
      });
    }
  );
};

export default plugin;

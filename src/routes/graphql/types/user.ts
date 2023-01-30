import {
  GraphQLID,
  GraphQLList,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLString,
} from 'graphql';
import { UserEntity } from '../../../utils/DB/entities/DBUsers';
import { graphPost } from './post';
import { graphProfile } from './profile';
import { graphMemberType } from './memberType';

const graphUser: GraphQLOutputType = new GraphQLObjectType({
  name: 'GraphUser',
  fields: () => ({
    id: { type: GraphQLID },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
    subscribedToUserIds: { type: new GraphQLList(GraphQLString) },
    userSubscribedTo: {
      type: new GraphQLList(graphUser),
      resolve: async (source: UserEntity, args: unknown, { fastify }) =>
        await fastify.db.users.findMany({
          key: 'subscribedToUserIds',
          inArray: source.id,
        }),
    },
    subscribedToUser: {
      type: new GraphQLList(graphUser),
      resolve: async (source: UserEntity, args: unknown, { fastify }) => {
        const { subscribedToUserIds } = source;
        const subscribedToUser = subscribedToUserIds.map(
          async (subscriberId: string) => {
            const subscribed = await fastify.db.users.findOne({
              key: 'id',
              equals: subscriberId,
            });

            return subscribed;
          }
        );

        return subscribedToUser;
      },
    },
    profile: {
      type: graphProfile,
      resolve: async (source: UserEntity, args: unknown, { fastify }) =>
        await fastify.db.profiles.findOne({
          key: 'userId',
          equals: source.id,
        }),
    },
    posts: {
      type: new GraphQLList(graphPost),
      resolve: async (source: UserEntity, args: unknown, { fastify }) =>
        await fastify.db.posts.findMany({
          key: 'userId',
          equals: source.id,
        }),
    },
    memberType: {
      type: graphMemberType,
      resolve: async (source: UserEntity, args: unknown, { fastify }) => {
        const profile = await fastify.db.profiles.findOne({
          key: 'userId',
          equals: source.id,
        });

        if (!profile) {
          return null;
        }

        return await fastify.db.memberTypes.findOne({
          key: 'id',
          equals: profile.memberTypeId,
        });
      },
    },
  }),
});

export { graphUser };

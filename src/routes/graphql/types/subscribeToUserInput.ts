import { GraphQLInputObjectType, GraphQLNonNull, GraphQLID } from 'graphql';

const subscribeToUserInput = new GraphQLInputObjectType({
  name: 'SubscribeToUserInput',
  fields: () => ({
    currentUserId: { type: new GraphQLNonNull(GraphQLID) },
    subscribeToUserId: { type: new GraphQLNonNull(GraphQLID) },
  }),
});

export { subscribeToUserInput };

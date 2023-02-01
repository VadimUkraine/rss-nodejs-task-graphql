import { GraphQLInputObjectType, GraphQLNonNull, GraphQLID } from 'graphql';

const unsubscribeFromUserInput = new GraphQLInputObjectType({
  name: 'UnsubscribeFromUserInput',
  fields: () => ({
    currentUserId: { type: new GraphQLNonNull(GraphQLID) },
    unsubscribeFromUserId: { type: new GraphQLNonNull(GraphQLID) },
  }),
});

export { unsubscribeFromUserInput };

import { GraphQLInputObjectType, GraphQLString } from 'graphql/type';
import { GraphQLInputType } from 'graphql/type/definition';

const updateUserInput: GraphQLInputType = new GraphQLInputObjectType({
  name: 'UpdateUserInput',
  fields: () => ({
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
  }),
});

export { updateUserInput };

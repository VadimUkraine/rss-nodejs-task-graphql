import {
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLString,
} from 'graphql/type';
import { GraphQLInputType } from 'graphql/type/definition';

const createUserInput: GraphQLInputType = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: () => ({
    firstName: { type: new GraphQLNonNull(GraphQLString) },
    lastName: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
  }),
});

export { createUserInput };

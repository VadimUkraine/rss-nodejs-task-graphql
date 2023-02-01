import { GraphQLID, GraphQLInputObjectType, GraphQLString } from 'graphql/type';
import { GraphQLInputType } from 'graphql/type/definition';

const updatePostInput: GraphQLInputType = new GraphQLInputObjectType({
  name: 'UpdatePostInput',
  fields: () => ({
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    userId: { type: GraphQLID },
  }),
});

export { updatePostInput };

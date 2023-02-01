import { GraphQLInputObjectType, GraphQLInt } from 'graphql/type';
import { GraphQLInputType } from 'graphql/type/definition';

const updateMemberTypeInput: GraphQLInputType = new GraphQLInputObjectType({
  name: 'UpdateMemberTypeInput',
  fields: () => ({
    discount: { type: GraphQLInt },
    monthPostsLimit: { type: GraphQLInt },
  }),
});

export { updateMemberTypeInput };

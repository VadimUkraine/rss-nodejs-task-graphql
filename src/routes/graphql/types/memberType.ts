import { GraphQLID, GraphQLObjectType, GraphQLInt } from 'graphql/type';

const graphMemberType = new GraphQLObjectType({
  name: 'GraphMemberType',
  fields: () => ({
    id: { type: GraphQLID },
    discount: { type: GraphQLInt },
    monthPostsLimit: { type: GraphQLInt },
  }),
});

export { graphMemberType };

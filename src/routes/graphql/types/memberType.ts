import { GraphQLID, GraphQLObjectType, GraphQLString } from 'graphql/type';

const graphMemberType = new GraphQLObjectType({
  name: 'GraphMemberType',
  fields: () => ({
    id: { type: GraphQLID },
    discount: { type: GraphQLString },
    monthPostsLimit: { type: GraphQLString },
  }),
});

export { graphMemberType };

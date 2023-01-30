import { GraphQLID, GraphQLObjectType, GraphQLString } from 'graphql/type';

const graphPost = new GraphQLObjectType({
  name: 'GraphPost',
  fields: () => ({
    id: { type: GraphQLID },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    userId: { type: GraphQLID },
  }),
});

export { graphPost };

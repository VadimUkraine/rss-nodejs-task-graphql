import { GraphQLID, GraphQLObjectType, GraphQLString } from 'graphql/type';

const graphProfile = new GraphQLObjectType({
  name: 'GraphProfile',
  fields: () => ({
    id: { type: GraphQLID },
    avatar: { type: GraphQLString },
    sex: { type: GraphQLString },
    birthday: { type: GraphQLString },
    country: { type: GraphQLString },
    street: { type: GraphQLString },
    city: { type: GraphQLString },
    memberTypeId: { type: GraphQLString },
    userId: { type: GraphQLID },
  }),
});

export { graphProfile };

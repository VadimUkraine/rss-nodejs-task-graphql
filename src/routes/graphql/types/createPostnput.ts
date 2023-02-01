import {
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLString,
} from 'graphql/type';
import { GraphQLInputType } from 'graphql/type/definition';

const createPostnput: GraphQLInputType = new GraphQLInputObjectType({
  name: 'CreatePostnput',
  fields: () => ({
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
    userId: { type: new GraphQLNonNull(GraphQLID) },
  }),
});

export { createPostnput };

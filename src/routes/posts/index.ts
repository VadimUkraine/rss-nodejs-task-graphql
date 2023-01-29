import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createPostBodySchema, changePostBodySchema } from './schema';
import type { PostEntity } from '../../utils/DB/entities/DBPosts';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<PostEntity[]> {
    const posts = await fastify.db.posts.findMany();

    return reply.send(posts);
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const { id } = request.params;

      if (!id) {
        reply.badRequest();
      }

      try {
        const post = await fastify.db.posts.findOne({
          key: 'id',
          equals: id,
        });

        if (!post) {
          reply.notFound();
        }

        return reply.send(post);
      } catch (error) {
        return reply.status(400).send({ message: (error as Error).message });
      }
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createPostBodySchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const post = request.body;

      if (!post) {
        reply.badRequest();
      }

      try {
        const newPost = await fastify.db.posts.create(post);

        if (!newPost) {
          reply.notFound();
        }

        return reply.status(201).send(newPost);
      } catch (error) {
        return reply.status(400).send({ message: (error as Error).message });
      }
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const { id } = request.params;

      if (!id) {
        reply.badRequest();
      }

      try {
        const deletedPost = await fastify.db.posts.delete(id);

        if (!deletedPost) {
          reply.notFound();
        }

        return reply.send(deletedPost);
      } catch (error) {
        return reply.status(400).send({ message: (error as Error).message });
      }
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changePostBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const { id } = request.params;
      const updatedFields = request.body;

      if (!id || !updatedFields) {
        reply.badRequest();
      }

      const post = await fastify.db.posts.findOne({
        key: 'id',
        equals: id,
      });

      if (!post) {
        reply.badRequest();
      }

      try {
        const updatedPost = {
          ...post,
          content: updatedFields.content ?? post?.content,
          title: updatedFields.title ?? post?.title,
        };

        await fastify.db.posts.change(id, updatedPost);

        return reply.send(updatedPost);
      } catch (error) {
        return reply.status(400).send({ message: (error as Error).message });
      }
    }
  );
};

export default plugin;

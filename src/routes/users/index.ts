import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import {
  createUserBodySchema,
  changeUserBodySchema,
  subscribeBodySchema,
} from './schemas';
import type { UserEntity } from '../../utils/DB/entities/DBUsers';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<UserEntity[]> {
    const users = await fastify.db.users.findMany();

    return reply.send(users);
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const { id } = request.params;

      if (!id) {
        reply.badRequest();
      }

      const user = await fastify.db.users.findOne({
        key: 'id',
        equals: id,
      });

      if (!user) {
        reply.notFound();
      }

      return reply.send(user);
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createUserBodySchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const rawNewUser = request.body;

      if (!rawNewUser) {
        reply.badRequest();
      }

      const newUser = await fastify.db.users.create(rawNewUser);

      if (!newUser) {
        reply.badRequest();
      }

      return reply.status(201).send(newUser);
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const { id } = request.params;

      if (!id) {
        reply.badRequest();
      }

      const existedUser = await fastify.db.users.findOne({
        key: 'id',
        equals: id,
      });

      if (!existedUser) {
        reply.badRequest();
      }

      const deletedUser = await fastify.db.users.delete(id);

      if (!deletedUser) {
        reply.notFound();
      }

      try {
        const profile = await fastify.db.profiles.findOne({
          key: 'userId',
          equals: deletedUser.id,
        });

        const posts = await fastify.db.posts.findMany({
          key: 'userId',
          equals: deletedUser.id,
        });

        const followers = await fastify.db.users.findMany({
          key: 'subscribedToUserIds',
          inArray: deletedUser.id,
        });

        if (profile) {
          await fastify.db.profiles.delete(profile.id);
        }

        posts.forEach(async (post) => await fastify.db.posts.delete(post.id));

        followers.forEach(
          async (follower) =>
            await fastify.db.users.change(follower.id, {
              subscribedToUserIds: follower.subscribedToUserIds.filter(
                (id) => id !== deletedUser.id
              ),
            })
        );

        return reply.send(deletedUser);
      } catch (error) {
        return reply.status(400).send({ message: (error as Error).message });
      }
    }
  );

  fastify.post(
    '/:id/subscribeTo',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const { id } = request.params;
      const { userId } = request.body;

      if (!id || !userId) {
        reply.badRequest();
      }

      const subscriber = await fastify.db.users.findOne({
        key: 'id',
        equals: id,
      });

      if (!subscriber) {
        reply.notFound();
      }

      const candidate = await fastify.db.users.findOne({
        key: 'id',
        equals: userId,
      });

      if (!candidate) {
        reply.notFound();
      }

      try {
        if (candidate?.subscribedToUserIds.includes(id)) {
          reply.badRequest();
        }

        candidate?.subscribedToUserIds.push(id);

        await fastify.db.users.change(userId, candidate!);

        return reply.status(200).send(subscriber);
      } catch (error) {
        return reply.status(400).send({ message: (error as Error).message });
      }
    }
  );

  fastify.post(
    '/:id/unsubscribeFrom',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const { id } = request.params;
      const { userId } = request.body;

      if (!id || !userId) {
        reply.badRequest();
      }

      const unSubscriber = await fastify.db.users.findOne({
        key: 'id',
        equals: id,
      });

      const candidate = await fastify.db.users.findOne({
        key: 'id',
        equals: userId,
      });

      if (!unSubscriber || !candidate) {
        reply.notFound();
      }

      try {
        const indexOfFollower = unSubscriber?.subscribedToUserIds.findIndex(
          (followerId) => followerId === userId
        );

        const indexOfSubscriber = candidate?.subscribedToUserIds.findIndex(
          (subscriberId) => subscriberId === id
        );

        if (indexOfFollower === -1 || indexOfSubscriber === -1) {
          reply.badRequest();
        }

        const updatedUser = await fastify.db.users.change(id, {
          subscribedToUserIds: unSubscriber?.subscribedToUserIds.filter(
            (followerId) => followerId !== userId
          ),
        });

        await fastify.db.users.change(userId, {
          subscribedToUserIds: candidate?.subscribedToUserIds.filter(
            (subscriberId) => subscriberId !== id
          ),
        });

        return reply.status(200).send(updatedUser);
      } catch (error) {
        return reply.status(400).send({ message: (error as Error).message });
      }
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeUserBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const { id } = request.params;
      const updatedFields = request.body;

      if (!id || Object.keys(updatedFields).length < 1) {
        reply.badRequest();
      }

      const user = await fastify.db.users.findOne({
        key: 'id',
        equals: id,
      });

      if (!user) {
        reply.notFound();
      }

      const updatedUser = {
        ...user,
        email: updatedFields.email ?? user?.email,
        firstName: updatedFields.firstName ?? user?.firstName,
        lastName: updatedFields.lastName ?? user?.lastName,
      };

      try {
        await fastify.db.users.change(id, updatedUser);

        return reply.status(200).send(updatedUser);
      } catch (error) {
        return reply.status(400).send({ message: (error as Error).message });
      }
    }
  );
};

export default plugin;

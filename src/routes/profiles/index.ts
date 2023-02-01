import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createProfileBodySchema, changeProfileBodySchema } from './schema';
import type { ProfileEntity } from '../../utils/DB/entities/DBProfiles';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<ProfileEntity[]> {
    const profiles = await fastify.db.profiles.findMany();

    return reply.send(profiles);
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const { id } = request.params;

      if (!id) {
        reply.badRequest();
      }

      try {
        const profile = await fastify.db.profiles.findOne({
          key: 'id',
          equals: id,
        });

        if (!profile) {
          reply.notFound();
        }

        return reply.send(profile);
      } catch (error) {
        return reply.status(400).send({ message: (error as Error).message });
      }
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createProfileBodySchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const newProfile = request.body;

      if (!newProfile) {
        reply.badRequest();
      }

      try {
        const existingProfile = await fastify.db.profiles.findOne({
          key: 'userId',
          equals: newProfile.userId,
        });

        if (existingProfile) {
          reply.badRequest();
        }

        const memberType = await fastify.db.memberTypes.findOne({
          key: 'id',
          equals: newProfile.memberTypeId,
        });

        if (!memberType) {
          reply.badRequest();
        }

        const profile = await fastify.db.profiles.create(newProfile);

        if (!profile) {
          reply.notFound();
        }

        return reply.status(201).send(profile);
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
    async function (request, reply): Promise<ProfileEntity> {
      const { id } = request.params;

      if (!id) {
        reply.badRequest();
      }

      try {
        const deletedProfile = await fastify.db.profiles.delete(id);

        if (!deletedProfile) {
          reply.notFound();
        }

        return reply.send(deletedProfile);
      } catch (error) {
        return reply.status(400).send({ message: (error as Error).message });
      }
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeProfileBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const { id } = request.params;
      const updatedFields = request.body;

      if (!id || !updatedFields) {
        reply.badRequest();
      }

      const profile = await fastify.db.profiles.findOne({
        key: 'id',
        equals: id,
      });

      if (!profile) {
        reply.badRequest();
      }

      try {
        const updatedProfile = await fastify.db.profiles.change(
          id,
          request.body
        );

        return reply.send(updatedProfile);
      } catch (error) {
        return reply.status(400).send({ message: (error as Error).message });
      }
    }
  );
};

export default plugin;

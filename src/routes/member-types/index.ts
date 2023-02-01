import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { changeMemberTypeBodySchema } from './schema';
import type { MemberTypeEntity } from '../../utils/DB/entities/DBMemberTypes';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<
    MemberTypeEntity[]
  > {
    const memberTypes = await fastify.db.memberTypes.findMany();

    return reply.send(memberTypes);
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<MemberTypeEntity> {
      const { id } = request.params;

      if (!id) {
        reply.badRequest();
      }

      try {
        const memberType = await fastify.db.memberTypes.findOne({
          key: 'id',
          equals: id,
        });

        if (!memberType) {
          reply.notFound();
        }

        return reply.send(memberType);
      } catch (error) {
        return reply.status(400).send({ message: (error as Error).message });
      }
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeMemberTypeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<MemberTypeEntity> {
      const { id } = request.params;
      const updatedFields = request.body;

      if (!id || !updatedFields) {
        reply.badRequest();
      }

      const memberType = await fastify.db.memberTypes.findOne({
        key: 'id',
        equals: id,
      });

      if (!memberType) {
        reply.badRequest();
      }

      try {
        const updatedMemberType = {
          ...memberType,
          discount: updatedFields.discount ?? memberType?.discount,
          monthPostsLimit:
            updatedFields.monthPostsLimit ?? memberType?.monthPostsLimit,
        };

        await fastify.db.memberTypes.change(id, updatedMemberType);

        return reply.send(updatedMemberType);
      } catch (error) {
        return reply.status(400).send({ message: (error as Error).message });
      }
    }
  );
};

export default plugin;

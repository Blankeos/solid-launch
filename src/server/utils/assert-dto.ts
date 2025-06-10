import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export function assertDTO<T extends z.ZodType<any>>(data: any, schema: T): z.infer<T> {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new TRPCError({
      message: `Invalid DTO: ${JSON.stringify(result.error)}`,
      code: 'INTERNAL_SERVER_ERROR',
    });
  }

  return result.data as z.infer<T>;
}

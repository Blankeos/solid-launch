// ===========================================================================
// Kysely Client (Wraps around a DB connection via Hrana)
// - This is the preferred client for most queries.
// ===========================================================================

import { privateConfig } from '@/config.private';

import { LibsqlDialect } from '@libsql/kysely-libsql';
import { Kysely } from 'kysely';
import { DB } from './types'; // Generated by prisma.

export const db = new Kysely<DB>({
  dialect: new LibsqlDialect({
    url: privateConfig.database.URL,
    authToken: privateConfig.database.AUTH_TOKEN
  })
});

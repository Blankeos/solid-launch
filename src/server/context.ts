import { Context } from 'hono';
import { Session, User } from './db/types';

export const createContext = async (c: Context) => {
  return {
    honoContext: c,
    user: null as User | null,
    session: null as Session | null,
  };
};

/// ===========================================================================
// Extend the PageContext in Vike here.
// ===========================================================================

import { HonoRequest } from 'hono';

// Extend the PageContext in Vike.
declare global {
  // For Vike types
  namespace Vike {
    interface PageContext {
      request: HonoRequest<'*', unknown>;
      response: Response;
    }
  }
}

// If you define Vike.PageContext in a .d.ts file then
// make sure there is at least one export/import statment.
// Tell TypeScript this file isn't an ambient module:
export {};

1. Files

- Always use kebab-case.

2. Performing Queries and Mutations

- Use `import { honoClient } from '@/lib/hono-client'` for most hono api calls.
- Use useQuery, don't destructure: `const somethingQuery = useQuery(...)` is preferred over `const { data } = useQuery(...)`. Remember `create` prefix in solid-js is deprecated so always use useQuery or useMutation.
  - We also prefer `somethingQuery` and `somethingMutation` naming convention.
- `!response.ok` is handled and thrown by honoClient's internal fetch call, so no need to manually check this.
- Thrown errors have a standard output:
  - error.message will always contain a readable error message that can be rendered in toasts or UI.
  - error.cause can contain `{ data: any, error: Error }` type with `data` being any type of data that might be relevant to the operation. (Almost always not needed, but we have that option to do that)

3. Components

We use a bunch under `src/components/ui` for Shadcn (the standard location), if the UI can use that, it's preferred. With some enhancements too. i.e.

- Button has a `loading` prop.
- For link buttons, use <Button as="a" href={...}>...</Button> will work.

4. Adding Icons

Powered by iconmate (i also wrote). NOTE: Edit this based on the setup.

Adding icons via command: `iconmate add --folder=src/assets/icons --preset=svg --icon=<an iconify name i.e. mdi:heart>`

Or if you want the TUI, just use `iconmate` (but AI won't utilize this)

5. Creating backend modules.

- Almost always create 4 files in modules:
  - `server/modules/<module>` a folder
  - `server/modules/<module>/<module>.controller.ts` the controller layer
    ```ts
    const moduleService = new ModuleService();
    export const moduleController = new Hono()
      .get("/", async () => {})
      .post("/", async () => {})
      .put("/", async () => {})
      .delete("/", async () => {});
    ```
  - `server/modules/<module>/<module>.service.ts` the business logic layer
    ```ts
    export class ModuleService {
      private moduleDAO: ModuleDAO; // or more if needed
      constructor() {
        this.moduleDAO = new ModuleDAO();
      }
      async serviceFn() {}
    }
    ```
  - `server/modules/<module>/<module>.dao.ts` the data-access layer that talks to the database
    ```ts
    export class ModuleDAO {
      async getRecord() {}
      async updateRecord() {}
    }
    ```
  - `server/modules/<module>/<module>.dto.ts` shared Zod schemas for input/output validation and type inference
    Make sure to always add a type under each DTO with the same name in Pascal Case.

    ```ts
    export const recordDTO = z.object(...)
    export type RecordDTO = z.infer<typeof recordDTO>;

    export const updateRecordParamsDTO = z.object(...)
    export type UpdateRecordParamsDTO = z.infer<typeof updateRecordParamsDTO>;
    ```

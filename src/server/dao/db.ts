type User = { id: string; name: string };

// Imaginary database
const users: User[] = [{ id: '1', name: 'Carlo' }];
export const db = {
  user: {
    findMany: async () => users,
    findById: async (id: string) => users.find((user) => user.id === id),
    findByIdOrName: async (id?: string, name?: string) =>
      users.filter((user) => user.id === id || user.name === name),
    create: async (data: { name: string }) => {
      const user = { id: String(users.length + 1), ...data };
      users.push(user);
      return user;
    }
  }
};

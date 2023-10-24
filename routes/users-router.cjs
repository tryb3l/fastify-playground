module.exports = async function usersRouter(fastify, _) {
  fastify.register(
    async function routes(child, _options) {
      child.get("/", async (_request, reply) => {
        reply.send(child.users);
      });
      child.post("/", async (request, reply) => {
        const newUser = request.body;
        child.users.push(newUser);
        reply.send(newUser);
      });
    },
    { prefix: "users" },
  );
};

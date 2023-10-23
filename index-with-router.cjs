const Fastify = require("fastify");
const usersRouter = require("./users-router.cjs");
const app = Fastify();
app.decorate("users", [
  {
    name: "Sam",
    age: 23,
  },
  {
    name: "Bohdan",
    age: 29,
  },
]);

app.register(usersRouter, { prefix: "v1" });
app.register(
  async function usersRouterV2(fastify, options) {
    fastify.register(usersRouter);
    fastify.delete("/users/:name", (request, reply) => {
      const userIndex = fastify.users.findIndex(
        (user) => user.name === request.params.name,
      );
      fastify.users.splice(userIndex, 1);
      reply.send();
    });
  },
  { prefix: "v2" },
);

app.ready().then(() => {
  console.log(app.printRoutes());
});

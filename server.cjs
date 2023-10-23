const fastify = require("fastify");
const fs = require("node:fs/promises");
//basic server configuration, added an option to make logs more human readable by using pino-pretty
const environment = process.env.NODE_ENV || "development";
async function start() {
  const config = await staticConfigLoader(environment);
  const app = fastify(config.serverOptions.factory);
  app.register(plugin, config.pluginOptions.fooBar);
  app.register(plugin, {
    bar: function () {
      return config.pluginOptions ? 42 : -42;
    },
  });
}

const serverOptions = {
  logger: {
    level: "debug",
    transport: {
      target: "pino-pretty",
    },
  },
};
//basic plugin configuration

//basic app configuration

const app = fastify(serverOptions);

//sample hooks, figuring out of their work
app.addHook("onRoute", function inspector(routeOptions) {
  console.log(routeOptions);
});

app.addHook("onRegister", function inspector(plugin, pluginOptions) {
  console.log("Chapter 2 of the book");
});

app.addHook("onReady", async function preLoading() {
  console.log("onReady");
});

app.addHook("onClose", function manageClose(done) {
  console.log("onClose");
  done();
});

//basic endpoints
app.get("/hello", async function myHandler(request, reply) {
  return "hello";
});

//inmemory place to store cats data
const cats = [];
app.post("/cat", function saveCat(request, reply) {
  cats.push(request.body);
  reply.code(201).send({ allCats: cats });
});

app.get("/cat/:catName", function readCat(request, reply) {
  const lookingFor = request.params.catName;
  const result = cats.find((cat) => cat.name == lookingFor);
  if (result) {
    return { cat: result };
  } else {
    reply.code(404);
    throw new Error(`Cat ${lookingFor} was not found`);
  }
});

app.get("/cat/*", function sendCats(request, reply) {
  reply.send({ allCats: cats });
});

function business(request, reply) {
  // `this` is the fastify Fastify application instance
  return { helloForm: this.server.address() };
}
app.get("/server", business);

app.get("/file", function promiseHandler(request, reply) {
  const fileName = "./package.json";
  const readPromise = fs.readFile(fileName, { encoding: "utf8" });
  return readPromise;
});

app.get("/xray", function Xray(request, reply) {
  // send back all the request properties
  return {
    id: request.id, // id assigned to the request in req-<progress>
    ip: request.ip, // clients IP address
    ips: request.ips, // clients proxy IP addresse
    hostname: request.hostname, //clients hostname
    protocol: request.protocol, //clients protocol
    method: request.method, // HTTP method
    url: request.url, // HTTP url
    routerPath: request.routeOptions.url, // the path used to match the route
    is404: request.is404, // the request has been routed or not
  };
});

app.get("/log", function log(request, reply) {
  request.log.info("hey there");
  request.log.info("world");
  reply.log.info("late to the party"); // same as request.log
  app.log.info("unrelated"); // same as request.log
  reply.send();
});

//Plugins
app.register(
  function myPlugin(pluginInstance, opts, next) {
    pluginInstance.log.info("I am a plugin instance, children of app");
    next();
  },
  { hello: "the opts object" },
);

await app.listen(config.serverOptions.listen);
async function staticConfigLoader(environment) {
  return {
    environment,
    serverOptions: getServerConfig(),
    pluginOptions: {},
    applicationOptions: {},
  };
}

start();

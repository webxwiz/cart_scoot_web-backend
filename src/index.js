import express from "express";
import mongoose from "mongoose";
import cors from 'cors';
import http from 'http';

import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';

import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';

import { advertisementTypeDefs, requestTypeDefs, reviewTypeDefs, userTypeDefs } from "./schema/_index.js";
import { queryResolver, mutationResolver } from "./resolvers/_index.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { logger } from './utils/_index.js';
import router from './router/router.js';

import 'dotenv/config';

mongoose
    .connect(process.env.MONGO_DB)
    .then(() => logger.info('Mongo DB successfully connected...'))
    .catch((err) => logger.error(`Mongo DB Error: ${err}`))

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', router);

const port = process.env.PORT || 4004;

const httpServer = http.createServer(app);

const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
});

const schema = makeExecutableSchema({
    typeDefs: userTypeDefs.concat(requestTypeDefs, reviewTypeDefs, advertisementTypeDefs),
    resolvers: { ...queryResolver, ...mutationResolver },
});

const serverCleanup = useServer({ schema }, wsServer);

const server = new ApolloServer({
    schema,
    plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
        {
            async serverWillStart() {
                return {
                    async drainServer() {
                        await serverCleanup.dispose();
                    },
                };
            },
        },
    ],
});

await server.start();

app.use('/graphql', cors(),
    expressMiddleware(server, {
        context: async ({ req, res }) => {
            const token = req.headers.authorization || '';
            return { token };
        },
    }),
);

app.use(errorHandler);

httpServer.listen(port, () => {
    logger.info(`Apollo server has been started on http://localhost:${port}/graphql`);
});
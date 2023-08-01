import jwt from 'jsonwebtoken';

import { GraphQLError } from 'graphql';

export const checkAuth = (auth) => {

    if (!auth) {
        throw new GraphQLError("No authorization data");
    }
    try {
        const token = auth.split(' ')[1];
        const { _id, role } = jwt.verify(token, process.env.TOKEN_SECRET_KEY);

        return { _id, role };
    } catch {
        throw new GraphQLError("Authorization error");
    }
}

import { GraphQLError } from 'graphql';

import { checkAuth, findUserById } from './_index.js';

export const findAdminByToken = async (token) => {
    const { _id } = checkAuth(token);
    const user = await findUserById(_id);

    if (user.role === 'ADMIN' || user.role === 'SUBADMIN') {

        return user;
    } else {
        throw new GraphQLError("You haven't appropriate access")
    }
}
import { GraphQLError } from 'graphql';

import UserModel from '../models/User.js';

export const findUserByIdAndRole = async (_id, role) => {
    const user = await UserModel.findById(_id);
    if (!user) {
        throw new GraphQLError("Can't find user")
    };
    if (user.role !== role) {
        throw new GraphQLError("You haven't appropriate access")
    }
    if (user.banned) {
        throw new GraphQLError("You've banned on site. Please appeal to administrator")
    };

    return user;
}
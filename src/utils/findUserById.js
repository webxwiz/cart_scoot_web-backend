import { GraphQLError } from 'graphql';

import UserModel from '../models/User.js';

export const findUserById = async (_id) => {
    const user = await UserModel.findById(_id);
    if (!user) {
        throw new GraphQLError("Can't find user")
    };
    if (user.banned) {
        throw new GraphQLError("You've banned on site. Please appeal to administrator")
    };

    return user;
}
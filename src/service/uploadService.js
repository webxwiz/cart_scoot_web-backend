import { GraphQLError } from 'graphql';

import UserModel from '../models/User.js';
import { findUserById } from '../utils/findUserById.js';

class UploadService {

    async uploadAvatarUrl(id, avatarURL) {
        await findUserById(_id);

        const updatedUser = await UserModel.findOneAndUpdate(
            { _id: id },
            {
                $set: { avatarURL }
            },
            { new: true },
        );
        if (!updatedUser) {
            throw new GraphQLError("Modified forbidden")
        } else return updatedUser
    }

    async deleteAvatarUrl(_id) {
        await findUserById(_id);

        const updatedUser = await UserModel.findOneAndUpdate(
            { _id },
            { avatarURL: null },
            { new: true },
        );

        return updatedUser;
    }

    async uploadLicenseUrl(id, licenseURL) {
        await findUserById(_id);

        const updatedUser = await UserModel.findOneAndUpdate(
            { _id: id },
            {
                $set: { 'license.licenseURL': licenseURL }
            },
            { new: true },
        );
        if (!updatedUser) {
            throw new GraphQLError("Modified forbidden")
        } else return updatedUser
    }

    async deleteLicenseUrl(_id) {
        await findUserById(_id);

        const updatedUser = await UserModel.findOneAndUpdate(
            { _id },
            { 'license.licenseURL': null },
            { new: true },
        );

        return updatedUser;
    }

}

export default new UploadService;
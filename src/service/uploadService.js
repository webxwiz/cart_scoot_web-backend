import { GraphQLError } from 'graphql';

import UserModel from '../models/User.js';

class UploadService {

    async uploadAvatarUrl(id, avatarURL) {
        const user = await UserModel.findById(id);
        if (!user) {
            throw new GraphQLError("Can't find user")
        };
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
        const user = await UserModel.findById(_id);
        if (!user) {
            throw new GraphQLError("Can't find user")
        };
        const updatedUser = await UserModel.findOneAndUpdate(
            { _id },
            { avatarURL: null },
            { new: true },
        );

        return updatedUser;
    }

    async uploadLicenseUrl(id, licenseURL) {
        const user = await UserModel.findById(id);
        if (!user) {
            throw new GraphQLError("Can't find user")
        };
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
        const user = await UserModel.findById(_id);
        if (!user) {
            throw new GraphQLError("Can't find user")
        };
        const updatedUser = await UserModel.findOneAndUpdate(
            { _id },
            { 'license.licenseURL': null },
            { new: true },
        );

        return updatedUser;
    }

}

export default new UploadService;
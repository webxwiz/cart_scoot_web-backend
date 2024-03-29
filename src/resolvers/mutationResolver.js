import adminService from '../service/adminService.js';
import requestService from '../service/requestService.js';
import reviewService from '../service/reviewService.js';
import userService from '../service/userService.js';

import { statusTypes, userTypes } from '../utils/_index.js';

const mutationResolver = {
    Mutation: {
        registerByEmail: async (parent, { registerUserInput }) => {
            const { user, token } = await userService.registerByEmail(registerUserInput);

            return {
                user,
                token,
                message: `User ${user.userName} successfully created`,
            };
        },
        loginByEmail: async (parent, { email, password }) => {
            const { user, token } = await userService.loginByEmail({
                email,
                password,
            });

            return {
                user,
                token,
                message: `User ${user.userName} successfully logged`,
            };
        },

        fullRegisterByPhone: async (parent, { fullRegisterByPhoneInput }) => {
            const user = await userService.fullRegisterByPhone(fullRegisterByPhoneInput);

            return {
                user,
                message: `User ${user.phone.number} successfully created`,
            };
        },
        registerByPhone: async (parent, { registerByPhoneInput }) => {
            const user = await userService.registerByPhone(registerByPhoneInput);

            return {
                user,
                message: `User ${user.phone.number} successfully created`,
            };
        },
        loginByPhone: async (parent, { loginByPhoneInput }) => {
            const { user, token } = await userService.loginByPhone(loginByPhoneInput);

            return {
                user,
                token,
                message: `User ${user.phone} successfully logged`,
            };
        },

        addMobilePhone: async (parent, { phone }, contextValue) => {
            const user = await userService.addMobilePhone(phone, contextValue.token);

            return user;
        },
        confirmMobilePhone: async (parent, { smsCode }, contextValue) => {
            const user = await userService.confirmMobilePhone(smsCode, contextValue.token);

            return user;
        },

        deleteUser: async (parent, { _id }, contextValue) => {
            const userStatus = await userService.delete(_id, contextValue.token);

            return {
                userStatus,
                message: 'User successfully deleted',
            };
        },
        changeUserName: async (parent, { changeUserNameInput }, contextValue) => {
            const user = await userService.update(changeUserNameInput, contextValue.token);

            return user;
        },

        resetPassword: async (parent, { email }) => {
            const status = await userService.resetPassword(email);
            if (status) {
                return {
                    status,
                    message: `Email successfully sent to ${email}`,
                };
            } else {
                return {
                    status,
                    message: `Can't sent email to ${email}`,
                };
            }
        },

        setNewPassword: async (parent, { setPasswordInput }) => {
            const updatedUser = await userService.setNewPassword(setPasswordInput);

            if (updatedUser) {
                return {
                    status: true,
                    message: `${updatedUser.userName} password successfully updated`,
                };
            }
        },

        changePassword: async (parent, { changePasswordInput }, contextValue) => {
            const user = await userService.changePassword(changePasswordInput, contextValue.token);

            if (user) {
                return {
                    status: true,
                    message: 'Password successfully updated',
                };
            }
        },

        addReview: async (parent, { addReviewInput }, contextValue) => {
            const review = await reviewService.addReview(addReviewInput, contextValue.token);

            return review;
        },

        createOneDriverRequest: async (parent, { createOneDriverRequestInput }, contextValue) => {
            const request = await requestService.createOneDriverRequest(
                createOneDriverRequestInput,
                userTypes.rider,
                contextValue.token
            );

            return {
                request,
                message: `Request successfully created. Email successfully sent`,
            };
        },

        createDriversRequest: async (parent, { createDriversRequestInput }, contextValue) => {
            const { request, message } = await requestService.createDriversRequest(
                createDriversRequestInput,
                userTypes.rider,
                contextValue.token
            );

            return { request, message };
        },

        driverOneCallAnswer: async (parent, { driverOneCallAnswerInput }, contextValue) => {
            const request = await requestService.driverOneCallAnswer(
                driverOneCallAnswerInput,
                contextValue.token
            );

            return request;
        },
        driverMultiCallAnswer: async (parent, { driverMultiCallAnswerInput }, contextValue) => {
            const request = await requestService.driverMultiCallAnswer(
                driverMultiCallAnswerInput,
                contextValue.token
            );

            return request;
        },

        riderMultiCallAnswer: async (parent, { riderMultiCallAnswerInput }, contextValue) => {
            const request = await requestService.riderMultiCallAnswer(
                riderMultiCallAnswerInput,
                contextValue.token
            );

            return request;
        },

        cancelRequest: async (parent, { requestId }, contextValue) => {
            const requestStatus = await requestService.changeRequestStatus(
                requestId,
                statusTypes.cancelled,
                contextValue.token
            );

            return requestStatus;
        },
        finishRequest: async (parent, { requestId }, contextValue) => {
            const request = await requestService.changeRequestStatus(
                requestId,
                statusTypes.finished,
                contextValue.token
            );

            return request;
        },

        updateWorkingTime: async (parent, { updateWorkingTimeInput }, contextValue) => {
            const user = await userService.update(updateWorkingTimeInput, contextValue.token);

            return user;
        },
        addCoordinates: async (parent, { updateCoordinatesInput }, contextValue) => {
            const user = await userService.update(updateCoordinatesInput, contextValue.token);

            return user;
        },

        changeUserRole: async (parent, { changeUserRoleInput }, contextValue) => {
            const user = await adminService.changeUserRole(changeUserRoleInput, contextValue.token);

            return user;
        },

        answerDriverLicense: async (parent, { answerDriverLicenseInput }, contextValue) => {
            const user = await adminService.answerDriverLicense(
                answerDriverLicenseInput,
                contextValue.token
            );

            return user;
        },

        changeUserStatus: async (parent, { _id, status }, contextValue) => {
            const user = await adminService.changeBunStatus(_id, status, contextValue.token);

            return user;
        },

        addAdvertisement: async (parent, { addAdvertisementInput }, contextValue) => {
            const advertisement = await adminService.addAdvertisement(
                addAdvertisementInput,
                contextValue.token
            );

            return advertisement;
        },

        updateAdvertisement: async (parent, { updateAdvertisementInput }, contextValue) => {
            const advertisement = await adminService.updateAdvertisement(
                updateAdvertisementInput,
                contextValue.token
            );

            return advertisement;
        },

        deleteAdvertisement: async (parent, { id }, contextValue) => {
            const advertisement = await adminService.deleteAdvertisement(id, contextValue.token);

            return advertisement;
        },
    },
};

export { mutationResolver };

import adminService from '../service/adminService.js';
import requestService from '../service/requestService.js';
import reviewService from '../service/reviewService.js';
import uploadService from '../service/uploadService.js';
import userService from '../service/userService.js';


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
            const { user, token } = await userService.loginByEmail({ email, password })

            return {
                user,
                token,
                message: `User ${user.userName} successfully logged`,
            };
        },

        registerByPhone: async (parent, { phoneNumber }) => {
            const user = await userService.registerByPhone(phoneNumber);

            return {
                user,
                message: `User ${user.phone.number} successfully created`,
            };
        },
        loginByPhone: async (parent, { loginByPhoneInput }) => {
            const { user, token } = await userService.loginByPhone(loginByPhoneInput)

            return {
                user,
                token,
                message: `User ${user.phone.number} successfully logged`,
            };
        },

        deleteUser: async (parent, { _id }, contextValue) => {
            const userStatus = await userService.delete(_id, contextValue.token);

            return {
                userStatus,
                message: 'User successfully deleted'
            };
        },

        resetPassword: async (parent, { email }) => {
            const status = await userService.resetPassword(email);

            return {
                status: status.response,
                message: `Email successfully sent to ${status.accepted}`,
            };
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
                    message: "Password successfully updated",
                };
            }
        },

        addReview: async (parent, { addReviewInput }, contextValue) => {
            const review = await reviewService.addReview(addReviewInput, 'RIDER', contextValue.token);

            return {
                review,
                message: `Review successfully created`,
            };
        },

        createOneDriverRequest: async (parent, { createOneDriverRequestInput }, contextValue) => {
            const { request, status } = await requestService.createOneDriverRequest(createOneDriverRequestInput, 'RIDER', contextValue.token);

            return {
                request,
                status: status.response,
                message: `Request successfully created. Email successfully sent to ${status.accepted}`,
            };
        },

        createDriversRequest: async (parent, { createDriversRequestInput }, contextValue) => {
            const { request, message } = await requestService.createDriversRequest(createDriversRequestInput, 'RIDER', contextValue.token);

            return { request, message };
        },

        driverAnswer: async (parent, { AnswerInput }, contextValue) => {
            const { id, answer } = AnswerInput;
            const status = answer ? 'APPROVED' : 'REJECTED';
            const request = await requestService.userAnswer(id, status, 'DRIVER', contextValue.token);

            return request;
        },

        riderAnswer: async (parent, { AnswerInput }, contextValue) => {
            const { id, answer } = AnswerInput;
            const status = answer ? 'ACTIVE' : 'REJECTED';
            const request = await requestService.userAnswer(id, status, 'RIDER', contextValue.token);

            return request;
        },

        driverCancel: async (parent, { id }, contextValue) => {
            const request = await requestService.userAnswer(id, 'REJECTED', contextValue.token);

            return request;
        },

        cancelUserRequest: async (parent, { id }, contextValue) => {
            const requestStatus = await requestService.cancelUserRequest(id, 'RIDER', contextValue.token);

            return requestStatus;
        },

        finishRequest: async (parent, { id }, contextValue) => {
            const request = await requestService.finishRequest(id, 'RIDER', contextValue.token);

            return request;
        },

        updateWorkingTime: async (parent, { updateWorkingTimeInput }, contextValue) => {
            const user = await userService.update(updateWorkingTimeInput, contextValue.token);

            return user;
        },

        sendLicenseForApprove: async (parent, args, contextValue) => {
            const user = await uploadService.changeLicenseStatus('WAITING', 'DRIVER', contextValue.token);

            return user;
        },

        changeUserRole: async (parent, { changeUserRoleInput }, contextValue) => {
            const user = await adminService.changeUserRole(changeUserRoleInput, contextValue.token);

            return user;
        },

        answerDriverLicense: async (parent, { answerDriverLicense }, contextValue) => {
            const user = await adminService.answerDriverLicense(answerDriverLicense, contextValue.token);

            return user;
        },

        banUser: async (parent, { id }, contextValue) => {
            const user = await adminService.changeBunStatus(id, true, contextValue.token);

            return user;
        },

        unBanUser: async (parent, { id }, contextValue) => {
            const user = await adminService.changeBunStatus(id, false, contextValue.token);

            return user;
        },

        addAdvertisement: async (parent, { addAdvertisementInput }, contextValue) => {
            const advertisement = await adminService.addAdvertisement(addAdvertisementInput, contextValue.token);

            return advertisement;
        },

        deleteAdvertisement: async (parent, { id }, contextValue) => {
            const advertisement = await adminService.deleteAdvertisement(id, contextValue.token);

            return advertisement;
        },

    }
};

export { mutationResolver };

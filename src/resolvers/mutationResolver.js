import requestService from '../service/requestService.js';
import reviewService from '../service/reviewService.js';
import userService from '../service/userService.js';


const mutationResolver = {
    Mutation: {
        registerUser: async (parent, { registerUserInput }) => {
            const { user, token } = await userService.register(registerUserInput);

            return {
                user,
                token,
                message: `User ${user.userName} successfully created`,
            };
        },

        login: async (parent, { email, password }) => {
            const { user, token } = await userService.login({ email, password })

            return {
                user,
                token,
                message: `User ${user.userName} successfully logged`,
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

        confirmPassword: async (parent, { password }, contextValue) => {
            const status = await userService.confirmPassword(password, contextValue.token);

            return { ...status };
        },

        updatePassword: async (parent, { password }, contextValue) => {
            const updatedUser = await userService.updatePassword(password, contextValue.token);

            if (updatedUser) {
                return {
                    status: true,
                    message: "Password successfully updated",
                };
            }
        },

        addReview: async (parent, { addReviewInput }, contextValue) => {
            const review = await reviewService.addReview(addReviewInput, contextValue.token);

            return {
                review,
                message: `Review successfully created`,
            };
        },

        createOneDriverRequest: async (parent, { createOneDriverRequestInput }, contextValue) => {
            const { request, status } = await requestService.createOneDriverRequest(createOneDriverRequestInput, contextValue.token);

            return {
                request,
                status: status.response,
                message: `Review successfully created. Email successfully sent to ${status.accepted}`,
            };
        },

        createDriversRequest: async (parent, { createDriversRequestInput }, contextValue) => {
            const { request, message } = await requestService.createDriversRequest(createDriversRequestInput, contextValue.token);
            
            return { request, message };
        },

        answerDriver: async (parent, { answerDriverInput }, contextValue) => {
            const request = await requestService.answerDriver(answerDriverInput, contextValue.token);

            return request;
        },

        cancelUserRequest: async (parent, { id }, contextValue) => {
            const requestStatus = await requestService.cancelUserRequest(id, contextValue.token);

            return requestStatus;
        },

        finishRequest: async (parent, { id }, contextValue) => {
            const request = await requestService.finishRequest(id, contextValue.token);

            return request;
        },

        updateWorkingTime: async (parent, { updateWorkingTimeInput }, contextValue) => {
            const user = await userService.update(updateWorkingTimeInput, contextValue.token);

            return user;
        },

    }
};

export { mutationResolver };

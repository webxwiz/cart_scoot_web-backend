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

    }
};

export { mutationResolver };

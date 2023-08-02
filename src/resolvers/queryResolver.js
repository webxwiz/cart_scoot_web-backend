import reviewService from '../service/reviewService.js';
import userService from '../service/userService.js';
import requestService from '../service/requestService.js';


const queryResolver = {
    Query: {

        getUserByToken: async (parent, args, contextValue) => {
            const user = await userService.getUserByToken(contextValue.token);

            return user;
        },

        getReviewsById: async (parent, { id }, contextValue) => {
            const reviews = await reviewService.getReviewsById(id);

            return reviews;
        },

        getFreeDrivers: async (parent, { requestedTime }, contextValue) => {
            const drivers = await userService.getFreeDrivers(requestedTime);

            return drivers;
        },

        getDriverProfile: async (parent, { id }, contextValue) => {
            const driver = await userService.getDriverProfile(id, contextValue.token);

            return driver;
        },

        getAllActiveRequests: async (parent, args, contextValue) => {
            const requests = await requestService.getAllRequestsByStatus('ACTIVE', contextValue.token);

            return requests;
        },

        getAllFinishedRequests: async (parent, args, contextValue) => {
            const requests = await requestService.getAllRequestsByStatus('FINISHED', contextValue.token);

            return requests;
        },

    },
};

export { queryResolver };

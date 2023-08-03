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
            const driver = await userService.getProfileById(id, 'DRIVER');

            return driver;
        },

        getRiderProfile: async (parent, { id }, contextValue) => {
            const rider = await userService.getProfileById(id, 'RIDER');

            return rider;
        },

        getRequest: async (parent, { id }, contextValue) => {
            const request = await requestService.getRequest(id, contextValue.token);

            return request;
        },

        getAllActiveRequests: async (parent, args, contextValue) => {
            const requests = await requestService.getAllRequestsByStatus('ACTIVE', contextValue.token);

            return requests;
        },

        getAllFinishedRequests: async (parent, args, contextValue) => {
            const requests = await requestService.getAllRequestsByStatus('FINISHED', contextValue.token);

            return requests;
        },

        getNotFinishedRequests: async (parent, args, contextValue) => {
            const requests = await requestService.getNotFinishedRequests();

            return requests;
        },

        getFinishedRequestsByDriver: async (parent, { id }, contextValue) => {
            const requests = await requestService.getFinishedRequestsByDriver(id, contextValue.token);

            return requests;
        },

    },
};

export { queryResolver };

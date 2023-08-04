import reviewService from '../service/reviewService.js';
import userService from '../service/userService.js';
import requestService from '../service/requestService.js';
import adminService from '../service/adminService.js';


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

        getAllDrivers: async (parent, args, contextValue) => {
            const drivers = await adminService.getProfilesByRole('DRIVER', contextValue.token)

            return drivers;
        },

        getAllRiders: async (parent, args, contextValue) => {
            const riders = await adminService.getProfilesByRole('RIDER', contextValue.token)

            return riders;
        },

        getAllUsers: async (parent, args, contextValue) => {
            const users = await adminService.getAllUsers(contextValue.token)

            return users;
        },

        getAllRequests: async (parent, args, contextValue) => {
            const requests = await adminService.getAllRequests(contextValue.token);

            return requests;
        },

        getAllLicenses: async (parent, args, contextValue) => {
            const users = await adminService.getAllLicenses(contextValue.token);

            return users;
        },

    },
};

export { queryResolver };

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
        getFreeDrivers: async (parent, { getFreeDriversInput }, contextValue) => {
            const drivers = await userService.getFreeDrivers(getFreeDriversInput);

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

        getReviewsByDriverId: async (parent, { getReviewsByDriverIdInput }, contextValue) => {
            const { reviews, totalCount } = await reviewService.getReviewsByDriverId(getReviewsByDriverIdInput);

            return { reviews, totalCount };
        },
        getAllReviews: async (parent, { pageNumber }, contextValue) => {
            const { reviews, totalCount } = await adminService.getAllReviews(pageNumber, contextValue.token);

            return { reviews, totalCount };
        },
        getDriverRating: async (parent, args, contextValue) => {
            const { avgRating, totalCount } = await reviewService.getDriverRating(contextValue.token);

            return { avgRating, totalCount };
        },

        getRequest: async (parent, { id }, contextValue) => {
            const { request, avgRating } = await requestService.getRequest(id, contextValue.token);

            return { request, avgRating };
        },
        getRequestsByRider: async (parent, { getRequestsByFiltersInput }, contextValue) => {
            const { requests, totalCount } = await requestService.getRequestsByRider(getRequestsByFiltersInput, contextValue.token);

            return { requests, totalCount };
        },
        getRequestsByDriver: async (parent, { getRequestsByFiltersInput }, contextValue) => {
            const { requests, totalCount } = await requestService.getRequestsByDriver(getRequestsByFiltersInput, contextValue.token);

            return { requests, totalCount };
        },
        getPendingRequests: async (parent, args, contextValue) => {
            const requests = await requestService.getAllRequestsByStatus('PENDING', contextValue.token);

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

        getAllDrivers: async (parent, { pageNumber }, contextValue) => {
            const { users, totalCount } = await adminService.getProfilesByRole('DRIVER', pageNumber, contextValue.token)

            return { users, totalCount };
        },
        getAllRiders: async (parent, { pageNumber }, contextValue) => {
            const { users, totalCount } = await adminService.getProfilesByRole('RIDER', pageNumber, contextValue.token)

            return { users, totalCount };
        },

        getAllRequests: async (parent, { getAllRequestsInput }, contextValue) => {
            const { requests, totalCount } = await adminService.getAllRequests(getAllRequestsInput, contextValue.token);

            return { requests, totalCount };
        },
        getWaitingLicenses: async (parent, args, contextValue) => {
            const users = await adminService.getWaitingLicenses(contextValue.token);

            return users;
        },
        getAllAdvertisements: async (parent, args, contextValue) => {
            const advertisements = await adminService.getAllAdvertisement();

            return advertisements;
        },
    },
};

export { queryResolver };

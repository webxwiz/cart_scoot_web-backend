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
        getAllReviews: async (parent, { getAllReviewsInput }, contextValue) => {
            const { reviews, totalCount } = await adminService.getAllReviews(getAllReviewsInput, contextValue.token);

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
        getAllRequests: async (parent, { getAllRequestsInput }, contextValue) => {
            const { requests, totalCount } = await adminService.getAllRequests(getAllRequestsInput, contextValue.token);

            return { requests, totalCount };
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

        getStatistic: async (parent, args, contextValue) => {
            const { totalRiders, totalDrivers, totalTrips } = await adminService.getStatistic(contextValue.token);

            return { totalRiders, totalDrivers, totalTrips };
        },
        getAllDrivers: async (parent, { getAllUsersInput }, contextValue) => {
            const { users, totalCount } = await adminService.getProfilesByRole('DRIVER', getAllUsersInput, contextValue.token)

            return { users, totalCount };
        },
        getAllRiders: async (parent, { getAllUsersInput }, contextValue) => {
            const { users, totalCount } = await adminService.getProfilesByRole('RIDER', getAllUsersInput, contextValue.token)

            return { users, totalCount };
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

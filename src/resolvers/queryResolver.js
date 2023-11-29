import reviewService from '../service/reviewService.js';
import userService from '../service/userService.js';
import requestService from '../service/requestService.js';
import adminService from '../service/adminService.js';

import { statusTypes, userTypes } from '../utils/_index.js';

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
        getDriverWithRating: async (parent, { driverId }, contextValue) => {
            const { rating, driver, totalCount } = await adminService.getDriverWithRating(
                driverId,
                contextValue.token
            );

            return { rating, driver, totalCount };
        },

        getReviewsByDriverId: async (parent, { getReviewsByDriverIdInput }, contextValue) => {
            const { reviews, totalCount } = await reviewService.getReviewsByDriverId(
                getReviewsByDriverIdInput
            );

            return { reviews, totalCount };
        },
        getAllReviews: async (parent, { getAllReviewsInput }, contextValue) => {
            const { reviews, totalCount } = await adminService.getAllReviews(
                getAllReviewsInput,
                contextValue.token
            );

            return { reviews, totalCount };
        },
        getDriverRating: async (parent, args, contextValue) => {
            const { avgRating, totalCount } = await reviewService.getDriverRating(
                contextValue.token
            );

            return { avgRating, totalCount };
        },
        getReviewByRequestCode: async (parent, { requestCode }, contextValue) => {
            const review = await adminService.getReviewByRequestCode(
                requestCode,
                contextValue.token
            );

            return review;
        },

        getRequest: async (parent, { id }, contextValue) => {
            const { request, avgRating } = await requestService.getRequest(id, contextValue.token);

            return { request, avgRating };
        },
        getAllRequests: async (parent, { getAllRequestsInput }, contextValue) => {
            const { requests, totalCount } = await adminService.getAllRequests(
                getAllRequestsInput,
                contextValue.token
            );

            return { requests, totalCount };
        },
        getRequestsByRider: async (parent, { getRequestsByFiltersInput }, contextValue) => {
            const { requests, totalCount } = await requestService.getRequestsByRider(
                getRequestsByFiltersInput,
                contextValue.token
            );

            return { requests, totalCount };
        },
        getRequestsByDriver: async (parent, { getRequestsByFiltersInput }, contextValue) => {
            const { requests, totalCount } = await requestService.getRequestsByDriver(
                getRequestsByFiltersInput,
                contextValue.token
            );

            return { requests, totalCount };
        },
        getPendingRequestsByDriver: async (parent, args, contextValue) => {
            const requests = await requestService.getPendingRequestsByDriver(
                statusTypes.pending,
                contextValue.token
            );

            return requests;
        },
        getActiveRequestsAmount: async (parent, { userId }, contextValue) => {
            const requestsAmount = await requestService.getActiveRequestsAmount(userId);

            return requestsAmount;
        },

        getStatistic: async (parent, args, contextValue) => {
            const { totalRiders, totalDrivers, totalTrips } = await adminService.getStatistic(
                contextValue.token
            );

            return { totalRiders, totalDrivers, totalTrips };
        },
        getAllDrivers: async (parent, { getAllUsersInput }, contextValue) => {
            const { users, totalCount } = await adminService.getProfilesByRole(
                userTypes.driver,
                getAllUsersInput,
                contextValue.token
            );

            return { users, totalCount };
        },
        getAllRiders: async (parent, { getAllUsersInput }, contextValue) => {
            const { users, totalCount } = await adminService.getProfilesByRole(
                userTypes.rider,
                getAllUsersInput,
                contextValue.token
            );

            return { users, totalCount };
        },

        getWaitingLicenses: async (parent, args, contextValue) => {
            const users = await adminService.getWaitingLicenses(contextValue.token);

            return users;
        },
        getAllAdvertisements: async (parent, { pageNumber }, contextValue) => {
            const { advertisements, totalCount } = await adminService.getAllAdvertisements(
                pageNumber,
                contextValue.token
            );

            return { advertisements, totalCount };
        },
        getAdvertisementById: async (parent, { adsId }, contextValue) => {
            const advertisement = await adminService.getAdvertisementById(
                adsId,
                contextValue.token
            );

            return advertisement;
        },
        getPageAdvertisement: async (parent, { position }, contextValue) => {
            const advertisement = await userService.getPageAdvertisement(position);

            return advertisement;
        },
    },
};

export { queryResolver };

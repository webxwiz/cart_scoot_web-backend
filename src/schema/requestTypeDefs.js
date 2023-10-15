export const requestTypeDefs = `#graphql
    scalar Date
    enum statusTypes {
        PENDING
        REJECTED
        APPROVED
        ACTIVE
        FINISHED
    }
    type Request {
        _id: ID
        createdAt: Date
        userId: ID!
        driverId: ID
        description: String
        status: statusTypes
        carType: Int
        requestedTime: Date
        coordinates: Coordinates
        requestCode: String
        pickupLocation: String
        dropoffLocation: String
    }
    type RequestWithDriverPopulatedFields {
        _id: ID
        createdAt: Date
        userId: ID!
        driverId: UserInRequest
        description: String
        status: statusTypes
        carType: Int
        requestedTime: Date
        coordinates: Coordinates
        requestCode: String
        pickupLocation: String
        dropoffLocation: String
    }
    type RequestWithRiderPopulatedFields {
        _id: ID
        createdAt: Date
        userId: UserInRequest
        driverId: ID
        description: String
        status: statusTypes
        carType: Int
        requestedTime: Date
        coordinates: Coordinates
        requestCode: String
        pickupLocation: String
        dropoffLocation: String
    }
    type RequestWithAllUserPopulatedFields {
        _id: ID
        createdAt: Date
        userId: UserInRequest
        driverId: UserInRequest
        description: String
        status: statusTypes
        carType: Int
        requestedTime: Date
        coordinates: Coordinates
        requestCode: String
        pickupLocation: String
        dropoffLocation: String
    }
    type RequestWithRating {
        request: RequestWithAllUserPopulatedFields
        avgRating: Float
    }
    type UserInRequest {
        _id: ID!                    
        userName: String!        
        avatarURL: String
        phone: PhoneTypes                 
    }
    type PhoneTypes {
        number: String
        confirmed: Boolean
    }
    type Coordinates {
        start: LocationTypes
        end: LocationTypes
    }
    type LocationTypes {
        lat: Float
        lon: Float
    }
    type CreateDriversRequestAnswer {
        request: Request
        message: String
    }
    type RequestsWithPagination {
        requests: [RequestWithAllUserPopulatedFields]
        totalCount: Int
    }
    type RequestsByRiderWithPagination {
        requests: [RequestWithDriverPopulatedFields]
        totalCount: Int
    }
    type RequestsByDriverWithPagination {
        requests: [RequestWithRiderPopulatedFields]
        totalCount: Int
    }
    type RequestsAmount {
        requestAmount: Int
    }

    input GetRequestsByFiltersInput {
        page: Int
        searchRequestCode: String
        dateFrom: Date
        dateTo: Date
        status: statusTypes
    }
    input GetAllRequestsInput {
        pageNumber: Int
        itemsOnPage: Int
        searchRequestCode: String
        dateFrom: Date
        dateTo: Date
        status: statusTypes
    }
    input CreateOneDriverRequestInput {
        id: ID!
        description: String
        carType: Int
        requestedTime: Date
        coordinates: CoordinatesInput
        pickupLocation: String
        dropoffLocation: String
    }
    input CreateDriversRequestInput {
        description: String
        carType: Int
        requestedTime: Date
        coordinates: CoordinatesInput
        pickupLocation: String
        dropoffLocation: String
    } 
    input AnswerInput {
        requestId: ID!
        answer: Boolean!
    }
    input CoordinatesInput {
        start: LocationTypeInput
        end: LocationTypeInput
    }
    input LocationTypeInput {
        lat: Float
        lon: Float
    }

    type Query {
        getRequest(id: ID!): RequestWithRating

        getAllRequests(getAllRequestsInput: GetAllRequestsInput): RequestsWithPagination
        getRequestsByRider(getRequestsByFiltersInput: GetRequestsByFiltersInput): RequestsByRiderWithPagination 
        getRequestsByDriver(getRequestsByFiltersInput: GetRequestsByFiltersInput): RequestsByDriverWithPagination

        getPendingRequests: [RequestWithRiderPopulatedFields]
        getActiveRequestsAmount(userId: ID): RequestsAmount
    }
    type Mutation {
        createOneDriverRequest(createOneDriverRequestInput: CreateOneDriverRequestInput): CreateDriversRequestAnswer
        createDriversRequest(createDriversRequestInput: CreateDriversRequestInput): CreateDriversRequestAnswer

        driverOneCallAnswer(driverOneCallAnswerInput: AnswerInput): Request
        driverMultiCallAnswer(driverMultiCallAnswerInput: AnswerInput): Request

        riderMultiCallAnswer(riderMultiCallAnswerInput: AnswerInput): Request

        cancelRequest(requestId: ID!): Request
        finishRequest(requestId: ID!): Request
    }    
`;
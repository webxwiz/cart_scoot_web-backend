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
        driverId: ID!
        description: String
        status: statusTypes
        carType: Int
        requestedTime: Date
        coordinates: Coordinates
        requestCode: String
        pickupLocation: String
        dropoffLocation: String
    }
    type RequestWithPopulatedFields {
        _id: ID
        createdAt: Date
        userId: ID!
        driverId: DriverInRequest
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
        request: RequestWithPopulatedFields
        avgRating: Float
    }
    type DriverInRequest {
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
    type CreateOneDriverRequestAnswer {
        request: Request
        status: String
        message: String
    }
    type CreateAllDriversRequestAnswer {
        request: Request
        message: String
    }

    input GetAllRequestsByFiltersInput {
        status: statusTypes
        page: Int
        searchRequestCode: String
        dateFrom: Date
        dateTo: Date
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
        id: ID!
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
        getAllRequests: [Request]
        getAllRequestsByFilters(getAllRequestsByFiltersInput: GetAllRequestsByFiltersInput): [RequestWithPopulatedFields] 
        getAllActiveRequests: [Request]
        getAllFinishedRequests: [Request]
        getNotFinishedRequests: [Request]
        getFinishedRequestsByDriver(id: ID!): [Request]
    }
    type Mutation {
        createOneDriverRequest(createOneDriverRequestInput: CreateOneDriverRequestInput): CreateOneDriverRequestAnswer
        createDriversRequest(createDriversRequestInput: CreateDriversRequestInput): CreateAllDriversRequestAnswer
        driverAnswer(driverAnswerInput: AnswerInput): Request
        driverCancel(id: ID!): Request
        riderAnswer(riderAnswerInput: AnswerInput): Request
        cancelUserRequest(id: ID!): Boolean
        finishRequest(id: ID!): Request
    }    
`;
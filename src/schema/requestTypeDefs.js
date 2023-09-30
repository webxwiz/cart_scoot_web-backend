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
    type RequestWithRating {
        request: RequestWithDriverPopulatedFields
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

    input GetRequestsByFiltersInput {
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
        getRequestsByRider(getRequestsByFiltersInput: GetRequestsByFiltersInput): [RequestWithDriverPopulatedFields] 
        getRequestsByDriver(getRequestsByFiltersInput: GetRequestsByFiltersInput): [RequestWithRiderPopulatedFields] 
        getAllRequests: [Request]
        getPendingRequests: [RequestWithRiderPopulatedFields]

        getAllFinishedRequests: [Request]
        getNotFinishedRequests: [Request]
        getFinishedRequestsByDriver(id: ID!): [Request]
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
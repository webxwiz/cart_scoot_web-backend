export const requestTypeDefs = `#graphql
    scalar Date
    enum statusTypes {
        PENDING
        REJECTED
        ACTIVE
        FINISHED
    }
    type Review {
        createdBy: String
        driver: String
        text: String
        rating: Int
        createdAt: Date
    }
    type CreateReviewAnswer {
        review: Review
        message: String
    }
    type Request {
        createdBy: String
        description: String
        status: statusTypes
        carType: Int
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

    input AddReviewInput {
        id: ID!
        text: String
        rating: Int
    }
    input CreateOneDriverRequestInput {
        id: ID!
        description: String
        carType: Int
        requestedTime: Date
    }
    input CreateDriversRequestInput {
        description: String
        carType: Int
        requestedTime: Date
    }
    input AnswerDriverInput {
        id: ID!
        answer: Boolean!
    }

    type Query {
        getReviewsById(id: ID!): [Review]
        getAllActiveRequests: [Request]
        getAllFinishedRequests: [Request]
    }
    type Mutation {
        addReview(addReviewInput: AddReviewInput): CreateReviewAnswer

        createOneDriverRequest(createOneDriverRequestInput: CreateOneDriverRequestInput): CreateOneDriverRequestAnswer
        createDriversRequest(createDriversRequestInput: CreateDriversRequestInput): CreateAllDriversRequestAnswer
        answerDriver(answerDriverInput: AnswerDriverInput): Request
        cancelUserRequest(id: ID!): Boolean
        finishRequest(id: ID!): Request
    }    
`;
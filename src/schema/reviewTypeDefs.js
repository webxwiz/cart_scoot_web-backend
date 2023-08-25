export const reviewTypeDefs = `#graphql
    scalar Date    
    type Review {
        createdBy: String
        driverId: ID!
        text: String
        rating: Int
        createdAt: Date
    }
    type CreateReviewAnswer {
        review: Review
        message: String
    }    

    input AddReviewInput {
        id: ID!
        text: String
        rating: Int
    }
    
    type Query {
        getReviewsById(id: ID!): [Review]        
    }
    type Mutation {
        addReview(addReviewInput: AddReviewInput): CreateReviewAnswer        
    }    
`;
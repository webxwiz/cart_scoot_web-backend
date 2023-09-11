export const reviewTypeDefs = `#graphql
    scalar Date    
    type Review {
        _id: ID
        createdAt: Date
        createdBy: ID
        driverId: ID
        text: String
        rating: Int
        requestCode: String
    }
    type ReviewWithPopulatedFields {
        _id: ID
        createdAt: Date
        createdBy: PopulatedUserFields
        driverId: PopulatedUserFields
        text: String
        rating: Int
        requestCode: String
    }
    type PopulatedUserFields {
        _id: ID
        userName: String
        avatarURL: String
    }   

    input AddReviewInput {
        driverId: ID!
        text: String
        rating: Int
        requestCode: String
    }
    
    type Query {
        getAllReviews(pageNumber: Int): [Review]
        getReviewsById(driverId: ID!): [ReviewWithPopulatedFields]        
    }
    type Mutation {
        addReview(addReviewInput: AddReviewInput): Review        
    }    
`;
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
    type RatingResult {
        totalCount: Int
        avgRating: Float
    }
    type ReviewWithPagination {
        reviews: [Review]
        totalCount: Int
    }  

    input GetReviewsByDriverIdInput {
        driverId: ID!
        page: Int
        searchRequestCode: String
        dateFrom: Date
        dateTo: Date
    }
    input AddReviewInput {
        driverId: ID!
        text: String
        rating: Int
        requestCode: String
    }
    
    type Query {
        getAllReviews(pageNumber: Int): ReviewWithPagination
        getReviewsByDriverId(getReviewsByDriverIdInput: GetReviewsByDriverIdInput): [ReviewWithPopulatedFields] 
        getDriverRating: RatingResult       
    }
    type Mutation {
        addReview(addReviewInput: AddReviewInput): Review        
    }    
`;
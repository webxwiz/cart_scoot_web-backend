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
    type ReviewWithRiderPopulatedFields {
        _id: ID
        createdAt: Date
        createdBy: PopulatedUserFields
        driverId: ID
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
        reviews: [ReviewWithRiderPopulatedFields]
        totalCount: Int
    }  
    type ReviewWithPaginationAndFields {
        reviews: [ReviewWithPopulatedFields]
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
    input GetAllReviewsInput {
        pageNumber: Int
        searchRequestCode: String
        dateFrom: Date
        dateTo: Date
    }
    
    type Query {
        getAllReviews(getAllReviewsInput: GetAllReviewsInput): ReviewWithPagination
        getReviewsByDriverId(getReviewsByDriverIdInput: GetReviewsByDriverIdInput): ReviewWithPaginationAndFields 
        getDriverRating: RatingResult
        getReviewByRequestCode(requestCode: String): ReviewWithPopulatedFields       
    }
    type Mutation {
        addReview(addReviewInput: AddReviewInput): Review        
    }    
`;
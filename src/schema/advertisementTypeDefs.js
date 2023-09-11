export const advertisementTypeDefs = `#graphql
    scalar Date    
    type Advertisement {
        _id: ID!
        createdAt: Date
        title: String
        description: String
        imageURL: String
        link: String
        from: Date
        to: Date
        position: [String]
    }
    type AdvertisementDeleteResponse {        
        AdvertisementStatus: AdvertisementDeleteStatus
        message: String
    }
    type AdvertisementDeleteStatus { 
        acknowledged: Boolean
        deletedCount: Int
    }

    input AddAdvertisementInput {
        title: String
        description: String
        imageURL: String
        link: String
        from: Date
        to: Date
        position: [String]
    }
    
    type Query {
        getAllAdvertisements: [Advertisement]       
    }
    type Mutation {
        addAdvertisement(addAdvertisementInput: AddAdvertisementInput): Advertisement
        deleteAdvertisement(id: ID!): AdvertisementDeleteResponse        
    }    
`;
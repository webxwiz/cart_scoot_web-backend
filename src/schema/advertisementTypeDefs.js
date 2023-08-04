export const advertisementTypeDefs = `#graphql
    scalar Date    
    type Advertisement {
        title: String
        description: String
        imageURL: String
        link: String
        from: Date
        to: Date
    }
    type CreateAdvertisement {
        _id: ID!
        createdAt: Date
        title: String
        description: String
        imageURL: String
        link: String
        from: Date
        to: Date
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
    }
    
    type Query {
        getAllAdvertisements: [Advertisement]       
    }
    type Mutation {
        addAdvertisement(addAdvertisementInput: AddAdvertisementInput): CreateAdvertisement
        deleteAdvertisement(id: ID!): AdvertisementDeleteResponse        
    }    
`;
export const advertisementTypeDefs = `#graphql
    scalar Date
    enum PageTypes {
        MAIN
        MAP
        TRIP
    }   
    type Advertisement {
        _id: ID!
        createdAt: Date
        title: String
        description: String
        imageURL: String
        link: String
        from: Date
        to: Date
        position: PageTypes
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
        position: PageTypes
    }
    
    type Query {
        getAllAdvertisements: [Advertisement]
        getAdvertisementById(adsId: ID!): Advertisement

        getPageAdvertisement(position: PageTypes): Advertisement      
    }
    type Mutation {
        addAdvertisement(addAdvertisementInput: AddAdvertisementInput): Advertisement
        deleteAdvertisement(id: ID!): AdvertisementDeleteResponse        
    }    
`;
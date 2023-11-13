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
        imageURL: ImageTypes
        link: String
        from: Date
        to: Date
        position: PageTypes
    }
    type ImageTypes {
        desktop: String
        tablet: String
        mobile: String
    }
    type AdvertisementDeleteResponse {        
        AdvertisementStatus: AdvertisementDeleteStatus
        message: String
    }
    type AdvertisementDeleteStatus { 
        acknowledged: Boolean
        deletedCount: Int
    }
    type AdvertisementsWithLimit {
        advertisements: [Advertisement]
        totalCount: Int
    }

    input AddAdvertisementInput {
        title: String
        description: String
        imageURL: ImageTypesInput
        link: String
        from: Date
        to: Date
        position: PageTypes
    }
    input ImageTypesInput {
        desktop: String
        tablet: String
        mobile: String
    }
    input UpdateAdvertisementInput {
        _id: ID!
        data: AddAdvertisementInput
    }
    
    type Query {
        getAllAdvertisements(pageNumber: Int): AdvertisementsWithLimit
        getAdvertisementById(adsId: ID!): Advertisement

        getPageAdvertisement(position: PageTypes): Advertisement      
    }
    type Mutation {
        addAdvertisement(addAdvertisementInput: AddAdvertisementInput): Advertisement
        updateAdvertisement(updateAdvertisementInput: UpdateAdvertisementInput): Advertisement
        deleteAdvertisement(id: ID!): AdvertisementDeleteResponse        
    }    
`;
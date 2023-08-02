export const userTypeDefs = `#graphql
    scalar Date
    enum RoleTypes {
        ADMIN
        DRIVER
        RIDER
    }    
    type User {
        _id: ID!
        createdAt: Date                    
        userName: String!
        email: String!
        resetPassword: ResetPasswordTypes
        avatarURL: String        
        role: RoleTypes
        license: licenseTypes
        driverRequests: [String]
        workingDays: [Int]
        workingTime: workingTimeTypes          
    }
    type ResetPasswordTypes {
        token: String
        expire: Date
        changed: Date
    }
    type licenseTypes {
        text: String
        licenseURL: String
    }
    type workingTimeTypes {
        from: Int
        to: Int
    }
    type UserWithToken {
        user: User        
        token: String
        message: String              
    }    
    type UserDeleteResponse {        
        userStatus: UserDeleteStatus
        message: String
    }
    type UserDeleteStatus { 
        acknowledged: Boolean
        deletedCount: Int
    }
    type UserPasswordResponse {
        status: Boolean
        message: String
    }
    type ResetPasswordResponse {
        status: String
        message: String
    }       
    
    input RegisterUserInput {        
        userName: String!
        email: String!
        password: String!
        role: RoleTypes               
    }
    input UserSetPasswordInput {
        token: String!
        password: String!
    }
    input UpdateWorkingTimeInput {
        workingDays: [Int]
        workingTime: WorkingTimeInput
    }
    input WorkingTimeInput {
        from: Int
        to: Int
    }

    type Query {
        getUserByToken: User        
        getFreeDrivers(requestedTime: Date): [User]
        getDriverProfile(id: ID!): User   
    }
    type Mutation {
        registerUser(registerUserInput: RegisterUserInput): UserWithToken
        
        login(email: String!, password: String!): UserWithToken

        resetPassword(email: String!): ResetPasswordResponse
        setNewPassword(setPasswordInput: UserSetPasswordInput): UserPasswordResponse
        deleteUser(_id: ID!): UserDeleteResponse
        confirmPassword(password: String!): UserPasswordResponse
        updatePassword(password: String!): UserPasswordResponse
        updateWorkingTime(updateWorkingTimeInput: UpdateWorkingTimeInput): User

    }    
`;
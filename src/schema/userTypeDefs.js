export const userTypeDefs = `#graphql
    scalar Date
    enum RoleTypes {
        ADMIN
        DRIVER
        PASSENGER
    }    
    type User {
        _id: ID!
        createdAt: Date                    
        userName: String!
        email: String!
        resetPassword: ResetPasswordTypes
        avatarURL: String        
        role: RoleTypes               
    }
    type ResetPasswordTypes {
        token: String
        expire: Date
        changed: Date
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

    type Query {
        getUserByToken: User        
    }
    type Mutation {
        registerUser(registerUserInput: RegisterUserInput): UserWithToken
        
        login(email: String!, password: String!): UserWithToken

        resetPassword(email: String!): ResetPasswordResponse
        setNewPassword(setPasswordInput: UserSetPasswordInput): UserPasswordResponse
        deleteUser(_id: ID!): UserDeleteResponse
        confirmPassword(password: String!): UserPasswordResponse
        updatePassword(password: String!): UserPasswordResponse      
    }    
`;
export const userTypeDefs = `#graphql
    scalar Date
    enum RoleTypes {
        ADMIN
        DRIVER
        RIDER
        SUBADMIN
        BANNED
    }
    enum StatusTypes {
        PENDING
        WAITING
        APPROVED
        REJECTED
    }   
    type User {
        _id: ID!
        createdAt: Date                    
        userName: String
        email: String
        coordinates: DriverCoordinates
        banned: Boolean         
        resetPassword: ResetPasswordTypes
        avatarURL: String        
        license: LicenseTypes
        role: RoleTypes
        driverRequests: [String]
        workingDays: [Int]
        workingTime: WorkingTimeTypes
        phone: PhoneTypes
    }
    type Driver {
        _id: ID!
        avatarURL: String
        userName: String
        coordinates: DriverCoordinates
        phone: PhoneTypes
        role: RoleTypes
        banned: Boolean
        workingDays: [Int]
        workingTime: WorkingTimeTypes
    }
    type Rider {
        _id: ID!
        avatarURL: String
        driverRequests: [String]
        email: String
        phone: PhoneTypes
        role: RoleTypes
        banned: Boolean
        userName: String
    }
    type DriverWithRating {
        driver: Driver
        rating: Float
    }
    type UserWithRating {
        driver: User
        rating: Float
        totalCount: Int
    }
    type ResetPasswordTypes {
        token: String
        expire: Date
        changed: Date
    }
    type LicenseTypes {
        url: [String]
        message: String
        status: StatusTypes
    }
    type WorkingTimeTypes {
        from: Float
        to: Float
    }
    type PhoneTypes {
        number: String
        confirmed: Boolean
    }
    type DriverCoordinates {
        lat: Float
        lon: Float
    }
    type UserWithToken {
        user: User        
        token: String
        message: String              
    }
    type UserWithMessage {
        user: User        
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
    type UsersWithPagination {
        users: [User]
        totalCount: Int
    }     
    type RidersWithPagination {
        users: [Rider]
        totalCount: Int
    }
    type Statistic {
        totalRiders: Int
        totalDrivers: Int
        totalTrips: Int
    }   
    
    input GetFreeDriversInput {
        requestedTime: Date
    }
    input GetAllUsersInput {
        pageNumber: Int 
        searchUserName: String
        status: StatusTypes
    }
    input RegisterUserInput {        
        userName: String!
        email: String!
        password: String!
        role: RoleTypes               
    }
    input RegisterByPhoneInput {
        phone: String!
        userName: String
    }
    input FullRegisterByPhoneInput {
        phone: String!
        userName: String
        role: RoleTypes
    }
    input LoginByPhoneInput {
        phone: String!
        smsCode: String!
    }
    input ChangePasswordInput {
        currentPassword: String!
        password: String!
    }
    input UserSetPasswordInput {
        token: String!
        password: String!
    }
    input ChangeUserNameInput {
        userName: String!
    }
    input UpdateWorkingTimeInput {
        workingDays: [Int]
        workingTime: WorkingTimeInput
    }
    input WorkingTimeInput {
        from: Float
        to: Float
    }
    input ChangeUserRoleInput {
        id: ID!
        role: String
    }
    input AnswerDriverLicenseInput {
        driverId: ID!
        answer: Boolean
    }
    input UpdateCoordinatesInput {
        coordinates: DriverCoordinatesInput
    }
    input DriverCoordinatesInput {
        lat: Float
        lon: Float
    }

    type Query {
        getUserByToken: User        
        getFreeDrivers(getFreeDriversInput: GetFreeDriversInput): [DriverWithRating]
        getDriverWithRating(driverId: ID!): UserWithRating        
 
        getStatistic: Statistic
        getAllDrivers(getAllUsersInput: GetAllUsersInput): UsersWithPagination
        getAllRiders(getAllUsersInput: GetAllUsersInput): RidersWithPagination
        
        getWaitingLicenses: [User]
    }
    type Mutation {
        registerByEmail(registerUserInput: RegisterUserInput): UserWithToken        
        loginByEmail(email: String!, password: String!): UserWithToken

        fullRegisterByPhone(fullRegisterByPhoneInput: FullRegisterByPhoneInput): UserWithMessage
        registerByPhone(registerByPhoneInput: RegisterByPhoneInput): UserWithMessage        
        loginByPhone(loginByPhoneInput: LoginByPhoneInput): UserWithToken

        addMobilePhone(phone: String!): User
        confirmMobilePhone(smsCode: String!): User

        changePassword(changePasswordInput: ChangePasswordInput): UserPasswordResponse
        resetPassword(email: String!): UserPasswordResponse
        setNewPassword(setPasswordInput: UserSetPasswordInput): UserPasswordResponse

        changeUserName(changeUserNameInput: ChangeUserNameInput): User
        deleteUser(_id: ID!): UserDeleteResponse
        updateWorkingTime(updateWorkingTimeInput: UpdateWorkingTimeInput): User

        changeUserRole(changeUserRoleInput: ChangeUserRoleInput): User
        answerDriverLicense(answerDriverLicenseInput: AnswerDriverLicenseInput): User
        changeUserStatus(_id: ID!, status: Boolean): User

        addCoordinates(updateCoordinatesInput: UpdateCoordinatesInput): User
    }    
`;
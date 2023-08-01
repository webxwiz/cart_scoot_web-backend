import * as yup from 'yup';
import { GraphQLError } from 'graphql';

const userSchema = yup.object().shape({
    userName: yup.string().min(3).max(100),
    email: yup.string().email().max(100),
    password: yup.string().min(8).max(100),
});

export const userValidate = async (validateData) => {
    try {
        await userSchema.validate(validateData)
    } catch (err) {
        throw new GraphQLError(err.message)
    };
};

import userModel from "../models/user.model.js";

export const findUserByEmail = (email) => {
    return userModel.findOne({email});
};

export const findUserByUsernameOrEmail = (username, email) =>{
    return userModel. findOne({
        $or: [
            {username},
            {email}
        ]
    });
};

export const createUser = (userData) => {
    return userModel.create(userData);
;}

export const findUserById = (id) => {
    return userModel.findById(id);
}

export const findUserWithoutPassword = (id) => {
    return userModel.findById(id).select("")
};

export const verifyUser = async (email) => {
    const user = await userModel.findOne({email});

    if(!user) {
        return null;
    }
    user.verified = true;
    return user.save();
}

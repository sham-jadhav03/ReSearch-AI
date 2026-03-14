import userMOdel from "../models/user.model";

const register = async () => {

    const {username, email, password} = req.body;

    const isUserAlreadyExist = await userMOdel.findOne({
        $or: [
            {username},
            {email}
        ]
    })

    if(isUserAlreadyExist) {
        return res.status(400).json({
            message: "User with this email or username already exists.",
            success: false,
            err: "User already exists"
        })
    }

    const user = await userMOdel.create({
        username, email, password
    })
    
}
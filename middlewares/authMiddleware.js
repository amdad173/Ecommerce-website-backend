import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";

// Protected routes token base
export const requireSignIn = async (req, res, next)=>{
    try{
        const decode = JWT.verify(
            req.headers.authorization,
            process.env.JWT_SECRET
        );

        req.user = decode;
        next();
    }catch(err){
        console.log(err);
        res.status(401).send({
            success: false,
            message: "Error in Protected route cheker middleware",
            error: err
        });
    }
}

//Admin access
export const isAdmin = async (req, res, next) =>{
    try{
        const user = await userModel.findById(req.user._id);
        if(user.role !== 1){
            return res.status(401).send({
                success: false,
                message: "UnAuthorized Access"
            });

        } else{
            next();
        }
    }catch(e){
        console.log(e);
        res.status(401).send({
            success: false,
            message: "Error in Admin middleware",
            error: e
        });
    }
}
import { asyncHandler, ApiError, ApiResponse } from "../utils/index.js";
import { User, OTP } from "../models/index.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefreshTokens = async function(user) {
    try {
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;

        await user.save({ validateBeforeSave: false });

        return {accessToken, refreshToken};
    } catch (err) {
        throw new ApiError(500, "Something went wrong!");
    }
}

const register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if(!name?.trim() || !email?.trim() || !password?.trim()) {
        throw new ApiError(400, "All fields are required!");
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if(existingUser) {
        throw new ApiError(409, "User already exists!");
    }

    const newUser = await User.create({
        name, email, password
    });
    let otp;
    if(newUser) {
        otp = await OTP.create({
            email: email,
            otp: Math.floor(1000 + Math.random() * 9000)
        });
    }

    return res
        .status(201)
        .json(new ApiResponse
            (
                201,
                {
                    user: newUser,
                    otp: otp
                },
                "User registered successfully!"
            )
        )
});

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if(!email.trim() || !password.trim()) {
        throw new ApiError(400, 'All fields are required!')
    }

    // check if user exists
    const user = await User.findOne({email});
    if(!user) {
        throw new ApiError(404, 'User not found!');
    }

    /* Compare password
     * https://stackoverflow.com/questions/67756906/mongoose-schema-method-returning-is-not-a-function
     */
    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if(!isPasswordCorrect) {
        throw new ApiError(401, 'Wrong credentials!');
    }

    // genereate access and refresh tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user);

    const options = {
        secure: true,
        httpOnly: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, user, "Logged in successfully!"));

});

const logout = asyncHandler(async (req, res) => {

    User.findByIdAndUpdate(
        req.user?._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    );

    const options = {
        secure: true,
        httpOnly: true
    }

    return res
        .status(204)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(204, {}, "Logged out successfully!"));
});

const verifyAccount = asyncHandler(async (req, res) => {
    if(req.user.emailVerifiedAt) {
        throw new ApiError(400, 'Account already verified!');
    }

    const otpReceived = req.body.otp;
    if(!otpReceived) {
        throw new ApiError(400, 'OTP required!');
    }

    const otp = await OTP.findOne({ email: req.user.email }).sort({ createdAt: -1 });
    console.log(otp, otpReceived, req.user.email);
    if(!otp || otp.otp != otpReceived) {
        throw new ApiError(400, 'OTP is not valid!');
    }

    const user = req.user;
    user.emailVerifiedAt = Date.now();
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, 'Account verified successfully!'));
});

const resendOTP = asyncHandler(async (req, res) => {
    const otp = await OTP.create({
            email: req.user.email,
            otp: Math.floor(1000 + Math.random() * 9000)
        });

    return res
    .status(200)
    .json(new ApiResponse
        (
            200,
            { otp: otp.otp },
            "OTP send successfully"
        )
    );
});

export {
    login,
    logout,
    register,
    resendOTP,
    verifyAccount
};
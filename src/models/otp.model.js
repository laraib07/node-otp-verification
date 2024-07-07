import mongoose, { Schema } from 'mongoose';
import { mailSender } from '../services/mail.service.js';
import { ApiError } from "../utils/ApiError.js";

const otpSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: Number,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 5
    }
});

async function sendOTPVerificationMail(email, otp) {
    try {
        const response = await mailSender(
            email,
            "Verification Mail",
            `<h1>Please confirm your OTP</h1>
            <p>Here is your OTP code: ${otp}</p>`
        );
        return response;
    } catch (err) {
        throw new ApiError(500, 'Unable to send mail!');
    }
}

otpSchema.pre('save', async function(next) {
    if(this.isNew) {
        await sendOTPVerificationMail(this.email, this.otp);
    }
    next();
});

export const OTP = mongoose.model("OTP", otpSchema);
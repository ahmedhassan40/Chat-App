import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import AppError from "../utils/appError.js";
import crypto from "crypto";

const userSchema = mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Please Prodive your Fullname!"],
    },
    username: {
      type: String,
      required: [true, "Please Prodive your username!"],
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Please Prodive your email!"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please Provide a valid email"],
    },
    gender: {
      type: String,
      required: [true, "Please Prodive your gender!"],
      enum: ["male", "female", "gay"],
    },
    profilePic: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["client", "engineer", "admin"],
      default: "client",
    },
    password: {
      type: String,
      required: [true, "Please Provide Password"],
      minlength: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "please Confirm your password"],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: "passwords are not the same!!!",
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  uesrPassword
) {
  return await bcrypt.compare(candidatePassword, uesrPassword);
};

// for protected Route
userSchema.methods.passwordChangedAfterTokenIssued = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("User", userSchema);

export default User;

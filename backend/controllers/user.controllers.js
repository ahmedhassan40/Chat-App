import User from "../models/user.model.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";

const filterObj = (obj, ...allowedFields) => {
  const filteredObj = {};
  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) {
      filteredObj[key] = obj[key];
    }
  });
  return filteredObj;
};

export const updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      AppError(
        "This pass in not for update Password , you can use /updatePassword",
        400
      )
    );
  }

  const fitleredBody = filterObj(req.body, "fullName", "username");
  const updatedUser = await User.findByIdAndUpdate(req.user.id, fitleredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

export const deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(200).json({
    status: "success",
    data: null,
  });
});

export const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find(); // Fixed typo

  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});

export const getUsersForSidebar = catchAsync(async (req, res, next) => {
  const LoggedInuserId = req.user._id;
  const filteredusers = await User.find({ _id: { $ne: LoggedInuserId } });

  res.status(200).json({
    status: "success",
    data: {
      filteredusers,
    },
  });
});

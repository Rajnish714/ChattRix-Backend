import mongoose from "mongoose";


const userSchema = new mongoose.Schema(
  {

    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    
    profilePic: {
     type: String,
     default: "/assets/profile.png"
    },
    
    isVerified: {
      type: Boolean,
      default:false,
    }
  },
  { timestamps: true }
);


userSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.password;
    delete ret.__v;
    return ret;
  }
});

userSchema.set("toObject", {
  transform: function (doc, ret) {
    delete ret.password;
    delete ret.__v;
    return ret;
  }
});

export const User = mongoose.model("User", userSchema);

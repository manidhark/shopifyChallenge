const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  images: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "images",
    },
  ],
  cart: [{
      image:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "images",
      },
      quantity: {
        type: Number,
      }
  }],
  totalItems: {
    type: Number,
    default: 0
  }
});

const User = mongoose.model("users", UserSchema);

module.exports = User;

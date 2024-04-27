const productSchema = require("../mongoose.js");
const mongoose = require("mongoose");

const modal = {
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  productStatus: {
    type: String,
    enum: ["available", "unavailable", "deleted"],
    default: "available",
  },
  images: {
    type: Array,
    require: true,
  },
  keywords: {
    type: Array,
    require: true,
  },
  productType: {
    type: String,
    require: true,
  },
  condition: {
    type: String,
    require: true,
  },
  batteryHealth: {
    type: Number,
  },
  title: {
    type: String,
    require: true,
  },
  description: {
    type: String,
    require: true,
  },
  price: {
    type: String,
    require: true,
  },
  quantity: {
    type: Number,
    default: 1,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
};

module.exports = productSchema.modelMake(
  "Product",
  productSchema.schemaMake(modal)
);

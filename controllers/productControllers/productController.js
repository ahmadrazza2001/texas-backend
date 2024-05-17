const ErrorHandler = require("../../config/ErrorHandler");
const catchAsyncError = require("../../config/catchAsyncErrors");
const Product = require("../../models/productModel/productModel");
const User = require("../../models/userModel/userModel");

//create product
exports.createProduct = catchAsyncError(async (req, res, next) => {
  const {
    title,
    description,
    price,
    keywords,
    images,
    condition,
    batteryHealth,
    productType,
  } = req.body;
  try {
    const newProduct = new Product({
      userId: req.userData.user.id,
      title,
      description,
      price,
      keywords,
      images,
      condition,
      batteryHealth,
      productType,
    });
    const saved = await newProduct.save();

    if (!saved) {
      return next(new ErrorHandler("Trouble creating a new product", 400));
    }
    const userUpdateField = saved.status === "" ? "" : "myProducts";

    await User.findByIdAndUpdate(req.userData.user.id, {
      $push: { [userUpdateField]: saved._id },
    });

    return res.status(201).json({
      status: "success",
      message: "Product created successfully",
    });
  } catch (error) {
    console.error(error);
    return next(
      new ErrorHandler(error.message, error.statusCode || error.code)
    );
  }
});
//edit product
exports.updateProduct = catchAsyncError(async (req, res, next) => {
  const userId = req.userData.user.id;
  const id = req.params.id;
  const {
    title,
    description,
    price,
    keywords,
    images,
    condition,
    batteryHealth,
    productType,
    productStatus,
  } = req.body;
  try {
    let product = await Product.findById(id);
    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }
    if (userId.toString() !== product.userId.toString()) {
      return next(
        new ErrorHandler("You are not authorized to update this product", 400)
      );
    }
    product.title = title;
    product.description = description;
    product.price = price;
    product.keywords = keywords;
    product.images = images;
    product.condition = condition;
    product.batteryHealth = batteryHealth;
    product.productType = productType;
    product.productStatus = productStatus;
    let saved = await product.save();
    if (!saved) {
      return next(new ErrorHandler("Error updating the product", 400));
    }
    return res
      .status(200)
      .json({ status: "success", message: "Product updated successfully" });
  } catch (error) {
    return next(
      new ErrorHandler(error.message, error.statusCode || error.code)
    );
  }
});
//delete product
exports.deleteProduct = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;
  const userId = req.userData.user.id;
  try {
    let product = await Product.findOne({
      _id: id,
      productStatus: { $ne: "deleted" },
    });
    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }
    if (product.userId.toString() !== userId.toString()) {
      return next(
        new ErrorHandler("You are not Authorized to delete this Product", 401)
      );
    }
    let deleted = await Product.findByIdAndUpdate(id, {
      productStatus: "deleted",
    });
    console.log(deleted);
    if (!deleted) {
      return next(new ErrorHandler("Error deleting this product", 400));
    }
    await User.updateMany(
      {
        $or: [{ available: id }, { unavailable: id }, { deleted: id }],
      },
      {
        $pull: {
          available: id,
          unavailable: id,
          deleted: id,
        },
      }
    );
    return res
      .status(200)
      .json({ status: "success", message: "Product deleted successfully" });
  } catch (error) {
    return next(
      new ErrorHandler(error.message, error.statusCode || error.code)
    );
  }
});
//search product
exports.searchProduct = catchAsyncError(async (req, res, next) => {
  const productType = req.query.productType; // Assuming productType is provided in the query parameter
  try {
    let products = await Product.find({
      productType: productType,
      productStatus: "available",
    }).populate("userId", ["username", "firstName", "lastName"]);

    if (products.length === 0) {
      return next(new ErrorHandler("Products not found!", 404));
    }

    return res.status(200).json({
      status: "success",
      message: "Products found!",
      body: products,
    });
  } catch (error) {
    return next(
      new ErrorHandler(error.message, error.statusCode || error.code)
    );
  }
});

exports.myProducts = catchAsyncError(async (req, res, next) => {
  const userId = req.userData.user.id;
  try {
    const user = await User.findById(userId).select("myProducts");

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }
    const myProductIds = user.myProducts;
    const products = await Product.find({
      _id: { $in: myProductIds },
      productStatus: "available",
    }).populate("userId", "firstName lastName username createdAt");

    if (!products || products.length === 0) {
      return next(new ErrorHandler("No public products found", 404));
    }

    return res.status(200).json({
      status: "success",
      message: "My Products Found!",
      body: products,
    });
  } catch (error) {
    return next(
      new ErrorHandler(error.message, error.statusCode || error.code)
    );
  }
});

exports.allProducts = catchAsyncError(async (req, res, next) => {
  try {
    const products = await Product.find().populate("userId", "shopAddress");

    console.log(products);

    if (!products.length) {
      return next(new ErrorHandler("No products found", 404));
    }

    return res.status(200).json({
      status: "success",
      message: "Products Found!",
      body: products,
    });
  } catch (error) {
    console.error("Error in fetching products:", error);
    return next(
      new ErrorHandler(error.message, error.statusCode || error.code)
    );
  }
});

exports.getProductDetails = catchAsyncError(async (req, res, next) => {
  const productId = req.params.id;

  try {
    const product = await Product.findById(productId).populate(
      "userId",
      "shopAddress username email phone"
    );
    console.log("product details:", product);

    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    res.status(200).json({
      status: "success",
      message: "Product details fetched successfully",
      product,
    });
  } catch (error) {
    console.error("Error in fetching product details:", error);
    return next(
      new ErrorHandler(error.message, error.statusCode || error.code)
    );
  }
});

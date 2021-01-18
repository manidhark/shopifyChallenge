const express = require("express");
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require("../config/auth");
const multer = require("multer");
const path = require("path");
const Image = require("../models/image");
const User = require("../models/user");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads/");
  },

  // By default, multer removes file extensions so let's add them back
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

// Dashboard
router.get("/upload", ensureAuthenticated, (req, res) => {
  res.render("upload");
});

router.get("/my", ensureAuthenticated, (req, res) => {
  Image.find({ author: req.user._id })
    .populate("author", "name _id")
    .then((result) => {
      res.render("my", {
        images: result,
      });
    })
    .catch((error) => {
      res.send(error.message);
    });
});

router.post("/search", ensureAuthenticated, (req, res) => {
  Image.find({ $text: { $search: req.body.search } })
    .populate("author", "name _id")
    .then((result) => {
      res.render("search", {
        images: result,
        search: req.body.search,
      });
    })
    .catch((error) => {
      res.send(error.message);
    });
});

router.post("/add", ensureAuthenticated, (req, res) => {
  Image.findOne({ _id: req.body.id })
    .populate("author", "name _id")
    .then((result) => {
      User.findOne({ _id: req.user._id })
        .then((userDetails) => {
          var items = userDetails.cart;
          var flag = false;
          for (var i = 0; i < items.length; i++) {
            if (items[i].image == req.body.id) {
              items[i].quantity = items[i].quantity + 1;
              flag = true;
              break;
            }
          }
          if (flag) {
            User.update(
              { _id: req.user._id },
              { $set: {cart: items, totalItems: userDetails.totalItems + 1} }
            )
              .then((result) => {
                res.redirect("/dashboard");
              })
              .catch((error) => {
                res.send(error.message);
              });
          } else {
            const item = {
              image: req.body.id,
              quantity: 1,
            };
            User.update({ _id: req.user._id }, { $addToSet: { cart: item } })
              .then((result) => {
                User.update(
                  { _id: req.user._id },
                  { $set: {totalItems: userDetails.totalItems + 1} }
                )
                  .then((result) => {
                    res.redirect("/dashboard");
                  })
                  .catch((error) => {
                    res.send(error.message);
                  });
              })
              .catch((error) => {
                res.send(error.message);
              });
          }
        })
        .catch((error) => {
          res.send(error.message);
        });
    })
    .catch((error) => {
      res.send(error.message);
    });
});

router.post("/cart/add", ensureAuthenticated, (req, res) => {
  Image.findOne({ _id: req.body.id })
    .populate("author", "name _id")
    .then((result) => {
      User.findOne({ _id: req.user._id })
        .then((userDetails) => {
          var items = userDetails.cart;
          var flag = false;
          for (var i = 0; i < items.length; i++) {
            if (items[i].image == req.body.id) {
              items[i].quantity = items[i].quantity + 1;
              flag = true;
              break;
            }
          }
          if (flag) {
            User.update(
              { _id: req.user._id },
              { $set: {cart: items, totalItems: userDetails.totalItems + 1} }
            )
              .then((result) => {
                res.redirect("/image/cart");
              })
              .catch((error) => {
                res.send(error.message);
              });
          }
        })
        .catch((error) => {
          res.send(error.message);
        });
    })
    .catch((error) => {
      res.send(error.message);
    });
});

router.post("/cart/delete", ensureAuthenticated, (req, res) => {
  Image.findOne({ _id: req.body.id })
    .populate("author", "name _id")
    .then((result) => {

      User.findOne({ _id: req.user._id })
        .then((userDetails) => {
          var items = userDetails.cart;
          var index = 0;
          for (var i = 0; i < items.length; i++) {
            if (items[i].image == req.body.id) {
              index = i;
              break;
            }
          }

          if (items[i].quantity > 1) {
            items[i].quantity=items[i].quantity-1;
            User.update(
              { _id: req.user._id },
              { $set: {cart: items, totalItems: userDetails.totalItems - 1} }
            )
              .then((result) => {
                res.redirect("/image/cart");
              })
              .catch((error) => {
                res.send(error.message);
              });
          } else {
            // items.slice(index,1);
            // console.log(items);
            console.log("id"+[items[i]]);
            User.update(
              { _id: req.user._id },
              { $pull: {cart: { _id: items[i]._id}} }
            )
              .then((result) => {
                User.update(
                  { _id: req.user._id },
                  { $set: {totalItems: userDetails.totalItems - 1} }
                )
                  .then((result) => {
                    res.redirect("/image/cart");
                  })
                  .catch((error) => {
                    res.send(error.message);
                  });
              })
              .catch((error) => {
                res.send(error.message);
              });
          }
        })
        .catch((error) => {
          res.send(error.message);
        });
    })
    .catch((error) => {
      res.send(error.message);
    });
});

router.post("/cart/payment", (req, res) => {
  User.findOne({ _id: req.user._id })
    .then(userDetails => {
      // User.update({ _id: req.user._id }, { $pull: {cart: { _id: []} }})
      //   .then(result => {
          User.update({ _id: req.user._id }, { $set: { cart: [],totalItems: 0}})
            .then(result => {
              res.render('checkout');
            })
            .catch(error => {
              res.send(error.message);
            });
        // })
        // .catch(error => {
        //   res.send(error.message);
        // });
    })
    .catch(error => {
      res.send(error.message);
    });
});

router.get("/cart", ensureAuthenticated, (req, res) => {
  User.findOne({ _id: req.user._id })
    .populate("cart.image", "name _id price description imageFile author")
    .then((userDetails) => {
      res.render("cart", {
        images: userDetails.cart,
        totalItems: userDetails.totalItems,
      });
    })
    .catch((error) => {
      res.send(error.message);
    });
});

router.post("/delete", ensureAuthenticated, (req, res) => {
  Image.findOne({ _id: req.body.id })
    .then((imageDetails) => {
      User.findOne({ _id: req.user._id })
        .then((userDetails) => {
          if (
            userDetails.images.includes(req.body.id) &&
            imageDetails.author.equals(req.user._id)
          ) {
            fs.unlink("./public/uploads/" + imageDetails.imageFile, (err) => {
              if (err) {
                res.send("error occured");
              } else {
                Image.deleteOne({ _id: req.body.id })
                  .then((result) => {
                    User.update(
                      { _id: req.user._id },
                      { $pull: { images: req.body.id } }
                    )
                      .then((result) => {
                        res.redirect("/image/my");
                      })
                      .catch((error) => {
                        res.send(error.message);
                      });
                  })
                  .catch((error) => {
                    res.send(error.message);
                  });
              }
            });
          } else {
            res.send("Forbidden");
          }
        })
        .catch((error) => {
          res.send(error.message);
        });
    })
    .catch((error) => {
      res.send(error.message);
    });
});

const imageFilter = function (req, file, cb) {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
    req.fileValidationError = "Only image files are allowed!";
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};

// const upload = multer({ storage: storage, fileFilter: imageFilter }).single('imageFile');

router.post("/upload-image", (req, res) => {
  // 'profile_pic' is the name of our file input field in the HTML form
  let upload = multer({ storage: storage, fileFilter: imageFilter }).single(
    "imageFile"
  );

  upload(req, res, function (err) {
    // req.file contains information of uploaded file
    // req.body contains information of text fields, if there were any

    if (req.fileValidationError) {
      return res.send(req.fileValidationError);
    } else if (!req.file) {
      return res.send("Please select an image to upload");
    } else if (err instanceof multer.MulterError) {
      return res.send(err);
    } else if (err) {
      return res.send(err);
    }

    const newImage = {
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      imageFile: req.file.filename,
      author: req.user._id,
    };
    try {
      Image.insertMany([newImage])
        .then((imageResult) => {
          User.update(
            { _id: req.user._id },
            { $addToSet: { images: imageResult[0]._id } }
          )
            .then((result) => {
              res.render("single", {
                image: imageResult[0],
              });
            })
            .catch((error) => {
              res.send(error.message);
            });
        })
        .catch((error) => {
          res.send(error.message);
        });
    } catch (error) {
      res.send(error.message);
    }

    // Display uploaded image for user validation
    //   res.send(`You have uploaded this image: <hr/><img src="../uploads/${req.file.filename}" width="500"><hr /><a href="./">Upload another image</a>`);
  });
});

module.exports = router;

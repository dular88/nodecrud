const express = require("express");
const router = express.Router();
const User = require("../models/user");
const multer = require("multer");
const fs = require("fs");

const storage = multer.diskStorage({
     destination : (req, file, cb)=>{
          cb(null, "./uploads");
     },
     filename:(req, file, cb)=>{
          cb(null, file.fieldname+"_"+Date.now()+"_"+file.originalname);
     }
});

const upload = multer({storage:storage}).single("image");

router.get("/", async (req, res) => {
     try {
         const users = await User.find().exec(); // Fetch all users
         res.render("index", { title: "User List", users });
     } catch (err) {
         res.json({ message: err.message, type: "danger" });
     }
 });

router.get("/add", (req, res)=>{
     res.render("add_users", {title: "Add Users"});
});

router.post("/add", upload, async (req, res)=>{
     try {
          const user = new User({
               name: req.body.name,
               email: req.body.email,
               phone: req.body.phone,
               image: req.file.filename
          });
     
        await user.save();
        req.session.message = {
          message: "User added successfully",
          type: "success" 
     }
     res.redirect("/");
     } catch (error) {
          res.json({message:error.message, type: "danger"});
     }
});

router.get("/edit/:id", async(req, res)=>{
     try {
          let id = req.params.id;
          const user = await User.findById(id).exec();
          if(!user){
               res.redirect("/");
          }
          res.render("edit_user",{title: "Edit User", user:user});
     } catch (error) {
          res.redirect("/");
     }
});

router.post("/update/:id", upload, async (req, res)=>{
     try {
          let id = req.params.id;
          let new_image = "";

          if (req.file) {
               new_image = req.file.filename;
   
               // Attempt to delete the old image if it exists
               const oldImagePath = "./uploads/" + req.body.old_image;
               if (fs.existsSync(oldImagePath)) {
                   try {
                       fs.unlinkSync(oldImagePath);
                   } catch (err) {
                       console.error("Error deleting old image:", err.message);
                   }
               } else {
                   console.warn("Old image not found:", oldImagePath);
               }
           } else {
               // Retain the old image if no new file is uploaded
               new_image = req.body.old_image;
           }

        const update = await  User.findByIdAndUpdate(id, {
               name:req.body.name,
               email:req.body.email,
               phone:req.body.phone,
               image:new_image
          }).exec();
          if(update){
               req.session.message = {
                    type:"success",
                    message: "User updated successfully"
               }
               res.redirect("/");
          }
          

     } catch (error) {
          req.session.message = {
               type: "danger",
               message: "An error occurred while updating the user"
           };
           res.redirect("/");
     }
});


router.get("/delete/:id", async (req, res)=>{
     try {
          let id = req.params.id;
     const user = await User.findById(id);
     if(!user){
          req.session.message = {
               type:"danger",
               message: "User not found"
          }
          res.redirect("/");
     }

     if(user.image){
          const imagePath = "./uploads/"+user.image;
          if(fs.existsSync(imagePath)){
               try {
                    fs.unlinkSync(imagePath);
               } catch (error) {
                    console.error(error.message);
               }
          }else{
               console.warn("Image not found", imagePath);
          }

          await User.findByIdAndDelete(id);
          req.session.message = {
               type : "success",
               message : " Successfully Delete"
                }
          }

          res.redirect("/");
     } catch (error) {
          console.error("Error deleting user:", error.message);

        req.session.message = {
            type: "danger",
            message: "An error occurred while deleting the user"
        };

        res.redirect("/");
     }
     
});

module.exports = router;
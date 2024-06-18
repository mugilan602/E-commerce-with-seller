require('dotenv').config()
const express=require("express");
const app=express();
const mongoose=require("mongoose")
const productRoutes=require("./routes/productRoutes.js")
const userRoutes=require("./routes/userRoutes.js")
const sellerRoutes=require("./routes/sellerRoutes.js")
app.use(express.json())
app.use((req,res,next)=>{
    console.log(req.path,req.method);
    next();
})
app.use("/api/product",productRoutes)
app.use("/api/user",userRoutes)
app.use("/api/seller",sellerRoutes)

app.get("/",(req,res)=>{
  res.send("HI working")
})

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('connected to database')
    // listen to port
    app.listen(process.env.PORT, () => {
      console.log('listening for requests on port', process.env.PORT)
    })
  })
  .catch((err) => {
    console.log(err)
  }) 

// import the packages
const express = require("express");
const cors = require("cors");
const dotenv = require('dotenv');
const mongoose = require('mongoose')

//serving and storing media

const crypto = require('crypto') // <---- built-in nodejs package
const path = require('path')
const GridFsStorage = require('multer-gridfs-storage')
const multer = require('multer')
const Grid = require('gridfs-stream')

// import custom functions

const connectDB= require('./services/db')

// import environmental variables into the application
dotenv.config();

const PORT = process.env.PORT || 5000;

// initialize an express instance
const app = express();

const init = async ()=>{



// specifiy what middlwares we are going to use
app.use(express.json());
app.use(express.urlencoded({ extended: false }))

app.use(cors());

// establish a connection wiht the database

await connectDB()

//GridFS & Multer


const conn = mongoose.connection

// create a stream connection with our cluster
const gfs = await Grid(conn.db,mongoose.mongo)

//name of the bucket where media is going to be retrieved
gfs.collection('media')


// secifying a storage location in our cluster for multer
const storage =  await  new GridFsStorage({
  db: conn.db,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename =
          buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename,
          bucketName: 'media'
        };
        return resolve(fileInfo);
      });
    });
  }
});

// inializing our multer storage
const upload = multer({ storage });

// route for uploading a file
app.post('/upload',upload.single('file'),(req,res)=>{

 res.json(req.file)
})

// route for fetching all the files from the media bucket

app.get('/files',async(req,res)=>{
try{
  const files =await gfs.files.find().toArray()

  res.json(files)

}catch(err){
  res.status(400).send(err)
}
 
  
})
// route for streaming a file
app.get('/read/:filename',async(req,res)=>{

  const{filename}= req.params
  try{
    const readstream = await gfs.createReadStream({filename})

    readstream.pipe(res)
  }catch(err){
    res.status(400).send(err)
  }

})
// route for deleting a file
app.delete('/delete/:filename',async(req,res)=>{
  const{filename}=req.params
  try{
  
  await gfs.files.remove({filename})
   
    res.status(200).end()
  }catch(err){
    res.status(400).send(err)
  }
})

}



init()



// serves the application at the defined port
app.listen(PORT, () => {
  console.log(`Server is running on : http://localhost:${PORT}`);
});

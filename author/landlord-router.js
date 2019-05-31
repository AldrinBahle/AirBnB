const router = require('express').Router();
const mongoose = require('mongoose');
const path = require('path');
const connect = require('../test/connection');
const user = require('../models/users-model')
const stripe = require('stripe')('sk_test_pROyKNm9zmYtv24W0nc7zOtv00nvLXaOl5 ')
const Rooms = mongoose.model('house');
const crypto = require('crypto');
 const multer = require('multer');
 const GridFsStorage = require('multer-gridfs-storage');
 const Grid = require('gridfs-stream');
 const mongodb = 'mongodb+srv://sbusiso:bheki24354!@airbnb-oojdr.mongodb.net/test?retryWrites=true';

mongoose.Promise = global.Promise;

router.get('/', (req, res)=>{
  Rooms.find({status: 'public'})
    .populate('user') 
    .then(newroom =>{
        res.render('landlord', {
            data: newroom
        });
        
    });
    gfs.files.find().toArray((err, files) => {
        // Check if files
        if (!files || files.length === 0) {
          res.render('add', { files: false });
        } else {
          files.map(file => {
            if (
              file.contentType === 'image/jpeg' ||
              file.contentType === 'image/png'
            ) {
              file.isImage = true;
            } else {
              file.isImage = false;
            }
          })
       
          res.render('add', { files: files });
       
        }
      });
})    


//show page 

router.get('/show/:id', (req, res ) =>{
    Rooms.findOne({
        _id: req.params.id
    })
    .populate('user')
    .then(show =>{
        res.render('show', {
            show: show
        });
    });
});

router.get('/add', (req, res)=>{
    res.render('add');
});

//edit router
router.get('/edit/:id', (req, res) =>{
    Rooms.findOne({_id: req.params.id})
    .then(edit => {
        res.render('edit', {
            edit: edit
        }).catch(err =>{
            console.log(err);
        });
    });
});

const con = mongoose.createConnection(mongodb, { useNewUrlParser: true });
    let gfs;
    con.once('open', ()=>{
        gfs= Grid(con.db, mongoose.mongo);
        gfs.collection('house');

    })
    //create storage engine
    const storage = new GridFsStorage({
        url: mongodb,
        file: (req, file) => {
          return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
              if (err) {
                return reject(err);
              }
              const filename = buf.toString('hex') + path.extname(file.originalname);
              const fileInfo = {
                filename: filename,
                bucketName: 'house'
              };
              resolve(fileInfo);
            }); 
          });
        }
      });
      const upload = multer({ storage });

router.post('/', upload.single('file'),(req, res)=>{
    const newRoom = {
        location: req.body.location,
        price: req.body.price,
        body: req.body.body,
        status: req.body.status,
        image: req.body.image,
        user: req.user.id
    }
   
    new Rooms(newRoom)
    .save()
    .then(house =>{
        res.redirect(`/landlord/show/${house.id}`);
    });
});

//get '/files'
router.get('/files', (req, res)=>{
    gfs.files.find().toArray((err, files) => {
        // Check if files
        if (!files || files.length === 0) {
          return res.status(404).json({
            err: 'No files exist'
          });
        }
        //files exist
        return res.json(files);
    })
})

//get '/files/:filename'
router.get('/files/:filename', (req, res)=>{
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
        // Check if file
        if (!file || file.length === 0) {
          return res.status(404).json({
            err: 'No file exists'
          });
        }
        // File exists
        return res.json(file);
      });
})

//get '/image/:filename'
router.get('/image/:filename', (req, res)=>{
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
        // Check if file
        if (!file || file.length === 0) {
          return res.status(404).json({
            err: 'No file exists'
          });
        }
        //check if image
      
    if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
        // Read output to browser
        const readstream = gfs.createReadStream(file.filename);
        readstream.pipe(res);
      } else {
        res.status(404).json({
          err: 'Not an image'
        });
      }
    });
})

router.delete('/files/:id', (req, res) => {
    gfs.remove({ _id: req.params.id, root: 'uploads' }, (err, gridStore) => {
      if (err) {
        return res.status(404).json({ err: err });
      }
  
      res.redirect('/');
    });
  });

router.get('/dashbord', (req, res)=>{
    Rooms.find({user: req.user.id})
        .populate('user')
        .then(rooms =>{
         res.render('dashbord', {
             data: rooms
         });
     });
});
//update edit form

router.put('/:id',(req, res)=>{
    Rooms.findOne({_id: req.params.id})
    .then(rooms =>{
        rooms.location = req.body.location,
        rooms.price = req.body.price,
        rooms.body = req.body.body;

        rooms.save()
        .then(rooms => {
            res.redirect('/landlord/dashbord');
        }).catch(err =>{
            console.log(err);
        });
    });
});
 
//delete landlord propatery
router.delete('/:id', (req, res) =>{
     Rooms.remove({_id: req.params.id})
     .then(()=>{
         res.redirect('/landlord/dashbord');
     })
});

router.post('/charge',(req, res)=>{
    const amount = 2000;
    stripe.customers.create({
        email: req.body.stripeEmail,
        source: req.body.stripeToken
    })
    .then(customer => stripe.charges.create({
        amount: amount,
        description: 'Airbnb',
        currency: 'zar',
        customer: customer.id
    }))
    .then(charge => res.render('success'))
}) 

     

    //   router.post('/landlord', upload.single('file'), (req, res)=>{
    //       res,json({file: req.file})
    //   })





module.exports = router;
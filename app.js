const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const { body , validationResult, check} = require('express-validator');
const methodOverride = require('method-override')
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');

// configurasi mongoDB
require('./utils/db');
const Contact = require('./model/contact');
// configurasi port
const app = express();
const port = 3000;

// Setup method override
app.use(methodOverride('_method')) 

// Setup EJS
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.use(express.static('public'))
app.use(express.urlencoded({ extended:true }));

// konfigurasi flash
app.use(cookieParser('secret'));
app.use(
   session({
      cookie: { maxAge: 6000},
      secret: 'secret',
      resave: true,
      saveUninitialized: true,
   })
);
app.use(flash());

// Halaman Home
app.get('/', (req, res) => {
    const mahasiswa = [
       {
          nama:'ilham',
          email:'ilham@gmail.com'
       },
       {
          nama:'apek',
          email:'apek@gmail.com'
       },
       {
          nama:'king',
          email:'king@gmail.com'
       }
    ];
 
    res.render('index', { 
       nama: 'ilham firmansyah', 
       title: 'Halaman Home',
       mahasiswa,
       layout:'layouts/main-layout.ejs'
    });
 });

 // Halaman about
 app.get('/about', (req, res) => {
    res.render('about', {
       layout:'layouts/main-layout.ejs',
       title: 'Halaman About'});
 });

 // Halaman contact
 app.get('/contact', async (req, res) => {
   // Contact.find().then((contact) => {
   //    res.send(contact)
   // })

    const contacts = await Contact.find();
 
    res.render('contact', {
    layout:'layouts/main-layout.ejs',
    title: 'Halaman contact',
    contacts,
    msg: req.flash('msg')
  });
 });

 // halaman form tambah data contact
app.get('/contact/add', (req, res) => {
   res.render('add-contact', {
      title: 'Form Tambah Data Contact',
      layout: 'layouts/main-layout'
   });     
});

// proses tambah data contact
app.post('/contact',[
   body('nama').custom(async (value) => {
      const dulikat = await Contact.findOne({ nama: value});
      if(dulikat) {
         throw new Error('Nama contact sudah digunakan!')
      }
      return true
   }),
   check('email', 'Email tidak valid!').isEmail(),
   check('nohp', 'no HP tidak valid').isMobilePhone('id-ID')
], (req, res) => {
   const errors = validationResult(req);
   if(!errors.isEmpty()){
     res.render('add-Contact', {
      title: 'Form Tambah Data Contact',
      layout: 'layouts/main-layout.ejs',
      errors: errors.array()
     })
   } else {
      Contact.insertMany(req.body, (error, result) => {
         req.flash('msg', 'Data contact berhasil ditambahkan!');
         res.redirect('/contact')
      });
   }
});

// proses delete contact
// app.get('/contact/delete/:nama', async (req, res) => {
//    const contact = await Contact.findOne({nama: req.params.nama})
//    // jika contact tidak ada
//    if (!contact) {
//       res.status(404);
//       res.send('<h1>404</h1>')
//    }else {
//       Contact.deleteOne({_id : contact._id}).then((result) => {
//          req.flash('msg', 'contact berhasil dihapus!');
//          res.redirect('/contact')
//       });
//    }
// });

app.delete('/contact', (req, res) => {
   Contact.deleteOne({ nama: req.body.nama}).then((result) => {
    req.flash('msg', 'Data contact berhasil dihapus!');
    res.redirect('/contact')
   });
});

// halaman form ubah data contact
app.get('/contact/edit/:nama', async (req, res) => {
   const contact = await Contact.findOne({ nama: req.params.nama});

    res.render('edit-contact', {
      title: 'Form Ubah Data Contact',
      layout: 'layouts/main-layout',
      contact,
   });     
});

// proses ubah data
app.put(
   '/contact',
  [
   body('nama').custom( async (value, { req }) => {
      const dulikat = await Contact.findOne({ nama: value})
      if(value !== req.body.oldNama && dulikat) {
         throw new Error('Nama contact sudah digunakan!')
      }
      return true
   }),
   check('email', 'Email tidak valid!').isEmail(),
   check('nohp', 'no HP tidak valid').isMobilePhone('id-ID')
], 
(req, res) => {
   const errors = validationResult(req);
   if(!errors.isEmpty()){
     res.render('edit-Contact', {
      title: 'Form Ubah Data Contact',
      layout: 'layouts/main-layout.ejs',
      errors: errors.array(),
      contact: req.body,
     });
   } else {
     Contact.updateOne(
      { _id: req.body._id},
      {
         $set: {
            nama: req.body.nama,
            email: req.body.email,
            nohp: req.body.nohp,
         },
      }
      ).then((result) => {
         // kirimkan flash message
      req.flash('msg', 'Data contact berhasil diupdate!');
      res.redirect('/contact')
     })  
   }
});

// halaman detail contact
app.get('/contact/:nama', async (req, res) => {
   const contact = await Contact.findOne({nama: req.params.nama});

   res.render('detail', {
   layout:'layouts/main-layout.ejs',
   title: 'Halaman Detail contact',
   contact,
 });
});

 

app.listen(port, () => {
    console.log(`Mongod Contact App | Listening at htttp:localhost:${port}`);
})
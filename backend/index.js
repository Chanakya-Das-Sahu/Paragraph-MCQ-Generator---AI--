const express = require('express');
const app = express();
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config()
app.use(cors());
app.use(express.json());

app.post('/htmlContent', (req, res) => {

   // console.log('mew',req.body)
   // return res.json({msg:'ok'})
   htmlContent = req.body.htmlContent;
   gmail = req.body.gmail;

// console.log('htmlContent', htmlContent)
   // console.log('process.env.pass', process.env.PASS)
   // return res.json({ msg: 'ok' })

   const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
         user: 'ccccsahu@gmail.com',
         pass: process.env.PASS
      }
   });

   const mailOptions = {
      from: 'ccccsahu@gmail.com',
      to: gmail,
      subject: 'AI Based MCQ Generator Result',
      html: htmlContent
   };



   transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
         console.error(error);
      } else {
         console.log('Email sent: ' + info.response);
         res.json({ msg: 'Result Sent' })
      }

   });


})

app.listen(3000, () => {
   console.log('Server is running on port 3000');
});
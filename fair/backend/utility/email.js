const nodemailer = require("nodemailer");
const config = require("../configs/config");
module.exports = async function emailSender(options) {   // emailSender fn bahar se call hoyega (koi 3rd person or anyone can use it) therfore module.exports
  //  1. transport => configuration
  // configurations set email
  const transport = nodemailer.createTransport({
    host: "smtp.gmail.com",   // iss email par nodemailer mail bhejega 
    service: "gmail",
    port: 2525,
    auth: {
      // email Id
      user: config.EMAIL_ID,
      // app password
      pass: config.EMAIL_PASSWORD
    }
  });
  //2. parameters
  const mailOptions = {
    from: options.from,         // options main define hoga from,to,subject etc
    to: options.to,
    subject: options.subject,
    html: options.html 
  }
  // 3. sendMail
  await transport.sendMail(mailOptions);
}
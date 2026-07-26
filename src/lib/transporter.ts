import nodemailer from "nodemailer";

  const EMAIL = process.env.EMAIL;
  const PASSWORD = process.env.PASSWORD;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL,
      pass: PASSWORD,
    },
  });


export {
  transporter
}
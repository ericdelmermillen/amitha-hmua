"use server";

import { ContactFormData } from "@/typing/interfaces";
import nodemailer from "nodemailer";

const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;


const sendContactFormMessage = async ({
  firstName,
  lastName,
  email,
  subject,
  message,
}: ContactFormData) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL,
      pass: PASSWORD,
    },
  });

  console.log("from contactActions")
  console.log(email)

  const submittedMessage = `
    <p>New Contact Form Submission:</p>
    <p><strong>From:</strong> ${firstName} ${lastName}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Subject:</strong> ${subject}</p>
    <p><strong>Message:</strong></p>
    <p>${message}</p>
  `;

  await transporter.sendMail({
    from: email,
    to: "amithamillensuwanta@gmail.com",
    subject: `Contact Form Submission: ${subject}`,
    text: "New Contact Form Submission",
    html: submittedMessage,
  });

  return {
    message: "Thanks! Your message to Amitha has been sent!",
  };
};

export { 
  sendContactFormMessage
}
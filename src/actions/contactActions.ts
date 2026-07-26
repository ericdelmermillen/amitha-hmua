"use server";

import { ContactFormData } from "@/typing/interfaces";
import { splitOnNewLine } from "@/utils/utils";
import { notificationEmailTemplate } from "@/templates/notificationEmailTemplate";
import nodemailer from "nodemailer";

const EMAIL = process.env.EMAIL;

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
      pass: process.env.PASSWORD,
    },
  });


  const formattedMessage = splitOnNewLine(message)
    .map((paragraph) => `<p>${paragraph}</p>`)
    .join("");

  const submittedMessageBody = `
    <p><strong>From:</strong> ${firstName} ${lastName}</p>

    <p><strong>Email:</strong> ${email}</p>

    <p><strong>Subject:</strong> ${subject}</p>

    <p><strong>Message:</strong></p>

    ${formattedMessage}
  `;

  const confirmationMessageBody = `
    <p>
      Thanks for reaching out to Amitha. Your message has been received and
      she will get back to you as soon as possible.
    </p>
  `;

  const submittedMessage = notificationEmailTemplate(
    "New Contact Form Submission",
    submittedMessageBody,
    "Regards"
  );

  const confirmationMessage = notificationEmailTemplate(
    `Hi ${firstName},`,
    confirmationMessageBody,
    "Thanks again"
  );

  await Promise.all([
    // Notification email to Amitha
    transporter.sendMail({
      from: EMAIL,
      replyTo: email,
      to: "amithamillensuwanta@gmail.com",
      subject: `Contact Form Submission: ${subject}`,
      text: "New Contact Form Submission",
      html: submittedMessage,
    }),

    // Confirmation email to inquirer
    transporter.sendMail({
      from: EMAIL,
      to: email,
      subject: "Thanks for contacting Amitha",
      text: "Your message has been received. Amitha will get back to you soon.",
      html: confirmationMessage,
    }),
  ]);

  return {
    message: "Thanks! Your message to Amitha has been sent!",
  };
};


export {
  sendContactFormMessage
};
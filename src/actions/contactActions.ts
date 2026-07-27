"use server";

import { ContactFormData } from "@/typing/interfaces";
import { notificationEmailTemplate } from "@/templates/notificationEmailTemplate";
import { transporter } from "@/lib/transporter";
import { 
  isValidEmail, 
  isValidFirstName, 
  isValidLastName, 
  isValidMessage, 
  isValidSubject 
} from "@/utils/utils";

const EMAIL = process.env.EMAIL;

const sendContactFormMessage = async ({
  firstName,
  lastName,
  email,
  subject,
  message,
}: ContactFormData) => {

  if (
    !isValidFirstName(firstName) ||
    !isValidLastName(lastName) ||
    !isValidEmail(email) ||
    !isValidSubject(subject) ||
    !isValidMessage(message)
  ) {
    throw new Error("Invalid form submission.");
  }

  const submittedMessageBody = `
    From: ${firstName} ${lastName}

    Email: ${email}

    Subject: ${subject}

    Message:

    ${message}
  `;

  const confirmationMessageBody = `
      Thanks for reaching out to Amitha. 

      Your message has been received and she will get back to you as soon as possible.
  `;

  const submittedMessage = notificationEmailTemplate(
    "New Contact Form Submission",
    submittedMessageBody,
    `Please follow up with the inquiry from ${firstName}`,
    "Admin"
  );

  const confirmationMessage = notificationEmailTemplate(
    `Hi ${firstName},`,
    confirmationMessageBody,
    "Thanks again"
  );

  try {
  await Promise.all([
    // Notification email to Amitha
    transporter.sendMail({
      from: EMAIL,
      replyTo: email,
      to: EMAIL,
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

    return { message: "Thanks! Your message to Amitha has been sent!" };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }

    throw new Error(
      "Unable to send your message right now. Please try again later."
    );
  }
};

export {
  sendContactFormMessage
};
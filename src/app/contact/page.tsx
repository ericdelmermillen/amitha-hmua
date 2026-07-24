import ContactForm from "@/components/ContactForm/ContactForm";
import "./ContactPage.scss";

const ContactPage = () => {
  return (
    <>
      <div className="contactPage">
        <div className="contactPage__inner">
          <ContactForm />
        </div>
      </div>
    </>
  );
};

export default ContactPage;
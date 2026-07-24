import './Footer.scss';

const Footer = () => {
  return (
    <>
      <footer className="footer">
        <div className="footer__inner">
          <p className="footer__text">
            &copy; Amitha Millen-Suwanta {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </>
  )};

export default Footer;
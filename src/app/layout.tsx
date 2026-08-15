import type { Metadata } from "next";
import { AppContextProvider } from "@/contexts/AppContext";
import { ColorThemeProvider } from "@/contexts/ColorThemeContext";
import { ModalContextProvider } from "@/contexts/ModalContext";
import { ToastProvider } from "@/providers/ToastProvider";
import Footer from "@/components/Footer/Footer";
import IsLoading from "@/components/IsLoading/IsLoading";
import Modal from "@/components/Modal/Modal";
import Nav from "@/components/Nav/Nav";
import SideNav from "@/components/SideNav/SideNav";
import TouchOffDiv from "@/components/TouchOffDiv/TouchOffDiv";
import "./globals.scss";
import FloatingButton from "@/components/FloatingButton/FloatingButton";


const RootLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <head>
        <script
          id="themeScript"
          dangerouslySetInnerHTML={{
            __html: `
              (() => {
                try {
                  let colorMode = localStorage.getItem("colorMode");

                  if (!colorMode) {
                    colorMode = "light";
                    localStorage.setItem("colorMode", colorMode);
                  };

                  document.documentElement.setAttribute(
                    "data-color-mode",
                    colorMode
                  );
                } catch {
                  document.documentElement.setAttribute(
                    "data-color-mode",
                    "light"
                  );
                }
              })();
            `
          }}
        />
      </head>

      <body>
        <AppContextProvider>
          <ColorThemeProvider>
            <ModalContextProvider>
          
              <IsLoading/>
              <TouchOffDiv />
              <Nav />
              <SideNav />
              <Modal />
              {children}
              <FloatingButton />
              <Footer />
              <ToastProvider />

            </ModalContextProvider>
          </ColorThemeProvider>
        </AppContextProvider>
      </body>
    </html>
  );
};

export default RootLayout;

export const metadata: Metadata = {
  title: "Amitha HMUA Portfolio",
  description: "Portfolio Website of Amitha Millen-Suwanta Hair & Makeup Artist",
  icons: {
    icon: "/favicon.svg",
  }
};
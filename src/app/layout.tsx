import { type Metadata } from "next";
import { ReactNode } from "react";
import { AppContextProvider } from "@/contexts/AppContext";
import { AuthContextProvider } from "@/contexts/AuthContext";
import { ModalContextProvider } from "@/contexts/ModalContext";
import { ToastProvider } from "@/providers/ToastProvider";
import ColorThemeWrapper from "@/components/ColorThemeWrapper/ColorThemeWrapper";
import FloatingButton from "@/components/FloatingButton/FloatingButton";
import Footer from "@/components/Footer/Footer";
import IsLoading from "@/components/IsLoading/IsLoading";
import Modal from "@/components/Modal/Modal";
import Nav from "@/components/Nav/Nav";
import RouteWatcher from "@/components/RouteWatcher/RouteWatcher";
import SideNav from "@/components/SideNav/SideNav";
import "./globals.scss";


const RootLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
  return (
    <html 
      lang="en" 
      suppressHydrationWarning 
      data-scroll-behavior="smooth"
    >
      <body>
        <AuthContextProvider>
          <AppContextProvider>
            <ColorThemeWrapper>
              <ModalContextProvider>
                <ToastProvider />
                <RouteWatcher />
                <IsLoading />
                <Nav />
                <SideNav />
                <Modal />
                  <div className="app">
                    {children}
                  </div>
                <FloatingButton />
                <Footer />
              </ModalContextProvider>
            </ColorThemeWrapper>
          </AppContextProvider>
        </AuthContextProvider>
      </body>
    </html>
  );
};

const metadata: Metadata = {
  title: "Amitha HMUA Portfolio",
  description: "Portfolio Website of Amitha Millen-Suwanta Hair & Makeup Artist",
  icons: {
    icon: "/favicon.svg"
  },
  other: {
    google: "notranslate",
  },
};

export default RootLayout;
export { metadata };
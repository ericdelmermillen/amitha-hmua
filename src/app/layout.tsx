import type { Metadata } from "next";
import { AppContextProvider } from "@/contexts/AppContext";
import { ColorThemeProvider } from "@/contexts/ColorThemeContext";
import { ToastProvider } from "@/providers/ToastProvider";
import Footer from "@/components/Footer/Footer";
import Nav from "@/components/Nav/Nav";
import "./globals.scss";

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

            <Nav />
            {children}
            
            <Footer />
            <ToastProvider />
          </ColorThemeProvider>
        </AppContextProvider>
      </body>
    </html>
  );
};

export default RootLayout;

export const metadata: Metadata = {
  title: "Amitha HMUA Portfolio",
  description: "Portfolio Website of Amitha Millen-Suwanta Hair & Makeup Artist"
};
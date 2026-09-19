import type { Metadata } from "next";
import Shoots from "@/components/Shoots/Shoots";
import "./WorkPage.scss";

const WorkPage = () => {

  return (
    <div className="workPage">
      <div className="workPage__inner">
        <Shoots />
      </div>
    </div>
  )
};


const metadata: Metadata = {
  title: "Portfolio | Amitha HMUA",
  description:
    "Explore editorial, bridal, and creative hair and makeup artistry by Amitha Millen-Suwanta.",
  alternates: {
    canonical: "/work",
  },
  openGraph: {
    title: "Portfolio | Amitha HMUA",
    description:
      "Explore editorial, bridal, and creative hair and makeup artistry by Amitha Millen-Suwanta.",
    url: "/work",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Portfolio | Amitha HMUA",
    description:
      "Explore editorial, bridal, and creative hair and makeup artistry by Amitha Millen-Suwanta.",
  },
};


export { metadata };
export default WorkPage;
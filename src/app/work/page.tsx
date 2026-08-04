import { normalizeCasing } from "@/utils/utils";
import "./HomePage.scss";

const HomePage = async ({ searchParams }: { searchParams: Promise<{ tag?: string }> }) => {
  const { tag } = await searchParams;

  const normalizedTag = normalizeCasing(tag)

  return (
    <>
      <div className="homePage">
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <div className="homePage__inner">
          <h1 className="homePage__heading">work/{normalizedTag ?? "all"}</h1>
          {/* <Shoots /> */}
        </div>
      </div>
    </>
  )
};

export default HomePage;
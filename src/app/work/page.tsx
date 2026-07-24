import "./HomePage.scss";

const HomePage = async ({ searchParams }: { searchParams: Promise<{ tag?: string }> }) => {
  const { tag } = await searchParams;

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
          <h1 className="homePage__heading">work/{tag ?? "all"}</h1>
          {/* <Shoots /> */}
        </div>
      </div>
    </>
  )
};

export default HomePage;
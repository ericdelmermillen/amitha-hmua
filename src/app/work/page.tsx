import { normalizeCasing } from "@/utils/utils";
import Shoots from "@/components/Shoots/Shoots";
import "./WorkPage.scss";

const WorkPage = async ({ searchParams }: { searchParams: Promise<{ tag?: string }> }) => {
  const { tag } = await searchParams;

  const normalizedTag = normalizeCasing(tag)

  return (
    <>
      <div className="homePage">
        <div className="homePage__inner">
          <Shoots />
        </div>
      </div>
    </>
  )
};

export default WorkPage;
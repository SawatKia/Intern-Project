import { useState, useRef, useEffect } from "react";
import auth from "../services/authenticationApi";
import { Content } from "../interfaces/PostInterface";
import { person, PostOption } from "../assets/icon";
import EditorTextParser from "./Editor/EditorTextParser";
import getLogger from "../utils/logger";

const logger = getLogger("Post component");

interface PostProps {
  time: string;
  content: Content;
  team: string;
  creator: { username: string };
  published: boolean;
  diaryId: string;
  handleModification: (id: string, action: string) => void;
}

const teamTagStyles = {
  ทีมรับสาย: "font-normal text-base bg-blue-500 text-white",
  ทีมกรอกข้อมูล: "font-normal text-base bg-green-500 text-black",
  "ทีม Nutrition": "font-normal text-base bg-amber-500 text-black",
  "ทีม Colab": "font-normal text-base bg-purple-500 text-white",
  ทีมอื่น: "font-normal text-base bg-[#FF9F1C] text-[#CBF3F0]",
  ทีมอื่น2: "font-normal text-base bg-[#06D6A0] text-[#073B4C]",
  default: "font-normal text-sm bg-cyan-400",
};

function Post({
  time,
  content,
  team = "default",
  creator,
  published,
  diaryId,
  handleModification,
}: PostProps) {
  const [postOptionOpen, setPostOptionOpen] = useState(false);
  const postOptionRef = useRef<HTMLDivElement | null>(null);
  const [owner, setOwner] = useState(false);

  const togglePostOption = () => {
    logger.log(
      "diary_id: ",
      diaryId ? `some_id type: ${typeof diaryId}` : diaryId
    );
    if (!postOptionOpen) {
      setPostOptionOpen(!postOptionOpen);
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      postOptionRef.current &&
      !postOptionRef.current.contains(event.target as Node)
    ) {
      setPostOptionOpen(false);
    }
  };

  useEffect(() => {
    const checkOwner = async () => {
      await auth.initializeUser(); // Ensure user is initialized
      const currentUser = auth.getUser();
      setOwner(currentUser?.username === creator.username);
    };
    checkOwner();
  }, [creator.username]);

  useEffect(() => {
    if (postOptionOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [postOptionOpen]);

  return (
    <div
      id="post-container"
      className={`relative flex flex-col ${
        postOptionOpen ? "z-[4]" : ""
      } bg-card-bg-lightM rounded-md drop-shadow-md p-3 my-3 dark:bg-card-bg-darkM dark:text-card-text-darkM dark:border-2 dark:border-card-border-darkM`}
    >
      <div className="flex justify-between">
        <div id="profileUsernameTime" className="flex items-center mb-3">
          <div className="w-12 h-12 flex items-center justify-center">
            {person}
          </div>
          <div id="userTime" className="flex flex-col ">
            <div id="usernameTeam" className="flex flex-row">
              <span className="text-card-text-lightM dark:text-card-text-darkM">
                {creator.username}
              </span>
              <span
                id="teamtag"
                className={`p-1 mx-2 rounded-md ${
                  teamTagStyles[team] || teamTagStyles.default
                }`}
              >
                {team}
              </span>
            </div>
            <span className="font-light text-card-subtext-lightM dark:text-card-subtext-darkM">
              {time}
            </span>
          </div>
        </div>
        {owner && (
          <div className="relative">
            <button
              id="options"
              className="drop-shadow-md bg-optionIcon-bg-lightM hover:bg-optionIcon-hover-lightM active:bg-optionIcon-active-lightM text-optionIcon-fg-lightM rounded-full p-1 dark:bg-optionIcon-bg-darkM dark:hover:bg-optionIcon-hover-darkM dark:active:bg-optionIcon-active-darkM dark:text-optionIcon-fg-darkM"
              onClick={togglePostOption}
            >
              {PostOption}
            </button>
            {postOptionOpen && (
              <div
                ref={postOptionRef}
                className="absolute z-[5] right-0 mt-2 w-36 border bg-optionCard-bg-lightM border-optionCard-border-lightM rounded-md drop-shadow-md flex flex-col dark:text-optionCard-text-darkM dark:bg-optionCard-bg-darkM dark:border-optionCard-border-darkM"
                onClick={togglePostOption}
              >
                <span
                  className="p-2 hover:bg-options-hover-lightM active:bg-options-active-lightM dark:hover:bg-options-hover-darkM dark:active:bg-options-active-darkM"
                  onClick={() => handleModification(diaryId, "แก้ไข")}
                >
                  แก้ไข
                </span>
                <span
                  className="p-2 hover:bg-options-hover-lightM active:bg-options-active-lightM dark:hover:bg-options-hover-darkM dark:active:bg-options-active-darkM"
                  onClick={() =>
                    handleModification(
                      diaryId,
                      published ? "เปลี่ยนเป็นส่วนตัว" : "เผยแพร่"
                    )
                  }
                >
                  {published ? "เปลี่ยนเป็นส่วนตัว" : "เผยแพร่"}
                </span>
                <span
                  className="p-2 hover:bg-options-hover-lightM active:bg-options-active-lightM dark:hover:bg-options-hover-darkM dark:active:bg-options-active-darkM"
                  onClick={() => handleModification(diaryId, "ลบ")}
                >
                  ลบ
                </span>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="w-full word-break-all">
        <EditorTextParser data={content} />
      </div>
    </div>
  );
}

export default Post;

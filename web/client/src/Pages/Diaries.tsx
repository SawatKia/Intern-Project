/* eslint-disable no-var */
import { useEffect, useState } from "react";
import diaries from "../services/diariesApi";
import socket from "../services/socket";
// interfaces
import { Post_Interface, Content } from "../interfaces/PostInterface";
// Components
import ThemeSelector from "../Components/ThemeSelector";
import Post from "../Components/Post";
import ConfirmationCard from "../Components/ConfirmationCard";
import Notification from "../Components/Notification";
import EditorCard from "../Components/Editor/EditorCard";
import { useLocation } from "react-router-dom";

interface DiariesProps {
  team?: string;
  header_text?: string;
  header_icon?: JSX.Element;
  privateDiaries?: boolean;
}

function Diaries({
  team,
  header_text,
  header_icon,
  privateDiaries,
}: DiariesProps) {
  const [editorData, setEditorData] = useState<Content | undefined>(undefined);
  const [theme, setTheme] = useState(localStorage.getItem("theme"));
  const [editorOpen, setEditorOpen] = useState(false);
  const [posts, setPosts] = useState<Post_Interface[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [modificationDiaryId, setModificationDiaryId] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [warningMessage, setWarningMessage] = useState("");
  const [nextPrivacy, setNextPrivacy] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    success: boolean;
  } | null>(null);
  const location = useLocation();

  const handleEditorChange = (data: Content) => {
    setEditorData(data);
  };

  const showNotification = (message: string, success: boolean) => {
    setNotification({ message, success });
  };
  const handleSaveOrPublish = async (
    isPublish: boolean,
    success_message: string
  ) => {
    try {
      if (editorData) {
        if (modificationDiaryId) {
          const modifyDiary = await diaries.get_diaries_by_id(
            modificationDiaryId
          );
          if (modifyDiary?.published !== isPublish) {
            const currentPrivacy = modifyDiary.published;
            setNextPrivacy(isPublish);
            setWarningMessage(
              `คุณกำลังเปลี่ยนแปลงความเป็นส่วนตัวของไดอารี่นี้จาก ${
                currentPrivacy ? "สาธารณะ" : "ส่วนตัว"
              } ไปเป็น ${isPublish ? "สาธารณะ" : "ส่วนตัว"}`
            );
          }
          setShowConfirmation(true);
        } else {
          const result = await diaries.createDiaries(
            editorData,
            isPublish,
            team || "all"
          );
          if (result) {
            showNotification(success_message, true);
            setEditorOpen(false);
          } else {
            showNotification("เกิดข้อผิดพลาด", false);
          }
        }
      } else {
        alert("No data to store");
      }
    } catch (error) {
      console.error("Error in creating diary:", error);
      showNotification("เกิดข้อผิดพลาด", false);
    }
  };

  const handleSave = () =>
    handleSaveOrPublish(false, "บันทึกเป็นไดอารี่ส่วนตัว");
  const handlePublish = () => handleSaveOrPublish(true, "เผยแพร่ไดอารี่แล้ว");

  const handleSmallTextBoxClick = () => {
    setEditorOpen(true);
    setEditorData(undefined);
    setModificationDiaryId("");
  };

  const handleBackdropClick = () => {
    if (showConfirmation) {
      setShowConfirmation(false);
      setWarningMessage("");
    } else if (editorOpen) {
      setEditorOpen(false);
    }
    if (notification) {
      setNotification(null);
    }
  };

  const handleCloseByEscKey = (event) => {
    if (editorOpen && event.key === "Escape") {
      setEditorOpen(false);
    }
  };

  const handleModification = async (id, action) => {
    setModificationDiaryId(id);
    setActionMessage(action);
    if (action === "แก้ไข") {
      try {
        const data = await diaries.get_diaries_by_id(id);
        setEditorData(data.content);
        setEditorOpen(true);
      } catch (error) {
        console.error("Error fetching editor data:", error);
      }
    } else if (action === "เปลี่ยนเป็นส่วนตัว" || action === "เผยแพร่") {
      const isPublish = action === "เผยแพร่";
      const modifyDiary = posts.find((post) => post.id === id);
      if (!modifyDiary) return;
      if (modifyDiary.published !== isPublish) {
        const currentPrivacy = modifyDiary.published;
        setNextPrivacy(isPublish);
        setWarningMessage(
          `คุณกำลังเปลี่ยนแปลงความเป็นส่วนตัวของไดอารี่นี้จาก ${
            currentPrivacy ? "สาธารณะ" : "ส่วนตัว"
          } ไปเป็น ${isPublish ? "สาธารณะ" : "ส่วนตัว"}`
        );
      }
      setShowConfirmation(true);
    } else {
      setShowConfirmation(true);
    }
  };

  const confirmModification = async () => {
    setShowConfirmation(false);
    if (actionMessage === "ลบ") {
      const delete_result = await diaries.delete_diary(modificationDiaryId);
      if (delete_result) {
        showNotification("ลบไดอารี่เรียบร้อย", true);
      } else {
        showNotification("ไม่สามารถลบไดอารี่ได้", false);
      }
    } else if (
      actionMessage === "เปลี่ยนเป็นส่วนตัว" ||
      actionMessage === "เผยแพร่"
    ) {
      const isPublish = actionMessage === "เผยแพร่";
      const update_result = await diaries.update_diary(
        modificationDiaryId,
        editorData,
        isPublish
      );
      if (update_result) {
        showNotification(
          isPublish ? "ไดอารี่ถูกเผยแพร่" : "ไดอารี่ถูกตั้งเป็นส่วนตัว",
          true
        );
      } else {
        showNotification(
          isPublish
            ? "ไม่สามารถเผยแพร่ไดอารี่ได้"
            : "ไม่สามารถตั้งเป็นส่วนตัวได้",
          false
        );
      }
    } else if (actionMessage === "แก้ไข") {
      const result = await diaries.update_diary(
        modificationDiaryId,
        editorData,
        nextPrivacy
      );
      if (result) {
        showNotification("แก้ไขไดอารี่สำเร็จ", true);
        setShowConfirmation(false);
        setEditorOpen(false);
      } else {
        showNotification("เกิดข้อผิดพลาด", false);
      }
    }
  };

  const cancelModification = () => {
    setShowConfirmation(false);
    setWarningMessage("");
  };

  useEffect(() => {
    setTheme(localStorage.getItem("theme"));
  }, [theme]);

  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", editorOpen);
    document.addEventListener("keydown", handleCloseByEscKey);
    return () => {
      document.body.classList.remove("overflow-hidden");
      document.removeEventListener("keydown", handleCloseByEscKey);
    };
  }, [editorOpen]);

  const fetchDiaries = async () => {
    try {
      const fetchedPosts = team
        ? await diaries.getPublicDiaries(team)
        : await diaries.getUserDiaries(privateDiaries);
      setPosts(fetchedPosts.diaries);
    } catch (error) {
      console.error("Error in fetching posts:", error);
    }
  };
  useEffect(() => {
    fetchDiaries();
  }, [team, location.pathname]);

  useEffect(() => {
    const handleNewDiaryCreated = async () => {
      await fetchDiaries();
      // const newPosts = await diaries.get_diaries_by_id(new_diary_id);
      // if (newPosts.published && team) {
      //   setPosts((prevPosts) => [newPosts, ...prevPosts]);
      // }
    };

    const handleDiaryUpdated = async () => {
      await fetchDiaries();
    };

    const handleDiaryDeleted = async () => {
      await fetchDiaries();
    };

    socket.on("new_diary_created", handleNewDiaryCreated);
    socket.on("diary_id_updated", handleDiaryUpdated);
    socket.on("diary_id_deleted", handleDiaryDeleted);

    return () => {
      socket.off("new_diary_created", handleNewDiaryCreated);
      socket.off("diary_id_updated", handleDiaryUpdated);
      socket.off("diary_id_deleted", handleDiaryDeleted);
    };
  }, [socket, team, posts]);

  return (
    <div
      id="viewBox"
      className="font-Kanit h-full bg-body-bg-lightM dark:bg-radial-dark"
    >
      {notification && (
        <Notification
          message={notification.message}
          success={notification.success}
          onClose={() => setNotification(null)}
        />
      )}
      <div className="flex justify-evenly h-full">
        <div id="mockUp-left"></div>
        <div
          id="editorPosts-container"
          className="flex flex-col items-center m-4 min-h-screen w-full h-full sm:w-2/5"
        >
          {team && (
            <span
              id="header-team"
              className="flex flex-row z-[1] items-center m-4 drop-shadow-md text-body-text-lightM dark:text-body-text-darkM self-start"
            >
              <p className="text-3xl">ไดอารี่</p>
              <p className="text-3xl font-semibold mx-2 whitespace-nowrap">
                {team}
              </p>
            </span>
          )}
          {header_text && header_icon && (
            <div
              id="header-user-diaries"
              className="flex flex-row items-center mb-4 w-2/5 self-start"
            >
              <div id="icon" className="w-14 h-20 text-Navbar-bg-lightM">
                {header_icon}
              </div>
              <span className="flex flex-row m-4 dark:text-body-text-darkM">
                <p className="text-2xl">ไดอารี่</p>
                <p className="text-2xl  font-bold mx-2 whitespace-nowrap">
                  {header_text}
                </p>
              </span>
            </div>
          )}

          {team && (
            <div
              id="small-textbox"
              className="sticky top-[120px] z-[2] drop-shadow-md w-full bg-card-bg-lightM p-4 rounded-2xl dark:bg-card-bg-darkM"
              onClick={handleSmallTextBoxClick}
            >
              <input
                type="text"
                placeholder="เขียนเรื่องราว. . . "
                className="w-full rounded-full h-10 pl-5 bg-editor-bg-lightM dark:bg-editor-bg-darkM"
              ></input>
            </div>
          )}
          {editorOpen && (
            <EditorCard
              data={editorData}
              onChange={handleEditorChange}
              onSave={handleSave}
              onPublish={handlePublish}
              onClose={handleBackdropClick}
            />
          )}
          <div id="Posts-container" className="m-10 w-full">
            {posts.length === 0 ? (
              <p className="dark:text-body-text-darkM">
                ยังไม่มีไดอารี่ใดๆให้แสดง
              </p>
            ) : (
              posts.map((post, index) => (
                <Post
                  key={index}
                  time={post.created_stamp}
                  content={post.content}
                  team={post.team}
                  creator={post.creator}
                  published={post.published}
                  diaryId={post.id}
                  handleModification={handleModification}
                />
              ))
            )}
          </div>
        </div>
        <div id="ThemeSelector" className="hidden md:block">
          <div id="mock" className="sticky top-24 z-[4]">
            <ThemeSelector />
          </div>
        </div>
      </div>
      {showConfirmation && (
        <div
          className="fixed inset-0 z-[10] flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out"
          onClick={handleBackdropClick}
        >
          <ConfirmationCard
            onConfirm={confirmModification}
            onCancel={cancelModification}
            actionMessage={actionMessage}
            warningMessage={warningMessage}
          />
        </div>
      )}
    </div>
  );
}

export default Diaries;

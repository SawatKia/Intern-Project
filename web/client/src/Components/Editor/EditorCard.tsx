import Editor from "./Editor";
import Button from "../Button";
import { Content } from "../../interfaces/PostInterface";
import { save, publish } from "../../assets/icon";

interface EditorCardProps {
  data: Content | undefined;
  onChange: (data: Content) => void;
  onSave: () => void;
  onPublish: () => void;
  onClose: () => void;
  saveIcon?: JSX.Element;
  publishIcon?: JSX.Element;
}
function EditorCard({
  data,
  onChange,
  onSave,
  onPublish,
  onClose,
  saveIcon = save,
  publishIcon = publish,
}: EditorCardProps) {
  const viewportHeight = window.innerHeight;

  return (
    <>
      <div
        id="editorButtons-overlay"
        className="fixed top-0 left-0 z-[8] w-screen h-screen bg-black opacity-40"
        onClick={onClose}
      ></div>
      <div
        id="editorButtons-container"
        className="fixed top-1/2 left-1/2 z-[9] flex flex-col border-2 w-3/4 md:w-1/2 bg-card-bg-lightM rounded-xl drop-shadow-md dark:bg-card-bg-darkM transition-all max-h-[90vh] overflow-y-auto"
        style={{
          transform: `translate(-50%, -50%)`,
          maxHeight: `${viewportHeight * 0.7}px`,
          left: `50%`,
          top: `50%`,
        }}
      >
        <Editor
          data={data}
          onChange={onChange}
          editorblock="editorjs-container"
        />
        <div
          id="save-buttons"
          className="flex flex-col md:flex-row justify-center z-[10] space-y-1 md:space-y-0 md:space-x-2"
        >
          <div
            id="save-button-container"
            className="flex justify-center w-full md:w-fit"
          >
            <Button
              buttonText="บันทึกเป็นไดอารี่ส่วนตัว"
              icon={saveIcon}
              onClick={onSave}
              backgroundColor="bg-buttonPrimary-bg-lightM hover:bg-buttonPrimary-hover-lightM dark:bg-buttonPrimary-bg-darkM dark:hover:bg-buttonPrimary-hover-darkM"
              textColor="text-buttonPrimary-text-lightM dark:text-buttonPrimary-text-darkM"
              otherClasses="w-full md:w-fit"
            />
          </div>
          <div
            id="publish-button-container"
            className="flex justify-center w-full md:w-fit"
          >
            <Button
              buttonText="เผยแพร่"
              icon={publishIcon}
              onClick={onPublish}
              border="border-2 border-buttonSecondary-border-lightM dark:border-buttonSecondary-border-darkM"
              backgroundColor="bg-buttonSecondary-bg-lightM hover:bg-buttonSecondary-hover-lightM dark:bg-buttonSecondary-bg-darkM dark:hover:bg-buttonSecondary-hover-darkM"
              textColor="text-buttonSecondary-text-lightM dark:text-buttonSecondary-text-darkM"
              otherClasses="w-full md:w-fit"
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default EditorCard;

import { memo, useEffect, useRef } from "react";
import EditorJS from "@editorjs/editorjs";
import { Content } from "../../interfaces/PostInterface";
import Header from "@editorjs/header";
interface EditorProps {
  data: Content | undefined;
  onChange: (data: Content) => void;
  editorblock: string;
}

const Editor = (props: EditorProps) => {
  const ref = useRef<EditorJS | null>(null);

  useEffect(() => {
    // Initialize editorjs if we don't have a reference
    if (!ref.current) {
      try {
        const editor = new EditorJS({
          holder: props.editorblock,
          placeholder: "เริ่มเขียนเรื่องราว...",
          tools: {
            header: {
              inlineToolbar: true,
              class: Header as any,
              config: {
                levels: [1, 2, 3, 4, 5, 6],
                defaultLevel: 3,
              },
              shortcut: "CMD+SHIFT+H",
              toolbox: {
                title: "Header",
              },
            },
          },
          data: props.data ? props.data : undefined,
          async onChange(api) {
            try {
              const data: any = await api.saver.save();

              if (props.onChange) {
                props.onChange(data);
              } else {
                console.warn("Editor onChange is null");
              }
            } catch (error) {
              console.error("Error saving EditorJS data:", error);
            }
          },
        });
        ref.current = editor;
      } catch (error) {
        console.error("Error initializing EditorJS:", error);
      }
    }

    // Cleanup function to destroy editorjs instance
    return () => {
      try {
        if (ref.current) {
          ref.current.destroy();
          ref.current = null;
        } else {
          console.warn("EditorJS instance is null");
        }
      } catch (error) {
        console.error("Error destroying EditorJS instance:", error);
      }
    };
  }, []);
  return (
    <div
      id={props.editorblock}
      className={`relative z-[2] bg-editor-bg-lightM max-w-full focus: text-editor-text-lightM my-4 px-16 overflow-auto h-full  dark:bg-editor-bg-darkM dark:text-editor-text-darkM`}
    />
  );
};

export default memo(Editor);

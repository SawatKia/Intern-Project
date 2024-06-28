// edjsHTML tranforms editor js blocks to html
import edjsHTML from "editorjs-html";
// this function parses strings (html elements) to html
import parse from "html-react-parser";
import { Content } from "../../interfaces/PostInterface";
const edjsParser = edjsHTML();

function EditorTextParser({ data }: { data: Content }) {
  if (!data) {
    console.error("EditorTextParser received null data");
    return <div className="text-container">Error: null data</div>;
  }

  let html;
  try {
    html = edjsParser.parse(data);
  } catch (error: any) {
    console.error("Error parsing EditorJS data:", error);
    return <div className="text-container">Error: {error.message}</div>;
  }

  if (!html) {
    console.error("EdjsParser returned null html");
    return <div className="text-container">Error: null html</div>;
  }

  return <div className="text-container">{parse(html.join(""))}</div>;
}

export default EditorTextParser;

import React, { useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";

const EditorContainer = (props) => {
  const { content, setContent, background = "white" } = props;
  const editorRef = useRef(null);

  const normalizeContent = (content) => {
    return content.replace(/<\/?(html|head|body)[^>]*>/g, "").trim();
  };

  const handleEditorChange = (content) => {
    const normalizedContent = normalizeContent(content);
    setContent(normalizedContent);
  };

  const handleEditorSetup = (editor) => {
    editorRef.current = editor;
    editor.on("change input undo redo", () => {
      handleEditorChange(editor.getContent());
    });
  };

  return (
    <Editor
      apiKey="rv98fsqigjw4pj7zsbawye8jrdpgxrrhzznj01jou3tgj7ti" // replace with your TinyMCE API key
      value={content}
      init={{
        height: 180,
        menubar: false,
        branding: false,
        statusbar: false,
        plugins: "link lists",
        toolbar: "bold italic underline | numlist bullist alignleft link",
        setup: handleEditorSetup,
        content_css: "default",
        content_style: `body { font-family:Helvetica,Arial,sans-serif; font-size:12px; background-color: ${background}; }
                        .non-editable { background-color: #f0f0f0; padding: 5px; border: 1px solid #ddd; color: gray; }
                        `,
        readonly: false, // Make editor generally editable
        extended_valid_elements: "div[contenteditable|class]",

        
      
      }}
      onEditorChange={handleEditorChange}
    />
  );
};

export default EditorContainer;

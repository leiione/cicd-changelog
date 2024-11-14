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

    // Transform URLs to ensure HTTPS
    editor.on("BeforeSetContent", (e) => {
      if (e.content) {
        e.content = e.content.replace(
          /<a\s[^>]*href="(?!https?:\/\/)([^"]+)"/g,
          '<a href="https://$1"'
        );
      }
    });

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
                        .quote-text { background-color: #f7f7f7; border: 1px solid #ccc; margin : 0 !important; padding :1rem; font-size: 12px;}
                        `,
        readonly: false,
        extended_valid_elements: "div[contenteditable|class]",
        placeholder: "Write Something here...",
        link_default_protocol: "https",
        automatic_uploads: false,
        link_assume_external_targets: true, // Ensure external links are treated as absolute
      }}
      onEditorChange={handleEditorChange}
    />
  );
};

export default EditorContainer;

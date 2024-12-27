import React, { useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { useApolloClient } from "@apollo/client";
import { EMAIL_TEMPLATE_PREVIEW } from "TicketDetails/TicketGraphQL";

const EditorContainer = (props) => {
  const client = useApolloClient()
  const editorRef = useRef(null);
  const { content, setContent, background = "white", isSusbcriber, templates, ticket, handleSelectedTemplate } = props;

  const normalizeContent = (content) => {
    return content.replace(/<\/?(html|head|body)[^>]*>/g, "").trim();
  };

  const handleEditorChange = (content) => {
    const normalizedContent = normalizeContent(content);
    setContent(normalizedContent);
  };

  const handleOnTemplateSelect = async (editor, template) => {
    const { data } = await client.query({
      query: EMAIL_TEMPLATE_PREVIEW,
      variables: { customer_id: ticket.subscriber.customer_id, me_id: template.me_id },
      fetchPolicy: "network-only"
    })
    if (data) {
      // editor.insertContent(data.previewMergeFields);
      setContent(data.previewMergeFields);
      handleSelectedTemplate(template);
    }
  }

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

    editor.ui.registry.addMenuButton('templates', {
      text: 'Templates', // Button text
      fetch: function (callback) {
        let items = [];
        for (const item of templates) {
          const menuItem = {
            type: 'menuitem',
            text: item.template_name,
            value: item.me_id,
            onSetup: async function () {
              this.onAction = async function () {
                await handleOnTemplateSelect(editor, item);
              };
            },
          };
          items.push(menuItem);
        }
        callback(items);
      }
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
        toolbar: `${isSusbcriber ? 'templates | ' : ''}bold italic underline | numlist bullist alignleft link`,
        setup: handleEditorSetup,
        content_css: "default",
        content_style: `body { font-family:Helvetica,Arial,sans-serif; font-size:12px; background-color: ${background}; }
                        .quote-block { background-color: #f7f7f7; border: 1px solid #ccc; margin : 0 !important; padding :1rem; font-size: 12px;}
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

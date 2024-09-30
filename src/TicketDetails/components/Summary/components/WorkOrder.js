import React, { useRef, useState, useEffect, useCallback } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { Editor } from "@tinymce/tinymce-react";
import {
  GET_DETAIL_TEXT,
  UPDATE_DETAIL_TEXT,
  GET_TICKET
} from "TicketDetails/TicketGraphQL";
import { Button } from "@mui/material";
import { useDispatch } from "react-redux";
import { showSnackbar } from "config/store";
import Loader from "components/Loader";

const WorkOrder = ({
  ticket_id,
  setTicketDetail,
  setEditorContentChanged,
  setHandleSave,
}) => {
  const dispatch = useDispatch();
  const editorRef = useRef(null);
  const [initialDetailText, setInitialDetailText] = useState("");
  const [detailText, setDetailText] = useState("");
  const [type, setTicketType] = useState("");
  const [detail_id, setDetailID] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isChanged, setIsChanged] = useState(false);

  const normalizeContent = (content) => {
    return content.replace(/<\/?(html|head|body)[^>]*>/g, "").trim();
  };

  const { loading } = useQuery(GET_DETAIL_TEXT, {
    variables: { ticket_id },
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      if (data && data.workflowOrder) {
        const normalizedText = normalizeContent(data.workflowOrder.detail_text);
        setInitialDetailText(normalizedText);
        setDetailText(normalizedText);
        setTicketDetail(data.workflowOrder.detail_text);
        setDetailID(data.workflowOrder.detail_id);
        setTicketType(data.workflowOrder.type);
        setIsLoaded(true);
      }
    },
  });

  const [updateDetailText] = useMutation(UPDATE_DETAIL_TEXT);

  const handleEditorChange = (content) => {
    const normalizedContent = normalizeContent(content);
    setDetailText(normalizedContent);
    const changed = normalizedContent !== initialDetailText;
    setIsChanged(changed);
    setEditorContentChanged(changed); // Update parent state
  };

  const handleSave = useCallback(async () => {
    try {
      const { data } = await updateDetailText({
        variables: {
          input_ticket: {
            ticket_id,
            detail_id,
            type,
            detail_text: detailText,
          },
        },
        refetchQueries: [
          { query: GET_TICKET, variables: { id: ticket_id } },
        ],
      });
      if (data.updateTicket.ticket_id) {
        dispatch(
          showSnackbar({
            message: "The work order saved successfully",
            severity: "success",
          })
        );
        setInitialDetailText(detailText);
        setIsChanged(false);
        setEditorContentChanged(false); // Update parent state
      } else {
        dispatch(
          showSnackbar({
            message: "Failed to save work order.",
            severity: "error",
          })
        );
      }
    } catch (error) {
      console.error("There was an error updating the detail text!", error);
      dispatch(
        showSnackbar({
          message: "Failed to save work order.",
          severity: "error",
        })
      );
    }
  }, [
    detailText,
    detail_id,
    type,
    ticket_id,
    updateDetailText,
    dispatch,
    setEditorContentChanged,
  ]);

  useEffect(() => {
    setHandleSave(() => handleSave);
  }, [handleSave, setHandleSave]);

  const handleCancel = () => {
    setDetailText(initialDetailText);
    if (editorRef.current) {
      editorRef.current.setContent(initialDetailText);
    }
    setTimeout(() => {
      setIsChanged(false);
      setEditorContentChanged(false); // Update parent state
    }, 0); // Ensuring state update after content set
  };

  const handleFilePicker = (callback, value, meta) => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");

    // Handle different file types
    if (meta.filetype === "image") {
      input.setAttribute("accept", "image/*");
    }

    input.onchange = function () {
      const file = this.files[0];
      const reader = new FileReader();

      reader.onload = function () {
        const id = `blobid${new Date().getTime()}`;
        const base64 = reader.result.split(",")[1];
        const blobCache = window.tinymce.activeEditor.editorUpload.blobCache;
        const blobInfo = blobCache.create(id, file, base64);
        blobCache.add(blobInfo);

        // Call the callback and populate the appropriate type in the editor
        if (meta.filetype === "image") {
          callback(blobInfo.blobUri(), { title: file.name });
        } else if (meta.filetype === "media" || meta.filetype === "file") {
          callback(blobInfo.blobUri(), { text: file.name });
        }
      };
      reader.readAsDataURL(file);
    };

    input.click();
  };

  const handleEditorSetup = (editor) => {
    editorRef.current = editor;
    editor.on("init", () => {
      setIsLoaded(true);
    });
    editor.on("change input undo redo", () => {
      handleEditorChange(editor.getContent());
    });
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      <div className="drawer-wrapper p-3">
        <Editor
          apiKey="rv98fsqigjw4pj7zsbawye8jrdpgxrrhzznj01jou3tgj7ti" // replace with your TinyMCE API key
          value={detailText}
          init={{
            height: 500,
            menubar: false,
            branding: false,
            icons: 'material',
            statusbar: false,
            plugins: [
              "advlist autolink lists link image charmap print preview anchor",
              "searchreplace visualblocks code fullscreen",
              "insertdatetime media table paste code help wordcount",
              "image",
              "link",
              "media",
            ],
            toolbar:
              "undo redo | bold italic underline forecolor backcolor | link image code | align | bullist numlist",
            image_title: true,
            automatic_uploads: true,
            file_picker_types: "file image media",
            file_picker_callback: handleFilePicker,
            setup: handleEditorSetup,
          }}
        />
      </div>
      <div className="drawer-footer">
        <Button
          color="primary"
          variant="outlined"
          onClick={handleSave}
          disabled={!isLoaded || !isChanged}
        >
          Save
        </Button>
        <Button
          variant="outlined"
          color="default"
          onClick={handleCancel}
          disabled={!isLoaded}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default WorkOrder;

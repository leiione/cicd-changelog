import React, { useRef, useState, useEffect, useCallback } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { Editor } from "@tinymce/tinymce-react";
import {
  GET_DETAIL_TEXT,
  UPDATE_DETAIL_TEXT,
  GET_TICKET,
  GET_ACTIVITIES,
  UPLOAD_FILE_MUTATION
} from "TicketDetails/TicketGraphQL";
import { Button } from "@mui/material";
import { useDispatch } from "react-redux";
import { showSnackbar } from "config/store";
import Loader from "components/Loader";
import ProgressButton from "Common/ProgressButton";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  const [uploadFile] = useMutation(UPLOAD_FILE_MUTATION);

  const handleEditorChange = (content) => {
    const normalizedContent = normalizeContent(content);
    setDetailText(normalizedContent);
    const changed = normalizedContent !== initialDetailText;
    setIsChanged(changed);
    setEditorContentChanged(changed); // Update parent state
  };

  const handleSave = useCallback(async () => {
    try {
      setIsSubmitting(true);
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
          { query: GET_ACTIVITIES, variables: { ticket_id }},
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
        setIsSubmitting(false);
      } else {
        setIsSubmitting(false);
        dispatch(
          showSnackbar({
            message: "Failed to save work order.",
            severity: "error",
          })
        );
      }
    } catch (error) {
      console.error("There was an error updating the detail text!", error);
      setIsSubmitting(false);
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
      
      // For non-image files, show a loading placeholder
      if (meta.filetype !== "image") {
        callback('#', { text: `Uploading ${file.name}...` });
      }
      
      // For image uploads, add a notification to the dialog
      if (meta.filetype === "image") {
        try {
          // Find the dialog body content
          const dialogContent = document.querySelector('.tox-dialog__body-content');
          if (dialogContent) {
            // Create a notification element
            const notification = document.createElement('div');
            notification.id = 'image-upload-notification';
            notification.style.cssText = 'background-color: #e3f2fd; color: #0d47a1; padding: 8px 16px; margin-top: 10px; border-radius: 4px; font-size: 14px; text-align: center;';
            notification.textContent = `Uploading ${file.name}...`;
            
            // Add it to the dialog
            dialogContent.appendChild(notification);
          }
        } catch (err) {
          console.error('Error adding notification to dialog:', err);
        }
      }
      
      // Convert file to base64 for upload
      const reader = new FileReader();
      reader.onload = async function() {
        try {
          const base64 = reader.result.split(",")[1];
          
          // Upload the file to S3 using the existing mutation
          const { data } = await uploadFile({
            variables: {
              file: base64,
              filename: file.name,
              ticket_id: parseInt(ticket_id),
              attachment_type: file.type,
            },
          });
                    
          if (data && data.uploadFile && data.uploadFile.file_url) {
            // Get the returned S3 URL
            const s3Url = data.uploadFile.file_url;
            
            // Remove the upload notification
            const notification = document.getElementById('image-upload-notification');
            if (notification) {
              notification.remove();
            }
            
            if (meta.filetype === "image") {
              // For images, directly insert the S3 image at the current cursor position
              // This is more reliable than trying to replace a placeholder
              callback(s3Url, { alt: file.name, title: file.name });
            } else {
              // For other files, replace the placeholder link with the actual S3 link
              const editor = window.tinymce.activeEditor;
              const content = editor.getContent();
              
              // Find and replace the placeholder link
              const newContent = content.replace(
                `<a href="#">Uploading ${file.name}...</a>`,
                `<a href="${s3Url}" target="_blank">${file.name}</a>`
              );
              
              editor.setContent(newContent);
              handleEditorChange(newContent);
            }
            
            // Only show success notification for non-image files
            // For images, we don't need it as they immediately appear in the editor
            if (meta.filetype !== "image") {
              dispatch(
                showSnackbar({
                  message: `${file.name} uploaded successfully`,
                  severity: "success",
                })
              );
            }
          } else {
            throw new Error("Failed to upload file to S3");
          }
        } catch (error) {
          console.error("Error uploading file:", error);
          
          // Remove the upload notification
          const notification = document.getElementById('image-upload-notification');
          if (notification) {
            notification.remove();
          }
          
          if (meta.filetype !== "image") {
            // For non-image files, remove the placeholder
            const editor = window.tinymce.activeEditor;
            const content = editor.getContent();
            const newContent = content.replace(
              `<a href="#">Uploading ${file.name}...</a>`,
              ""
            );
            editor.setContent(newContent);
            handleEditorChange(newContent);
          }
          
          // Show error message
          dispatch(
            showSnackbar({
              message: `Failed to upload ${file.name}. Please try again.`,
              severity: "error",
            })
          );
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
            toolbar: "undo redo | bold italic underline forecolor backcolor | link image code | print | align | bullist numlist",
            image_title: true,
            automatic_uploads: true,
            file_picker_types: "file image media",
            file_picker_callback: handleFilePicker,
            setup: handleEditorSetup,
          }}
        />
      </div>
      <div className="drawer-footer">
        <ProgressButton
          color="primary"
          variant="outlined"
          onClick={handleSave}
          disabled={!isLoaded || !isChanged}
          isSubmitting={isSubmitting}
        >
          Save
        </ProgressButton>
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
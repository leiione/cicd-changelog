import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { Editor } from "@tinymce/tinymce-react";
import { GET_DETAIL_TEXT, UPDATE_DETAIL_TEXT } from "TicketDetails/TicketGraphQL";
import { Button } from "@mui/material";
import { useDispatch } from "react-redux";
import { showSnackbar } from "config/store";

const WorkOrder = ({ ticket_id, setTicketDetail }) => {
    const dispatch = useDispatch();
    const [initialDetailText, setInitialDetailText] = useState("");
    const [detailText, setDetailText] = useState("");
    const [ticket_type, setTicketType] = useState("");
    const [detail_id, setDetailID] = useState("");

    const { loading } = useQuery(GET_DETAIL_TEXT, {
        variables: { ticket_id },
        fetchPolicy: "network-only",
        onCompleted: (data) => {
            if (data && data.workflowOrder) {
                setInitialDetailText(data.workflowOrder.detail_text);
                setDetailText(data.workflowOrder.detail_text);
                setTicketDetail(data.workflowOrder.detail_text);
                setDetailID(data.workflowOrder.detail_id);
                setTicketType(data.workflowOrder.ticket_type);
            }
        },
    });

    const [updateDetailText] = useMutation(UPDATE_DETAIL_TEXT);

    const handleEditorChange = (content) => {
        setDetailText(content);
    };

    const handleSave = async () => {
        try {
            const { data } = await updateDetailText({
                variables: {
                    input_ticket: {
                        ticket_id,
                        detail_id,
                        type: ticket_type,
                        detail_text: detailText,
                    },
                },
            });
            if (data.updateTicket.ticket_id) {
                dispatch(showSnackbar({ message: "The work order saved successfully", severity: "success" }));
                setInitialDetailText(detailText);
            } else {
                dispatch(showSnackbar({ message: "Failed to save work order.", severity: "error" }));
            }
        } catch (error) {
            console.error("There was an error updating the detail text!", error);
        }
    };

    const handleCancel = () => {
        setDetailText(initialDetailText);
    };

    const handleFilePicker = (callback, value, meta) => {
        const input = document.createElement("input");
        input.setAttribute("type", "file");

        // Handle different file types
        if (meta.filetype === 'image') {
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
                if (meta.filetype === 'image') {
                    callback(blobInfo.blobUri(), { title: file.name });
                } else if (meta.filetype === 'media' || meta.filetype === 'file') {
                    callback(blobInfo.blobUri(), { text: file.name });
                }
            };
            reader.readAsDataURL(file);
        };

        input.click();
    };


    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            {/*<Editor
                apiKey="rv98fsqigjw4pj7zsbawye8jrdpgxrrhzznj01jou3tgj7ti" // replace with your TinyMCE API key
                value={detailText}
                init={{
                    height: 500,
                    menubar: false,
                    plugins: [
                        'advlist autolink lists link image charmap print preview anchor',
                        'searchreplace visualblocks code fullscreen',
                        'insertdatetime media table paste code help wordcount image',
                        'file'
                    ],
                    toolbar:
                        'undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help | image | file',file_picker_callback: handleFilePicker,
                }}
                onEditorChange={handleEditorChange}
            />*/}

            <Editor
                apiKey="rv98fsqigjw4pj7zsbawye8jrdpgxrrhzznj01jou3tgj7ti" // replace with your TinyMCE API key
                value={detailText}
                init={{
                    height: 500,
                    menubar: false,
                    plugins: [
                        'advlist autolink lists link image charmap print preview anchor',
                        'searchreplace visualblocks code fullscreen',
                        'insertdatetime media table paste code help wordcount',
                        'image', 'link', 'media'
                    ],
                    toolbar:
                        'undo redo | formatselect | bold italic backcolor | image | link | media | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
                    image_title: true,
                    automatic_uploads: true,
                    file_picker_types: 'file image media',
                    file_picker_callback: handleFilePicker,
                }}
                onEditorChange={handleEditorChange}
            />


            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <Button
                    color="primary"
                    variant="outlined"
                    onClick={handleSave}
                    style={{ marginRight: '10px' }}
                    disabled={detailText === initialDetailText}
                >
                    Save
                </Button>
                <Button
                    variant="outlined"
                    color="default"
                    onClick={handleCancel}
                    style={{ marginRight: '10px' }}
                    disabled={detailText === initialDetailText}
                >
                    Cancel
                </Button>
            </div>
        </div>
    );
};

export default WorkOrder;

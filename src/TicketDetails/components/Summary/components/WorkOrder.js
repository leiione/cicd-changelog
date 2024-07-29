import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { Editor } from "@tinymce/tinymce-react";
import { GET_DETAIL_TEXT, UPDATE_DETAIL_TEXT } from "TicketDetails/TicketGraphQL";
import { Button, Paper, Typography } from "@mui/material";
import { useDispatch } from "react-redux";
import { showSnackbar } from "config/store";

const WorkOrder = ({ ticket_id }) => {
    const dispatch = useDispatch();
    const [initialDetailText, setInitialDetailText] = useState("");
    const [detailText, setDetailText] = useState("");
    const [ticket_type_id, setTicketTypeID] = useState("");
    const [detail_id, setDetailID] = useState("");

    const { loading } = useQuery(GET_DETAIL_TEXT, {
        variables: { ticket_id },
        fetchPolicy: "network-only",
        onCompleted: (data) => {
            if (data && data.workflowOrder) {
                setInitialDetailText(data.workflowOrder.detail_text);
                setDetailText(data.workflowOrder.detail_text);
                setDetailID(data.workflowOrder.detail_id);
                setTicketTypeID(data.workflowOrder.ticket_type_id);
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
                        ticket_type_id: ticket_type_id,
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

    const handlePrint = () => {
        const printWindow = window.open("", "_blank");
        printWindow.document.write(`
            <html>
            <head><title>Print Work Order</title></head>
            <body>${detailText}</body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    const handleFilePicker = (callback, value, meta) => {
        const input = document.createElement("input");
        input.setAttribute("type", "file");
        input.setAttribute("accept", "image/*");

        input.onchange = function () {
            const file = this.files[0];
            const reader = new FileReader();

            reader.onload = function () {
                const id = `blobid${new Date().getTime()}`;
                const blobCache = window.tinymce.activeEditor.editorUpload.blobCache;
                const base64 = reader.result.split(",")[1];
                const blobInfo = blobCache.create(id, file, base64);
                blobCache.add(blobInfo);

                callback(blobInfo.blobUri(), { title: file.name });
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
            <Editor
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
                        'undo redo | formatselect | bold italic backcolor | \
                        alignleft aligncenter alignright alignjustify | \
                        bullist numlist outdent indent | removeformat | help | image | file',
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
                <Button variant="contained" onClick={handlePrint}>
                    Print
                </Button>
            </div>
        </div>
    );
};

export default WorkOrder;

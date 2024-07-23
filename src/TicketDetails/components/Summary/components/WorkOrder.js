import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { Editor } from "@tinymce/tinymce-react";
import { GET_DETAIL_TEXT, UPDATE_DETAIL_TEXT } from "TicketDetails/TicketGraphQL";

const WorkOrder = ({ ticket_id }) => {
    const [detailText, setDetailText] = useState("");
    const { loading } = useQuery(GET_DETAIL_TEXT, {
        variables: { ticket_id },
        fetchPolicy: "network-only",
        onCompleted: (data) => {
            if (data && data.workflowOrder) {
                setDetailText(data.workflowOrder.detail_text);
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
                variables: { ticket_id, detail_text: detailText },
            });
            if (data.updateTicket.success) {
                alert("Detail text updated successfully!");
            } else {
                alert(data.updateTicket.message);
            }
        } catch (error) {
            console.error("There was an error updating the detail text!", error);
        }
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
                        'insertdatetime media table paste code help wordcount'
                    ],
                    toolbar:
                        'undo redo | formatselect | bold italic backcolor | \
                        alignleft aligncenter alignright alignjustify | \
                        bullist numlist outdent indent | removeformat | help'
                }}
                onEditorChange={handleEditorChange}
            />
            <button onClick={handleSave}>Save</button>
        </div>
    );
};

export default WorkOrder;

import React, { useState } from "react";
import { Button, TextField, Typography } from "@mui/material";

const Description = (props) => {
    const { ticket, updateTicket } = props;
    const [openInline, setOpenInline] = useState(false);
    const [description, setDescription] = useState(ticket.description);
    const [loading, setLoading] = useState(false);

    const handleInlineEdit = () => setOpenInline(true);

    const handleCancel = () => {
        setOpenInline(false);
        setDescription(ticket.description);
    };

    const handleSave = async () => {
        setLoading(true);
        let toUpdate = { description: description };
        try {
            await updateTicket({ ticket_id: ticket.ticket_id, ...toUpdate });
            setOpenInline(false); // Close the editor after successful update
        } catch (error) {
            console.error("Failed to update the description:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {!openInline ? (
                ticket.description ? (
                    <div className="cursor-pointer" onClick={handleInlineEdit}>
                        <Typography variant="body2">Description</Typography>
                        <Typography variant="body1">{ticket.description}</Typography>
                    </div>
                ) : (
                    <Button color="primary" onClick={handleInlineEdit}>
                        Click to add description
                    </Button>
                )
            ) : (
                <div className="position-relative">
                    <TextField
                        id="standard-basic"
                        variant="standard"
                        className="mb-0"
                        fullWidth
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={loading}
                    />
                    <div
                        className="position-absolute right-0 bg-white rounded shadow"
                        style={{ bottom: -32 }}
                    >
                        <Button
                            color="primary"
                            size="small"
                            onClick={handleSave}
                            className="my-1"
                            disabled={loading}
                        >
                            Save
                        </Button>
                        <Button
                            color="default"
                            size="small"
                            onClick={handleCancel}
                            className="my-1"
                            style={{ opacity: loading ? 0.5 : 1 }} // Adjust opacity to make button look active
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
};
export default Description;

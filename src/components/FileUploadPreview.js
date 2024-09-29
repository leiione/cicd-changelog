import React from "react";
import {
  Box,
  Grid,
  IconButton,
  Typography,
  LinearProgress,
  Modal,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";

const FileUploadPreview = ({
  selectedFiles,
  uploadProgress,
  removeFile,
  openPreview,
  handlePreviewOpen,
  handlePreviewClose,
  previewImage,
}) => {
  return (
    <Box>
      <Grid container spacing={1} className="upload-image-row">
        {selectedFiles.map((file) => (
          <Grid item xs={2} sm={2} md={2} key={file.name}>
            <Box className="single-img-box">
              <IconButton
                className="close-icon-btn"
                size="small"
                onClick={() => removeFile(file.name)}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
              <IconButton
                className="preview-icon-btn"
                size="small"
                onClick={() => handlePreviewOpen(file)}
              >
                <VisibilityIcon fontSize="small" />
              </IconButton>
              {file.type.startsWith("image/") ? (
                <img
                  className="img-preview"
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  style={{ display: "block" }}
                />
              ) : (
                <Typography variant="body2" className="file-name">
                  {file.name}
                </Typography>
              )}
            </Box>
            {uploadProgress[file.name] ? (
              <LinearProgress className="mt-2" />
            ) : (
              <LinearProgress 
              variant="determinate"
              value={100}
              className={`mt-2 linear-progress progress-success`} />
            )}

            <Typography
              className="mt-2 d-block text-truncate"
              variant="caption"
            >
              {file.name}
            </Typography>
          </Grid>
        ))}
      </Grid>


      {console.log(previewImage)}

            {/* Image Preview Modal */}
      <Modal open={openPreview} onClose={handlePreviewClose}>
        <Box className="box-modal-preview">
          {
           previewImage && previewImage?.type.startsWith("image/") ? (
            <>
              <img
                src={URL.createObjectURL(previewImage)}
                alt="Preview"
                style={{ width: "100%", height: "auto" }}
              />
              <Typography variant="body2" className="mt-2">
                {
                 previewImage && previewImage?.name
                }
              </Typography>
            </>
          ) : (
            <Typography variant="body2" className="mt-2">
              Preview not available
            </Typography>
          )}
        </Box>
      </Modal>
    </Box>
  );
};


export default FileUploadPreview;
import React, { useState } from "react";
import {
  Box,
  Grid,
  IconButton,
  Typography,
  LinearProgress,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { Close, Visibility } from "@mui/icons-material";
import { getExtensionFromFilename } from "Common/helper";
import { getSourceImage } from "utils/sourceImage";
import { find } from "lodash";


const FileUploadPreview = ({
  selectedFiles,
  uploadProgress = {},
  removeFile,
}) => {
  const [previewImage, setPreviewImage] = useState("");
  const [openPreview, setOpenPreview] = useState(false);

  const handlePreviewOpen = (imageSrc) => {
    setPreviewImage(imageSrc);
    setOpenPreview(true);
  };

  const handlePreviewClose = () => {
    setOpenPreview(false);
    setPreviewImage("");
  };
  return (
    <Box>
      <Grid container spacing={1}>
        {selectedFiles.map((file) => {
          const type = getExtensionFromFilename(file.name);
          let src = find(getSourceImage, { key: type })
          src = src || find(getSourceImage, { key: 'txt' });
          return(
          <Grid item xs={2} sm={2} md={2} key={file.name}>
            <div className="attachment-card visible-on-hover">
              <IconButton
                className="close-icon-btn invisible"
                size="small"
                onClick={() => removeFile(file.name)}
              >
                <Close fontSize="small" />
              </IconButton>
              <IconButton
                className="preview-icon-btn invisible"
                size="small"
                onClick={() => handlePreviewOpen(file)}
              >
                <Visibility fontSize="small" />
                </IconButton>
                {src.isImage ? 
                  <img  
                    src={file.file_url || file.preview?.url}
                    alt={file.file_name}
                    width={60}
                    height={60}
                    style={{ marginTop: 0 }}
                  /> : src.value
                }
            </div>
            {uploadProgress[file.name] && <LinearProgress className="mt-2" />}

            <Typography
              className="mt-2 d-block text-truncate"
              variant="caption"
            >
              {file.name}
            </Typography>
          </Grid>
        )})}
      </Grid>

      {/* Image Preview Modal */}
      <Dialog open={openPreview} onClose={handlePreviewClose}>
        <DialogTitle>
          <Grid container spacing={1}>
            <Grid item xs>
              <Typography variant="body2" className="mt-2">
                {previewImage && previewImage?.name}
              </Typography>
            </Grid>
            <Grid item xs="auto">
              <IconButton
                onClick={handlePreviewClose}
                size="small"
              >
                <Close />
              </IconButton>
            </Grid>
          </Grid>
        </DialogTitle>
        <DialogContent>
          {previewImage && previewImage?.type.startsWith("image/") ? (
            <>
              <img
                src={URL.createObjectURL(previewImage)}
                alt="Preview"
                style={{ width: "100%", height: "auto" }}
              />
            </>
          ) : (
            <Typography variant="body2" className="mt-2">
              Preview not available
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default FileUploadPreview;

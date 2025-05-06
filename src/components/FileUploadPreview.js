import React, { useEffect, useState } from "react";
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
import GetAppIcon from "@mui/icons-material/GetApp";

export const PreviewFileDialog = (props) => {
  const { openPreview, handlePreviewClose, file } = props;
  
  return (
    <Dialog open={openPreview} onClose={handlePreviewClose}>
      <DialogTitle id="alert-dialog-title">
        <Grid container spacing={1} alignItems="center">
          <Grid item xs="auto">
            {file.name}
          </Grid>
          <Grid item xs>
            {file.file_url && (
              <IconButton
                component="a"
                href={file.file_url}
                download={file.name}
                aria-label="download"
                size="small"
                className="ml-2"
              >
                <GetAppIcon />
              </IconButton>
            )}
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
        {file.isImage ? (
          <img
            src={file.file_url}
            alt="Preview"
            style={{ width: "100%", height: "auto" }}
          />
        ) : <div style={{ margin: 50, textAlign: "center" }}>
          {file.preview}
        </div>
        }
      </DialogContent>
    </Dialog>
  )
}

const FileUploadPreview = ({
  selectedFiles,
  uploadProgress = {},
  removeFile,
}) => {
  const [previewImage, setPreviewImage] = useState("");
  const [openPreview, setOpenPreview] = useState(false);
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    // Create previews
    const newPreviews = selectedFiles.map((file) => {
      if (file instanceof File || file instanceof Blob) {
        return {
          name: file.name || file.file_name || file.filename,
          src: URL.createObjectURL(file),
          isBlob: true,
        };
      } else {
        return {
          name: file.name || file.file_name || file.filename,
          src: file.file_url || file.preview?.url,
          isBlob: false,
        };
      }
    });

    setPreviews(newPreviews);

    // Cleanup function: revoke blob URLs
    return () => {
      newPreviews.forEach((preview) => {
        if (preview.isBlob) {
          URL.revokeObjectURL(preview.src);
        }
      });
    };
  }, [selectedFiles]);

  const handlePreviewOpen = (imageSrc) => {
    setPreviewImage(imageSrc);
    setOpenPreview(true);
  };

  const handlePreviewClose = () => {
    setOpenPreview(false);
    setPreviewImage("");
  };
  console.log("previews", previews);

  return (
    <Box>
      <Grid container spacing={1}>
        {previews.map((file) => {
          const type = getExtensionFromFilename(file.name);
          let src = find(getSourceImage, { key: type })
          src = src || find(getSourceImage, { key: 'txt' });
          return(
          <Grid item xs={2} sm={2} md={2} key={file.name}>
            <div className="attachment-card visible-on-hover">
              {removeFile && <IconButton
                className="close-icon-btn invisible"
                size="small"
                onClick={() => removeFile(file.name)}
              >
                <Close fontSize="small" />
              </IconButton>}
              <IconButton
                className="preview-icon-btn invisible"
                size="small"
                  onClick={() => handlePreviewOpen({
                    ...file, file_url: file.src, preview: src.value, isImage: src.isImage
                  })}
              >
                <Visibility fontSize="small" />
                </IconButton>
                {src.isImage ? 
                  <img  
                    src={file.src}
                    alt={file.name}
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
      {openPreview && (
        <PreviewFileDialog
          openPreview={openPreview}
          handlePreviewClose={handlePreviewClose}
          file={previewImage}
        />
      )}
    </Box>
  );
};

export default FileUploadPreview;

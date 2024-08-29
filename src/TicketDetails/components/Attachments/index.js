import React, { useState } from "react";
import AccordionCard from "../../../Common/AccordionCard";
import HeaderMenuOptions from "components/HeaderMenuOptions";
import {
  Box,
  Typography,
  LinearProgress,
  IconButton,
  Modal,
  Grid,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { AddCircleOutline } from "@mui/icons-material";

const Attachments = (props) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [openPreview, setOpenPreview] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const handleFileChange = (event) => {
    const newFiles = Array.from(event.target.files);
    const updatedFiles = [...selectedFiles, ...newFiles].slice(0, 4); 
    setSelectedFiles(updatedFiles);
    startUpload(newFiles); 
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files).slice(0, 4);
    const updatedFiles = [...selectedFiles, ...files].slice(0, 4);
    setSelectedFiles(updatedFiles);
    startUpload(files);
  };

  const startUpload = (files) => {
    files.forEach((file) => {
      const progressKey = file.name;
      let progress = 0;

      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress((prevProgress) => ({
          ...prevProgress,
          [progressKey]: Math.min(progress, 100),
        }));

        if (progress >= 100) {
          clearInterval(interval);
        }
      }, 200); // Simulated upload time
    });
  };

  const removeFile = (fileName) => {
    setSelectedFiles((prevFiles) =>
      prevFiles.filter((file) => file.name !== fileName)
    );
    setUploadProgress((prevProgress) => {
      const updatedProgress = { ...prevProgress };
      delete updatedProgress[fileName];
      return updatedProgress;
    });
  };

  const handlePreviewOpen = (imageSrc) => {
    setPreviewImage(imageSrc);
    setOpenPreview(true);
  };

  const handlePreviewClose = () => {
    setOpenPreview(false);
    setPreviewImage("");
  };

  const { appuser_id } = props;

  return (
    <AccordionCard
      label="Attachments"
      iconButtons={<></>}
      menuOption={
        <>
          <HeaderMenuOptions
            appuser_id={appuser_id}
            category="Attachments Card"
          />
        </>
      }
    >
      <Box>
        <Box
          className="upload-image-placeholder"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            accept="image/*"
            id="upload-file-input"
            className="upload-file-input"
            type="file"
            multiple
            onChange={handleFileChange}
          />
          <label htmlFor="upload-file-input" className="upload-file-input">
            <Typography variant="body2" className="mt-2">
              Drag and drop files or
              <span className="text-primary"> Browse</span>
            </Typography>
            <Typography variant="text-muted mb-2 mt-2">
              Supported formats: JPEG, PNG, GIF, PDF, ZIP
            </Typography>
          </label>
        </Box>
        <Grid container spacing={1} className="upload-image-row">
          {selectedFiles.map((file, index) => (
            <Grid item xs={2} sm={2} md={2} key={index}>
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
                  onClick={() => handlePreviewOpen(URL.createObjectURL(file))}
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
                <img
                  className="img-preview"
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                />
              </Box>

              <LinearProgress
                variant="determinate"
                value={uploadProgress[file.name] || 0}
                className={`mt-2 linear-progress ${
                  uploadProgress[file.name] === 100
                    ? "progress-success"
                    : "progress-bar"
                }`}
              />
              <Typography
                className="mt-2 d-block text-truncate"
                variant="caption"
              >
                {file.name}
              </Typography>
            </Grid>
          ))}

          {selectedFiles.length > 0 && selectedFiles.length < 4 && (
            <Grid item xs={2} sm={2} md={2}>
              <Box
                className="empty-single-img-box"
                onClick={() =>
                  document.getElementById("upload-file-input").click()
                }
              >
                <Typography variant="body2" color="textSecondary">
                  <AddCircleOutline />
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>

        {/* Image Preview Modal */}
        <Modal open={openPreview} onClose={handlePreviewClose}>
          <Box className="box-modal-preview">
            <img
              src={previewImage}
              alt="Preview"
              style={{ width: "100%", height: "auto" }}
            />
            <Typography variant="body2" className="mt-2">
              {
                selectedFiles.find(
                  (file) => URL.createObjectURL(file) === previewImage
                )?.name
              }
            </Typography>
          </Box>
        </Modal>
      </Box>
    </AccordionCard>
  );
};

export default Attachments;

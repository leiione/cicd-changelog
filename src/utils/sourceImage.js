import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileCsv, faFileDoc, faFilePdf, faFilePpt, faFileText, faFileXls, faFileZip, faLinkSlash } from "@fortawesome/pro-duotone-svg-icons";

export const getSourceImage = [
  { key: "txt", value: <FontAwesomeIcon icon={faFileText} size="2xl" /> },
  { key: "csv", value: <FontAwesomeIcon icon={faFileCsv} size="2xl" /> },
  { key: "jpg", value: '', isImage: true },
  { key: "bmp", value: '', isImage: true },
  { key: "gif", value: '', isImage: true },
  { key: "jpg", value: '', isImage: true },
  { key: "jpeg", value: '', isImage: true },
  { key: "png", value: '', isImage: true },
  { key: "webp", value: '', isImage: true },
  { key: "doc", value: <FontAwesomeIcon icon={faFileDoc} size="2xl" /> },
  { key: "docx", value: <FontAwesomeIcon icon={faFileDoc} size="2xl" /> },
  { key: "xls", value:  <FontAwesomeIcon icon={faFileXls} size="2xl" /> },
  { key: "xlsx", value: <FontAwesomeIcon icon={faFileXls} size="2xl" /> },
  { key: "pdf", value: <FontAwesomeIcon icon={faFilePdf} size="2xl" /> },
  { key: "ppt", value:  <FontAwesomeIcon icon={faFilePpt} size="2xl" /> },
  { key: "pptx", value: <FontAwesomeIcon icon={faFilePpt} size="2xl" /> },
  { key: "htm", value:  <FontAwesomeIcon icon={faLinkSlash} size="2xl" /> },
  { key: "html", value: <FontAwesomeIcon icon={faLinkSlash} size="2xl" /> },
  { key: "zip", value: <FontAwesomeIcon icon={faFileZip} size="2xl" /> },
  { key: "rar", value: <FontAwesomeIcon icon={faFileZip} size="2xl" /> }
]
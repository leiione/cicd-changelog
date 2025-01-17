import { ReactComponent as DefaultImage} from "assets/Generic.svg"
import { ReactComponent as WordIcon } from "assets/word.svg"
import {ReactComponent as ImageIcon } from "assets/image.svg"
import { ReactComponent as PDFIcon } from "assets/pdf.svg"
import { ReactComponent as XLSIcon } from "assets/xlxs.svg"
import { ReactComponent as LinksIcon } from "assets/links.svg"
import { ReactComponent as ZipIcon } from "assets/zip.svg"

export const getSourceImage = [
  { key: "txt", value: <DefaultImage width={60} height={60} /> },
  { key: "csv", value: <DefaultImage width={60} height={60} /> },
  { key: "jpg", value: <ImageIcon width={60} height={60} />, isImage: true },
  { key: "bmp", value: <ImageIcon width={60} height={60} />, isImage: true },
  { key: "gif", value: <ImageIcon width={60} height={60} />, isImage: true },
  { key: "jpg", value: <ImageIcon width={60} height={60} />, isImage: true },
  { key: "jpeg", value: <ImageIcon width={60} height={60} />, isImage: true },
  { key: "png", value: <ImageIcon width={60} height={60} />, isImage: true },
  { key: "doc", value: <WordIcon width={60} height={60} /> },
  { key: "docx", value: <WordIcon width={60} height={60} /> },
  { key: "xls", value: <XLSIcon width={60} height={60} /> },
  { key: "xlsx", value: <XLSIcon width={60} height={60} /> },
  { key: "pdf", value: <PDFIcon width={60} height={60} /> },
  { key: "ppt", value: <DefaultImage width={60} height={60} /> },
  { key: "pptx", value: <DefaultImage width={60} height={60} /> },
  { key: "htm", value: <LinksIcon width={60} height={60} /> },
  { key: "html", value: <LinksIcon width={60} height={60} /> },
  { key: "zip", value: <ZipIcon width={60} height={60} /> },
  { key: "rar", value: <ZipIcon width={60} height={60} /> }
]
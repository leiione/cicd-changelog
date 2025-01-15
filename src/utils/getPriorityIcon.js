import {
  ArrowCircleDownOutlined,
  RemoveCircleOutlineOutlined,
  ArrowCircleUpOutlined
} from "@mui/icons-material";

export const getPriorityIcon = (priority) => {
  switch (priority) {
    case "Low":
      return <ArrowCircleDownOutlined className="mr-2 text-muted" />;
    case "Normal":
      return <RemoveCircleOutlineOutlined className="mr-2 text-warning" />;
    case "High":
      return <ArrowCircleUpOutlined className="mr-2 text-danger" />;
    default:
      return <ArrowCircleDownOutlined className="mr-2 text-muted" />; // or a default icon
  }
}
import {
  ArrowCircleDownOutlined,
  RemoveCircleOutlineOutlined,
  ArrowCircleUpOutlined
} from "@mui/icons-material";

export const getPriorityIcon = (priority) => {
  switch (priority) {
    case "Low":
      return <ArrowCircleDownOutlined className="text-secondary" />;
    case "Normal":
      return <RemoveCircleOutlineOutlined className="mr-2 text-warning" />;
    case "High":
      return <ArrowCircleUpOutlined className="mr-2 text-success" />;
    default:
      return <ArrowCircleDownOutlined className="text-secondary" />; // or a default icon
  }
}
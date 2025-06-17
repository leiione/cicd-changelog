import { Tooltip } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faCircleArrowDown,faCircleArrowUp,} from "@fortawesome/pro-regular-svg-icons";
import dayjs from "dayjs";

export const getPriorityIcon = (priority) => {
    const iconConfig = {
        High: { icon: faCircleArrowUp, color: "#ef5350" },
        Low: { icon: faCircleArrowDown, color: "#009DFF" },
        Normal: { icon: faCircleArrowDown, color: "#ffb200" },
    };

    if (!iconConfig[priority]) return null;

    return (
        <Tooltip title={`Priority: ${priority}`} arrow>
            <span style={{ width: 14, height: 14, display: "block" }}>
                <FontAwesomeIcon
                    icon={iconConfig[priority].icon}
                    style={{ width: 14, height: 14, color: iconConfig[priority].color }}
                />
            </span>
        </Tooltip>
    );
};

export const getAvatarBackground = (name) => {
    const colors = ["#FFD54F", "#FF7043", "#4DB6AC", "#81C784", "#64B5F6"];
    const index = name.toLowerCase().charCodeAt(0) % colors.length;
    return { bg: colors[index], text: "#FFF" };
};

export const formatDate = (dateString) => {
  if (!dateString) return "Not Scheduled";
  return dayjs(dateString).format("M/D/YYYY h:mm A");
};

import { Skeleton, Typography } from "@mui/material";
import { dateFormat, formatDateTime } from "Common/utils/formatter";
import { find, get, includes } from "lodash";
import html2plaintext from "html2plaintext";

const renderSelectEditCell = (props, handleUpdateCell) => {
  return "ToDo"
};

export const getDataGridColumns = ({
  columns,
  loading,
  fullWidth,
  enableInlineEditing = false,
  handleUpdateCell,
  ispTimeZone,
  currency = '$',
  tableOptions
}) => {
  let dataGridColumns = [];
  let orderColumns = columns
  if (tableOptions?.columnOrder && tableOptions.columnOrder.length > 0) {
    orderColumns = []
    columns.forEach((col) => {
      if (col.field.includes("Actions")) {
        orderColumns.push(col)
      }
    })
    tableOptions.columnOrder.forEach((key) => {
      const col = find(columns, { field: key })
      if (col) {
        orderColumns.push(col)
      }
    });
  }

  orderColumns.forEach((col) => {
    const dgColumn = {
      ...col,
      width: Number(col.width) / Number(fullWidth ? 1 : 2) || 150,
      maxWidth: 500,
    };

    if (loading) {
      dgColumn.renderCell = (params) => {
        return (
          <Skeleton
            style={{ backgroundColor: "##d0d0d0" }}
            width="90%"
            height={20}
          />
        );
      };
    } else {
      if (includes(col.dataType, "object")) {
        dgColumn.valueGetter = (params) => {
          return get(params.row, col.path);
        };
      }

      if (col.dataType === "date") {
        dgColumn.sortComparator = (v1, v2) => new Date(v1) - new Date(v2)
      }
      if (col.dataType === "number") {
        dgColumn.sortComparator = (v1, v2) => Number(v1) - Number(v2)
      }


      if (col.format) {
        dgColumn.valueGetter = (params) => {
          switch (col.format) {
            case "dateTimewSec":
              return formatDateTime(params.value, ispTimeZone, true, false, true)
            case "date":
              return dateFormat(params.value, ispTimeZone)
            case "html":
              return html2plaintext(params.value)
            case "flag":
              return params.value ? 'Yes' : 'No'
            default:
              return params.value
          }
        };
      }

      if (col.editable) {
        if (enableInlineEditing) {
          dgColumn.editable = false
        } else {
          dgColumn.renderEditCell = (e) =>
            renderSelectEditCell(e, handleUpdateCell);
        }
      }

      // Skip overriding renderCell for rowActions column to preserve custom actions rendering
      if (["rowActions", "check", 'scheduledOff'].includes(col.field)) {
        console.log("in if")
        dgColumn.renderCell = col.renderCell;

      } else {
        dgColumn.renderCell = (params) => {
            const { value } = params;
            let cellStyles = {
              cursor: col.editable && enableInlineEditing ? "text" : "pointer",
            }
            if (params.row.disabled) {
              cellStyles.color = "gray"
              cellStyles.cursor = "default"
            }
            switch (col.render) {
              case "dates":
                return 'ToDo term dates'
              default:
                let text = "";
                if (typeof value !== "undefined" && value !== null) {
                  text = value.toString()
                }
                return (
                  <Typography className={`w-100 text-truncate`} style={cellStyles}>{text}</Typography>
                );
            }
          };
      }
    }

    dataGridColumns.push(dgColumn);
  });
  return dataGridColumns

};
import React from "react";
import { useQuery } from "@apollo/client";
import {
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Checkbox,
    Divider,
} from "@mui/material";
import InnerDrawer from '../../Common/InnerDrawer';
import { GET_ASSIGNEES } from "TicketDetails/TicketGraphQL";

const filterItems = [
    { label: "All", type: "filter" },
    { label: "Pending", type: "filter" },
    { label: "Open", type: "filter" },
    { label: "Resolved", type: "filter" },
    { label: "Others", type: "filter" },
    { label: "Queued", type: "filter" },
    { label: "Reopened", type: "filter" },
    { type: "divider" },
    { label: "High", type: "filter" },
    { label: "Normal", type: "filter" },
    { label: "Low", type: "filter" },
    { type: "divider" },
    { label: "Scheduled", type: "filter" },
    { label: "Unscheduled", type: "filter" },
];

const FilterDrawer = ({
    open,
    toggleDrawer,
    selectedFilters,
    handleToggle,
    selectedTechnician,
    onTechnicianChange,
}) => {
    const { data: { assignees } = {} } = useQuery(GET_ASSIGNEES, {
        fetchPolicy: "network-only",
    });

    return (
        <div className="filter-drawer">
        <InnerDrawer
            anchor="right"
            className="settings-drawer"
            open={open}
            onCloseDrawer={toggleDrawer(false)}
            header='Filter'
            variant='temporary'
        >
            <List sx={{ p: 2 }}>
                <FormControl variant="standard" sx={{ width: '100%', mb: 2, '& .MuiInputLabel-root': { mb: 1 }, padding: "0px 15px" }}>
                    <InputLabel id="technician-select-label" sx={{ padding: "8px 8px 8px 15px" }}>Select Technician</InputLabel>
                    <Select
                        sx={{ width: '100%', '& .MuiSelect-select': { pt: 1.3, px: 2 }, }}
                        value={selectedTechnician}
                        onChange={(e) => onTechnicianChange(e.target.value)}
                        labelId="technician-select-label"
                    >
                        <MenuItem value="">All technicians</MenuItem>
                        {assignees?.map(({ appuser_id, realname }) => (
                            <MenuItem key={appuser_id} value={appuser_id}>{realname}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {filterItems.map((item, index) => item.type === "divider" ? (
                    <Divider key={`divider-${index}`} sx={{ my: 0.5 }} />
                ) : (
                    <ListItem key={item.label} onClick={() => handleToggle(item.label)} sx={{py:0}}>
                        <ListItemIcon>
                            <Checkbox checked={selectedFilters.includes(item.label)} sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }} />
                        </ListItemIcon>
                        <ListItemText sx={{ fontWeight: '400px', lineHeight: '24px', letterSpacing: '0.17px' }} primary={item.label} />
                    </ListItem>
                ))}
            </List>
        </InnerDrawer>
        </div>
    );
};

export default FilterDrawer;

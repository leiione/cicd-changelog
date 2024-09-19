import React from "react";
import HookSelectField from "Common/hookFields/HookSelectField";
import { MenuItem } from "@mui/material";

const SearchRadius = (props) => {
    const { radius, control } = props;
    const options = [
        { value: 1, label: "1 mile" },
        { value: 5, label: "5 miles" },
        { value: 10, label: "10 miles" },
        { value: 25, label: "25 miles" },
        { value: 50, label: "50 miles" },
    ]
        
    return (
        <div style={{ width: 100, marginRight: 5, paddingBottom: 2}}>
            <HookSelectField
                name="searchRadius"
                control={control}
                defaultValue={radius}
                label="Search Radius"
                value={radius}
            >
                {options.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                        {option.label}
                    </MenuItem>
                ))}
            </HookSelectField>
        </div>
    );
    }

export default SearchRadius
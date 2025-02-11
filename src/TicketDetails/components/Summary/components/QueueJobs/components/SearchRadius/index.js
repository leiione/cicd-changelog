import React from "react";
import { MenuItem, Select } from "@mui/material";

const SearchRadius = (props) => {
    const { radius, setRadius } = props;
    const options = [
        { value: 1, label: "1 mile" },
        { value: 3, label: "3 miles" },
        { value: 5, label: "5 miles" },
        { value: 10, label: "10 miles" }
    ]
        
    return (
        <div style={{ width: 100, marginRight: 5, paddingBottom: 2 }}>
            <Select
                variant="standard"
                label="Search Radius"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
            >
                {options.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                        {option.label}
                    </MenuItem>
                ))}
            </Select>
        </div>
    );
}

export default SearchRadius
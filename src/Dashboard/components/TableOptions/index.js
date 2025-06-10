import React, { useState } from "react"
import { Grid, IconButton, Toolbar } from "@mui/material"
import TechnicianButton from "./components/TechnicianButton"
import StatusButtons from "./components/StatusButtons"
import PriorityButtons from "./components/PriorityButtons"
import SchedulingButtons from "./components/SchedulingButtons"
import { Search } from "@mui/icons-material"
import SearchField from "./components/SearchField"

const Options = props => {
  const { searchVal, setSearchVal } = props;
  const [showSearch, setShowSearch] = useState(false);

  return (
    <Toolbar 
      disableGutters 
      sx={{ 
        display: 'flex', 
        overflowX: 'auto', 
        padding: 0,
        minHeight: '48px'
      }}
    >
      <Grid 
        container 
        spacing={1} 
        alignItems="center" 
        wrap="nowrap" 
        sx={{ marginLeft: 0, paddingLeft: 0 }}
      >
        <Grid item sx={{ display: 'flex', paddingLeft: '0 !important' }}>
          <React.Suspense fallback={"loading..."}>
            <TechnicianButton {...props} />
          </React.Suspense>
          <StatusButtons />
        </Grid>
        <Grid item>
          <PriorityButtons />
        </Grid>
        <Grid item>
          <SchedulingButtons {...props}/>
        </Grid>
        <Grid item sx={{ marginLeft: 'auto', paddingRight: '8px' }}>
          {showSearch ? (
            <SearchField searchVal={searchVal} setSearchVal={setSearchVal} setShowSearch={setShowSearch} />
          ) : (
            <IconButton onClick={() => setShowSearch(!showSearch)}>
              <Search />
            </IconButton>
          )}
        </Grid>
      </Grid>
    </Toolbar>
    )
}

export default Options

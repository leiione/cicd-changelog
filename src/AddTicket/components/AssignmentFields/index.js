import { Grid, Typography } from '@mui/material';
import React from 'react';
import EquipmentField from './components/EquipmentField';
import InfrastructureField from './components/InfrastructureField';

const AssignmentFields = (props) => {
  const { values } = props;

  let dropdown = ''

  switch (values.category_type) {
    case "Infrastructure":
      dropdown = (<InfrastructureField {...props} />)
      break
    case "Equipment":
      dropdown = (<EquipmentField {...props} />)
      break
    case "Subscriber":
      dropdown = "TODO"
      break
    default:
      dropdown = "Invalid type"
  }

  return (
    <>
      <Grid item xs={5}>
        <Typography variant="subtitle1" className="f-14 text-dark">{`${values.category_type}:`}</Typography>
      </Grid>
      <Grid item xs={7} style={{ marginBottom: "-15px" }}>
        {dropdown}
      </Grid>
    </>
  )

}

export default AssignmentFields;
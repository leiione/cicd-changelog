import HookAutoCompleteField from "Common/hookFields/HookAutoCompleteField";
import React from "react";

const EmailTemplates = props => {
  const { control, templates } = props;
  return (
    <HookAutoCompleteField
      control={control}
      name={"me_id"}
      label={""}
      options={templates}
      InputLabelProps={{ shrink: true }}
      style={{ width: "180%" }}
      disableClearable={true}
    />
  )
}

export default EmailTemplates
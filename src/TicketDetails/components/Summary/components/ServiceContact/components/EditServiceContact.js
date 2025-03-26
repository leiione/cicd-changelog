import { Button, Divider, Grid, Typography } from "@mui/material"
import PropTypes from 'prop-types';
import SiteContactDropdown from "./SiteContactDropdown"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBuildings, faLocationDot } from "@fortawesome/pro-regular-svg-icons";
import HookTextField from "Common/hookFields/HookTextField";
import { useForm } from "react-hook-form";
import { useEffect, useMemo } from "react";
import { getPaymentStatusIcon, getPaymentStatusIconClass } from "utils/getPaymnetIcon";
import ContactAddressDropdown from "./ContactAddressDropdown";
import ContactNumberField from "./ContactNumberField";
import EmailDropdown from "./EmailDropdown";
import ProgressButton from "Common/ProgressButton";
import { omit } from "lodash";

const EditServiceContact = (props) => {
  const {
    onEditMode,
    control,
    values,
    setValue,
    isSubscriber,
    cLoading,
    cError,
    cData,
    contact,
    ticket,
  } = props

  return (
    <>
      {onEditMode && !isSubscriber && (
        <Grid item xs={12}>
          <SiteContactDropdown
            loading={cLoading}
            error={cError}
            data={cData}
            setValue={setValue}
            values={values}
          />
        </Grid>
      )}
      <Grid item xs={12}>
        <Typography variant="subtitle1">
          <FontAwesomeIcon icon={faBuildings} className="fa-fw text-muted f-16 mr-2" />
          {values.main_company || "-"}
        </Typography>
      </Grid>
      <Grid item xs={12} className="d-inline-flex">
        <FontAwesomeIcon
          icon={getPaymentStatusIcon(!isSubscriber ? null : values.payment_status)}
          className={`fa-fw f-16 mr-2 ${getPaymentStatusIconClass(!isSubscriber ? null : values.payment_status)}`}
          style={{ fontSize: '2rem' }} // Increase icon size
        />
        {onEditMode ?
          <HookTextField
            control={control}
            name="ticket_contact_name"
            required
            style={{ marginTop: "-3px", width: "25%" }}
            InputProps={{ disableUnderline: true }}
          />
          : <Typography variant="subtitle1" style={{ width: "43%" }}>
            {values.ticket_contact_name}
          </Typography>
        }
      </Grid>
      {onEditMode && <Divider style={{ width: "25%", marginLeft: "5%" }} />}
      <Grid item xs={12} className="d-inline-flex">
        <FontAwesomeIcon icon={faLocationDot} className="fa-fw text-muted f-16 mr-2" />
        <Typography variant="subtitle1" style={{ width: "40%" }}>
          {values.address || "-"}
        </Typography>
        {onEditMode && <ContactAddressDropdown
          ticket={ticket}
          selectedAddress={values.address}
          setValue={setValue}
          customer={contact}
          customerAddress={values.address}
          cLoading={cLoading}
          cError={cError}
          cData={cData}
        />}
      </Grid>
      {onEditMode && <Divider style={{ width: "42%", marginLeft: "5%" }} />}
      <ContactNumberField onEditMode={onEditMode} values={values} contact={contact} setValue={setValue} isSubscriber={isSubscriber} />
      <EmailDropdown onEditMode={onEditMode} values={values} contact={contact} setValue={setValue} isSubscriber={isSubscriber} />
    </>
  )
}

const EditServiceContactForm = (props) => {
  const { ticket, contact, onEditMode, setEditMode, updateTicket } = props;

  const initialValues = useMemo(() => {
    return {
      ticket_contact_name: ticket.ticket_contact_name ? ticket.ticket_contact_name : `${contact.first_name} ${contact.last_name}`,
      main_company: contact.main_company,
      address: ticket.address
        ? ticket.address
        : ticket.infrastructure_address,
      ticket_contact_numbers: ticket.ticket_contact_numbers,
      ticket_contact_emails: ticket.ticket_contact_emails || ticket.ticket_contact_email,
      payment_status: ticket.payment_status || null
    };
  }, [ticket, contact]);

  let form = useForm({
    defaultValues: initialValues,
    mode: "onChange",
    reValidateMode: "onSubmit"
  });
  
  useEffect(() => {
    form.reset(initialValues)
    // eslint-disable-next-line
  }, [ticket, contact]);

  const { formState, handleSubmit, watch } = form;
  const { isSubmitting, isDirty } = formState;
  const values = watch()

  const onSubmit = async (values) => {
    await updateTicket({ ticket_id: ticket.ticket_id, ...omit(values, ['main_company', 'payment_status']) });
    setTimeout(() => {
      setEditMode(false);
    }, 500); // so value wont change
  }

  return (
    <>
      <EditServiceContact {...props}  {...form} values={values} />
      {onEditMode && (
        <Grid item xs={9}>
          <Divider />
          <div className="text-right">
            <ProgressButton
              color="primary"
              size="large"
              style={{ padding: "5px" }}
              onClick={handleSubmit(onSubmit)}
              disabled={!isDirty || !values.ticket_contact_name || !values.address}
              isSubmitting={isSubmitting}
            >
              Save
            </ProgressButton>
            <Button
              className="bg-white text-muted"
              size="large"
              style={{ padding: "5px" }}
              onClick={() => {
                setEditMode(false)
                form.reset()
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </Grid>
      )}
    </>
  )
}

EditServiceContact.propTypes = {
  onEditMode: PropTypes.bool.isRequired,
  control: PropTypes.object.isRequired,
  isSubscriber: PropTypes.bool,
  values: PropTypes.object.isRequired,
  setValue: PropTypes.func,
  cLoading: PropTypes.bool,
  cError: PropTypes.string,
  cData: PropTypes.object,
  contact: PropTypes.shape({
    main_company: PropTypes.string,
    first_name: PropTypes.string,
    last_name: PropTypes.string,
  }).isRequired,
  ticket: PropTypes.shape({
    ticket_contact_name: PropTypes.string,
    address: PropTypes.string,
    ticket_contact_numbers: PropTypes.string,
    ticket_contact_email: PropTypes.string,
    payment_status: PropTypes.number,
    infrastructure_address: PropTypes.string,
    ticket_id: PropTypes.number,
  }).isRequired
};

EditServiceContactForm.propTypes = {
  ticket: PropTypes.shape({
    ticket_contact_name: PropTypes.string,
    address: PropTypes.string,
    ticket_contact_numbers: PropTypes.string,
    ticket_contact_email: PropTypes.string,
    payment_status: PropTypes.number,
    ticket_id: PropTypes.number,
    infrastructure_address: PropTypes.string,
  }).isRequired,
  contact: PropTypes.shape({
    main_company: PropTypes.string,
    first_name: PropTypes.string,
    last_name: PropTypes.string,
  }).isRequired,
  onEditMode: PropTypes.bool.isRequired,
  setEditMode: PropTypes.func.isRequired,
  updateTicket: PropTypes.func.isRequired
};

export default EditServiceContactForm
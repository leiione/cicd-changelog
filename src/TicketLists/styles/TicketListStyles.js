import { styled } from "@mui/material/styles";
import { Button, Chip, Accordion, AccordionSummary, AccordionDetails, Typography, Box } from "@mui/material";

export const HeaderContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: '#E9EDFC',
  height: 62,
  padding: '15px 16px',
});

export const HeaderTitle = styled(Typography)({
  color: '#2E2E2E',
  fontSize: '16px',
  fontWeight: 700,
});

export const TicketListContainer = styled(Box)({
  height: 'calc(100vh - 135px)',
  overflowY: 'auto',
  padding: 16,
});

export const StyledAccordion = styled(Accordion)({
  border: "1px solid #0000001F",
  borderRadius: "4px",
  backgroundColor: "#FFFFFF",
  padding: "6px",
  marginBottom: 8,
});

export const StyledAccordionSummary = styled(AccordionSummary)({
  display: "flex",
  alignItems: "center",
  padding: "0px !important",
  backgroundColor: "#FFFFFF !important",
  "& .MuiAccordionSummary-expandIconWrapper": {
    position: "absolute",
    right: 0,
  },
});

export const SummaryContentBox = styled(Box)({
  display: "flex",
  alignItems: "center",
  width: "100%",
  color: "black",
});

export const TicketIdTypography = styled(Typography)({
  color: "#000000DE",
  fontSize: "12px",
  fontWeight: "700",
  paddingRight: 8,
});

export const PriorityTypography = styled(Typography)({
  color: "#56616A",
  fontSize: "12px",
  fontWeight: "400",
});

export const StyledAccordionDetails = styled(AccordionDetails)({
  backgroundColor: "#ffffff !important",
  padding: "0px !important",
});

export const DetailsContentBox = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: 8,
});

export const StyledStatusChip = styled(Chip)({
  borderRadius: 12,
  height: 22,
  backgroundColor: "white",
  border: "1px solid #c5cacd",
});

export const LabelTypography = styled(Typography)({
  paddingRight: "5px",
  flexShrink: 0,
  color: "black",
});

export const StyledViewTicketButton = styled(Button)({
  textTransform: "none",
  borderRadius: 4,
  marginTop: 16,
  width: "100%",
  maxWidth: "400px",
  backgroundColor: "#ffffff",
  color: "#0053F4",
  border: "1px solid #0053F4",
  margin: "10px 0 5px 0",
});

export const NoTicketsContainer = styled(Box)({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100%",
});

export const NoTicketsText = styled(Typography)({
  variant: "h6",
  color: "textSecondary",
});
import React from "react";
import {  Typography, Box, useMediaQuery, Tooltip} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/pro-regular-svg-icons";
import {getPriorityIcon,getAvatarBackground,formatDate} from "../../utils/ticketListHelpers";
import {
  StyledAccordion,
  StyledAccordionSummary,
  SummaryContentBox,
  TicketIdTypography,
  PriorityTypography,
  StyledAccordionDetails,
  DetailsContentBox,
  StyledStatusChip,
  LabelTypography,
  StyledViewTicketButton
} from "../styles/TicketListStyles";

const TicketItem = ({ tickets, expandedTicketId, handleAccordionChange }) => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTablet = useMediaQuery("(max-width:960px)");

  return (
    <>
      {tickets.map((ticket) => {
        const firstLetter = ticket.technician_name
          ? ticket.technician_name.charAt(0).toUpperCase()
          : "";

        const avatarColor = getAvatarBackground(ticket.technician_name);

        return (
          <StyledAccordion
            key={ticket.ticket_id}
            expanded={expandedTicketId === ticket.ticket_id}
            onChange={() => handleAccordionChange(ticket.ticket_id)}
          >
            <StyledAccordionSummary
              expandIcon={<FontAwesomeIcon icon={faChevronDown} />}
            >
              <SummaryContentBox>
                <TicketIdTypography>
                  Ticket ID: {ticket.ticket_id}
                </TicketIdTypography>
                <Box sx={{ paddingRight: 1 }}>{getPriorityIcon(ticket.priority)}</Box>
                <PriorityTypography>{ticket.priority}</PriorityTypography>
              </SummaryContentBox>
            </StyledAccordionSummary>

            <StyledAccordionDetails>
              <DetailsContentBox>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <LabelTypography variant="caption">Status:</LabelTypography>
                  <StyledStatusChip label={ticket.status} size="small" />
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <LabelTypography variant="caption">Summary:</LabelTypography>
                  <Typography
                    variant="caption"
                    sx={{
                      maxWidth: isMobile ? "200px" : isTablet ? "300px" : "100%",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {ticket.summary}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <LabelTypography variant="caption">Assignee:</LabelTypography>
                  <Box display="flex" alignItems="center">
                    <Tooltip title={ticket.technician_name} arrow>
                      <Box
                        sx={{
                          width: 18,
                          height: 18,
                          marginRight: 1,
                          backgroundColor: avatarColor.bg,
                          color: avatarColor.text,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "50%",
                          fontSize: "12px",
                        }}
                      >
                        {firstLetter}
                      </Box>
                    </Tooltip>
                    <Typography variant="caption">
                      {ticket.technician_name}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <LabelTypography variant="caption">Start Date:</LabelTypography>
                  <Typography variant="caption">
                    {formatDate(ticket.start)}
                  </Typography>
                </Box>
              </DetailsContentBox>

              <StyledViewTicketButton variant="outlined">View Ticket</StyledViewTicketButton>
            </StyledAccordionDetails>
          </StyledAccordion>
        );
      })}
    </>
  );
};

export default TicketItem;
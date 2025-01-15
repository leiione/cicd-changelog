
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { faUser as faUserOutline } from '@fortawesome/free-regular-svg-icons';

export const getPaymentStatusIconClass = (payment_status) => {
  switch (payment_status) {
    case 1:
      return "text-success"
    case 2:
      return "text-warning"
    case 4:
      return "text-danger"
    case 8:
      return "text-danger"
    case 9:
      return "text-primary"
    case 10:
    case 20:
      return "text-muted"
    default:
      return "text-light"
  }
}

export const getPaymentStatusIcon = (payment_status) => {
  if (payment_status === 8) {
    return faUserOutline; // Return the outline icon for payment_status 8
  }
  return faUser; // Return the default solid icon for other statuses
};
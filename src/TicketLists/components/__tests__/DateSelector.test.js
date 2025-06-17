import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DateSelector from '../DateSelector';

jest.mock('@mui/x-date-pickers-pro', () => {
  const dayjs = require('dayjs'); // Import inside the mock

  return {
    MobileDateRangePicker: ({ open, onClose, onAccept }) => {
      if (!open) return null;
      return (
        <div data-testid="mocked-date-picker">
          <button onClick={() => onAccept([dayjs('2025-03-01'), dayjs('2025-03-10')])}>
            Set Date
          </button>
          <button onClick={onClose}>Close</button>
        </div>
      );
    },
  };
});

describe('DateSelector Component', () => {
  const dayjs = require('dayjs'); // Import it normally for other tests
  const initialDateRange = [dayjs('2025-01-01'), dayjs('2025-01-10')];
  let setDateRangeMock;
  let resetPagination;

  beforeEach(() => {
    setDateRangeMock = jest.fn();
    resetPagination = jest.fn();
  });

  it('should render the component with correct initial date range', () => {
    render(<DateSelector dateRange={initialDateRange} setDateRange={setDateRangeMock} />);
    expect(screen.getByText('Jan 1, 2025 - Jan 10, 2025')).toBeTruthy();
  });

  it('should open the date picker on click', () => {
    render(<DateSelector dateRange={initialDateRange} setDateRange={setDateRangeMock} />);
    fireEvent.click(screen.getByText('Jan 1, 2025 - Jan 10, 2025'));
    expect(screen.getByTestId('mocked-date-picker')).toBeTruthy();
  });

  it('should call setDateRange when dates are selected', () => {
    render(<DateSelector dateRange={initialDateRange} setDateRange={setDateRangeMock} reset={resetPagination} />);
    fireEvent.click(screen.getByText('Jan 1, 2025 - Jan 10, 2025'));

    fireEvent.click(screen.getByText('Set Date'));
    expect(setDateRangeMock).toHaveBeenCalledWith([dayjs('2025-03-01'), dayjs('2025-03-10')]);
  });

  it('should close the date picker when closed', () => {
    render(<DateSelector dateRange={initialDateRange} setDateRange={setDateRangeMock} />);
    fireEvent.click(screen.getByText('Jan 1, 2025 - Jan 10, 2025'));

    fireEvent.click(screen.getByText('Close'));
    expect(screen.queryByTestId('mocked-date-picker')).not.toBeTruthy();
  });
});

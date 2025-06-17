import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FilterDrawer from '../FilterDrawer';
import { MockedProvider } from '@apollo/client/testing';
import { GET_ASSIGNEES } from 'TicketDetails/TicketGraphQL';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme();

const mockTechnicians = [
    { id: 1, appuser_id: 1, username: 'Tech1' },
    { id: 2, appuser_id: 2, username: 'Tech2' },
];

const mocks = [
    {
        request: {
            query: GET_ASSIGNEES,
        },
        result: {
            data: {
                appuserTechnicians: mockTechnicians,
            },
        },
    },
];

describe('FilterDrawer', () => {
    const toggleDrawer = jest.fn();
    const handleToggle = jest.fn();
    const onTechnicianChange = jest.fn();
    const props = {
        open: true,
        toggleDrawer: toggleDrawer,
        selectedFilters: ['High'],
        handleToggle: handleToggle,
        isp_Id: 2267,
        selectedTechnician: 'All technicians',
        onTechnicianChange: onTechnicianChange,
    };

    beforeAll(() => {
        jest.spyOn(console, 'warn').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it('should mount without crashing', () => {
       
        render(
            <MockedProvider mocks={mocks} addTypename={false}>
                <ThemeProvider theme={theme}>
                    <FilterDrawer {...props} />
                </ThemeProvider>
            </MockedProvider>
        );
    });

    it('calls handleToggle when a filter item is clicked', async () => {
        render(
            <MockedProvider mocks={mocks} addTypename={false}>
                <ThemeProvider theme={theme}>
                    <FilterDrawer {...props} />
                </ThemeProvider>
            </MockedProvider>
        );

            fireEvent.click(screen.getByText('Open'))
        
        expect(handleToggle).toHaveBeenCalledWith('Open');
    });
   
    it('should render the header correctly', () => {
        
        render(
            <MockedProvider mocks={mocks} addTypename={false}>
                <ThemeProvider theme={theme}>
                    <FilterDrawer {...props} />
                </ThemeProvider>
            </MockedProvider>
        );

        const header = screen.queryByText('Filter');
        expect(header).toBeTruthy();
    });

    it('should render the "High" filter item correctly', () => {
       
        render(
            <MockedProvider mocks={mocks} addTypename={false}>
                <ThemeProvider theme={theme}>
                    <FilterDrawer {...props} />
                </ThemeProvider>
            </MockedProvider>
        );

        const pendingFilter = screen.getByText('High');
        expect(pendingFilter).toBeTruthy();
    });
});
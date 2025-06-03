import React, { useEffect, useMemo } from 'react';
import { Box, Typography, Card, CardContent, Button } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { Responsive, WidthProvider } from 'react-grid-layout';
import TicketsTable from './components/TicketsTable';
import { useSelector, useDispatch } from 'react-redux';
import { useMutation, useQuery } from '@apollo/client';
import { SAVE_USER_PREFERENCES, GET_USER_PREFERENCES } from '../components/UserPreferences/UserPreferencesGraphQL';
import { setDashboardCards, preferenceSaved, setInitialUserPreferences, populateISPUserSettings, setContentDrawer } from '../config/store';
import AddWidget from './components/AddWidget';
import GlobalSnackbar from 'Common/GlobalSnackbar';
import TicketWidget from './components/TicketWidget';
import ContentDrawer from './components/ContentDrawer';
import { find } from 'lodash';

const ResponsiveGridLayout = WidthProvider(Responsive);

const Dashboard = (props) => {
  const { userPreferences, hideContentDrawer, dockedItems } =  props;
  const dispatch = useDispatch();
  const { items = [], nextId = 1 } = useSelector(state => state.ticketDashboardWidget || {});
  const contentDrawer = useSelector(state => state.contentDrawer);
  const lastChanges = useSelector(state => state.userPreferencesTimeStamp);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const [saveCRMUserPreferences] = useMutation(SAVE_USER_PREFERENCES);

  // Load saved preferences
  useEffect(() => {
    if (userPreferences && (userPreferences.ticketDashboardWidget || userPreferences.dashboardWidget)) {
      try {
        dispatch(setDashboardCards(userPreferences.ticketDashboardWidget || userPreferences.dashboardWidget));
      } catch (error) {
        console.error('Error parsing user preferences:', error);
      }
    }
  }, [userPreferences, dispatch]);

  // Save preferences when changes occur
  useEffect(() => {
    if (lastChanges === null) return;

    const savePreferences = () => {
      const authorization = localStorage.getItem("Visp.token");
      if (authorization) {
        saveCRMUserPreferences({
          variables: {
            preferences: JSON.stringify({
              ticketDashboardWidget: { items, nextId }
            })
          },
          update: (cache, { data }) => {
            cache.writeQuery({
              query: GET_USER_PREFERENCES,
              data: {
                getCRMUserPreferences: { ...userPreferences, ...data.saveCRMUserPreferences}
              }
            })
          }
        }).then(() => {
          dispatch(preferenceSaved());
        });
      }
    };

    const timeoutId = setTimeout(savePreferences, 1000);
    return () => clearTimeout(timeoutId);
  }, [lastChanges, items, nextId, saveCRMUserPreferences, dispatch, userPreferences]);

  const layouts = {
    lg: items.map(({ i, x, y, w, h }) => ({ i, x, y, w, h })),
    md: items.map(({ i, x, y, w, h }) => ({ i, x, y, w: 1, h })),
    sm: items.map(({ i, x, y, w, h }) => ({ i, x: 0, y, w: 1, h })),
    xs: items.map(({ i, x, y, w, h }) => ({ i, x: 0, y, w: 1, h }))
  };

  const findFirstAvailablePosition = (items) => {
    const occupiedPositions = new Set();

    // Assume all widgets have height 2
    const columns = 2;

    // Fill occupiedPositions for all cells covered by each widget (each item occupies multiple rows)
    items.forEach(item => {
      for (let y = item.y; y < item.y + item.h; y++) {
        occupiedPositions.add(`${item.x},${y}`);
      }
    });

    // Find the first available position that can fit height 2
    let maxY = items.length > 0 ? Math.max(...items.map(item => item.y + item.h - 1)) : -1;

    for (let y = 0; y <= maxY + 1; y++) {
      for (let x = 0; x < columns; x++) {
        // Check if both rows for height=2 are available
        if (
          !occupiedPositions.has(`${x},${y}`) &&
          !occupiedPositions.has(`${x},${y + 1}`)
        ) {
          return { x, y };
        }
      }
    }

    // If everything is full, add at the next available row
    return { x: 0, y: maxY + 1 };
  };

  const handleAddWidget = (formData) => {
    const { x, y } = findFirstAvailablePosition(items);
    dispatch(setDashboardCards({
      items: [...items, {
        i: `widget-${nextId}`,
        x,
        y,
        w: 1,
        h: 2,
        title: formData.title,
        filters: formData.filters,
        tableState: {
          pageSize: 25,
          pageNumber: 0,
          columnOrder: ["ticket_id", "summary", "priority", "status", "type"],
        },
        flag_subscriber_deleted: false,
      }],
      nextId: nextId + 1
    }));
  };

  const onRemoveItem = (id) => {
    dispatch(setDashboardCards({
      items: items
        .filter((item) => item.i !== id)
        .map((widget, index) => ({
          ...widget,
          x: index % 2,
          y: Math.floor(index / 2)
        }))
    }));
  };

  const onLayoutChange = (newLayout) => {
    dispatch(setDashboardCards({
      items: items.map(item => {
        const layoutItem = newLayout.find(l => l.i === item.i);
        return layoutItem ? { ...item, ...layoutItem } : item;
      })
    }));
  };

  return (
    <div className="drawer-wrapper-full">

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddCircleIcon />}
          onClick={() => setIsModalOpen(true)}
        >
          Add Widget
        </Button>
      </Box>

      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
        cols={{ lg: 2, md: 2, sm: 1, xs: 1 }}
        rowHeight={200}
        isDraggable={true}
        isResizable={false}
        preventCollision={false}
        autoSize={true}
        margin={[16, 16]}
        onLayoutChange={(layout, layouts) => onLayoutChange(layout)}
        resizeHandles={[]}
        style={{
          '& .react-resizable-handle': {
            display: 'none !important'
          }
        }}
        draggableCancel=".edit-title-area" 
        draggableHandle=".card-drag-handle" 

      >

        {items.map((item, index) =>
          <Card
            key={item.i}
            sx={{
              width: '100%',
              height: '100%',
              position: 'relative',
              cursor: 'grab',
              '&:active': {
                cursor: 'grabbing'
              },
              '& .react-resizable-handle': {
                display: 'none !important'
              }
            }}
            className="react-grid-item"
          >
            <CardContent style={{ paddingBottom: "10px"}}>
              <TicketWidget
                item={item}
                items={items}
                index={index}
                nextId={nextId}
                onRemoveItem={onRemoveItem}
                hideContentDrawer={hideContentDrawer}
                dockedItems={dockedItems}
              />
            </CardContent>
          </Card>
        )}
      </ResponsiveGridLayout>
      {isModalOpen &&
        <AddWidget
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddWidget}
        />
      }
      {/* Tickets Table Section */}
      <Box sx={{ mt: 4, p: 2 }}>
        <Typography variant="h5" gutterBottom>Tickets</Typography>
        <Card>
          <CardContent sx={{ height: '500px' }}>
            <TicketsTable hideContentDrawer={hideContentDrawer} dockedItems={dockedItems}/>
          </CardContent>
        </Card>
      </Box>

      {/* Global Snackbar Component */}
      <GlobalSnackbar
        open={useSelector((state) => state.snackbar?.open || false)}
        severity={useSelector((state) => state.snackbar?.severity || 'info')}
        message={useSelector((state) => state.snackbar?.message || '')}
        duration={useSelector((state) => state.snackbar?.duration || 4000)}
      />
      {contentDrawer && contentDrawer.open && contentDrawer.id > 0 && 
        <ContentDrawer
          {...contentDrawer}
          {...props}
          category={"Service Desk"}
        />
      }
    </div>
  );
};

const DashboardPreferences = props => {
  const dispatch = useDispatch();
  const ispId = localStorage.getItem("Visp.ispId")
  const { timeZone, settingsPreferences, user, flags, networkStatus, dockedItems } = props
  
  const { data, loading } = useQuery(GET_USER_PREFERENCES, {
    fetchPolicy: "cache-first",
    nextFetchPolicy: "cache-only",
    variables: {
      ispId: Number(ispId),
    },
  });

  const memoizedUserPreferences = useMemo(() => 
    loading ? null : data?.getCRMUserPreferences
  , [loading, data]);

  useEffect(() => {
    // to close or open drawer on render
    const openedFromDocked = find(dockedItems, { open: true })
    if (openedFromDocked) {
      dispatch(setContentDrawer({
        open: true,
        component: 'ticket',
        description: openedFromDocked.description,
        id: openedFromDocked.id,
        ticket_id: openedFromDocked.id,
        ticket: openedFromDocked
      }));
    }
    // eslint-disable-next-line 
  }, [dockedItems])

  useEffect(() => {
    // initialize redux based on saved user preferences
    if (data && !loading) {
      const userPreferences = data.getCRMUserPreferences;
      dispatch(setInitialUserPreferences(userPreferences));
    }
  }, [data, loading, dispatch])

  useEffect(() => {
    if (ispId) {
      dispatch(populateISPUserSettings({ ispId: Number(ispId), timeZone, settingsPreferences, user, flags, networkStatus, dockedItems }))
    } else {
      // app was rendered outside main app so fetch separately
    }
  }, [dispatch, timeZone, settingsPreferences, user, ispId, flags, networkStatus, dockedItems])

  return (
    <Dashboard {...props} userPreferences={memoizedUserPreferences} />
  )

}

export default DashboardPreferences;

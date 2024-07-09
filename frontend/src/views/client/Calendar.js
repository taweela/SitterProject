/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// ** React Import
import { useEffect, useRef, memo } from 'react';

// ** Full Calendar & it's Plugins
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

// ** Third Party Components
import toast from 'react-hot-toast';
import { Menu } from 'react-feather';
import { Card, CardBody } from 'reactstrap';

const Calendar = (props) => {
  // ** Refs
  const calendarRef = useRef(null);

  // ** Props
  const { events, calendarsColor, handleAddEventSidebar, calendarApi, setCalendarApi, blankEvent, selectedEvent, setSelectedEvent, updateEvent } = props;
  const calendarOptions = {
    events: events,
    plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      start: 'sidebarToggle, prev,next, title',
      end: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    editable: true,
    eventResizableFromStart: true,
    dragScroll: true,
    dayMaxEvents: 5,
    navLinks: true,

    eventClassNames({ event: calendarEvent }) {
      const colorName = calendarsColor[calendarEvent._def.extendedProps.calendar];
      return [
        // Background Color
        `bg-${colorName} border-0`
      ];
    },

    eventClick({ event: clickedEvent }) {
      // console.log(clickedEvent);
      setSelectedEvent(clickedEvent);
      handleAddEventSidebar();
    },

    dateClick(info) {
      const ev = blankEvent;
      ev.start = info.date;
      ev.end = info.date;
      setSelectedEvent(ev);
      handleAddEventSidebar();
    },
    // eventDrop({ event: droppedEvent }) {
    //   toast.success('Event Updated');
    // },
    // eventResize({ event: resizedEvent }) {
    //   toast.success('Event Updated');
    // },

    ref: calendarRef,
    direction: 'ltr'
  };

  return (
    <Card className="shadow-none border-0 mb-0 rounded-0">
      <CardBody className="pb-0">
        <FullCalendar {...calendarOptions} />{' '}
      </CardBody>
    </Card>
  );
};

export default memo(Calendar);

import React, { useState, useEffect } from "react";
import "./Calendar.css";

const Calendar = () => {
  const [events, setEvents] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [eventName, setEventName] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventInvitees, setEventInvitees] = useState("");
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [addEventTitle, setAddEventTitle] = useState("Add Event");

  useEffect(() => {
    const storedEvents = localStorage.getItem("events");
    if (storedEvents) {
      setEvents(JSON.parse(storedEvents));
    }
  }, []);

  const handleAddEvent = (date) => {
    const newEvents = { ...events };
    if (!newEvents[date]) {
      newEvents[date] = [];
    }

    const today = new Date();
    if (date < today) {
      alert("You can't add events for past dates!");
      return;
    }

    if (newEvents[date].length >= 3) {
      alert("Maximum 3 events allowed per day!");
      return;
    }

    const newEvent = {
      name: eventName,
      time: eventTime,
      invitees: eventInvitees,
      color: getRandomColor(),
    };
    newEvents[date].push(newEvent);
    setEvents(newEvents);
    localStorage.setItem("events", JSON.stringify(newEvents));
    setShowAddEvent(false);
    setEventName("");
    setEventTime("");
    setEventInvitees("");
  };

  const handleEditEvent = () => {
    const date = selectedEvent.date;
    const index = selectedEvent.index;
    const updatedEvent = {
      name: eventName,
      time: eventTime,
      invitees: eventInvitees,
      color: selectedEvent.color,
    };
    const newEvents = { ...events };
    newEvents[date][index] = updatedEvent;
    setEvents(newEvents);
    localStorage.setItem("events", JSON.stringify(newEvents));
    setSelectedEvent(null);
    setShowAddEvent(false);
    setEventName("");
    setEventTime("");
    setEventInvitees("");
  };

  const handleDeleteEvent = () => {
    const date = selectedEvent.date;
    const index = selectedEvent.index;
    const newEvents = { ...events };
    newEvents[date].splice(index, 1);
    setEvents(newEvents);
    localStorage.setItem("events", JSON.stringify(newEvents));
    setSelectedEvent(null);
    setShowAddEvent(false);
    setEventName("");
    setEventTime("");
    setEventInvitees("");
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setShowAddEvent(true);
    setAddEventTitle(
      `Add Event ${date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })}`
    );
  };

  const handleEditClick = (date, index) => {
    setSelectedDate(date);
    setSelectedEvent({ date, index, color: events[date][index].color });
    setShowAddEvent(true);
    setEventName(events[date][index].name);
    setEventTime(events[date][index].time);
    setEventInvitees(events[date][index].invitees);
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth() + 1,
      1
    );
    setSelectedDate(nextMonth);
  };

  const handlePreviousMonth = () => {
    const previousMonth = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth() - 1,
      1
    );
    setSelectedDate(previousMonth);
  };

  const renderCalendar = () => {
    const daysInMonth = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth() + 1,
      0
    ).getDate();
    const firstDayOfMonth = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      1
    ).getDay();
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const calendarGrid = [];

    const dayNamesRow = daysOfWeek.map((day) => (
      <div key={day} className="calendar-cell day-name-cell">
        {day}
      </div>
    ));
    calendarGrid.push(dayNamesRow);

    const daysInPrevMonth = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      0
    ).getDate();
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const date = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth() - 1,
        daysInPrevMonth - i
      );
      calendarGrid.push(
        <div key={`prev-${i}`} className="calendar-cell prev-month">
          {date.getDate()}
        </div>
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        day
      );

      const eventList = events[date] || [];
      const isToday = isSameDate(date, new Date());
      const isSelected = isSameDate(date, selectedDate);
      const isNextMonth = date.getMonth() !== selectedDate.getMonth();

      let classNames = `calendar-cell ${isToday ? "today" : ""} ${
        isSelected ? "selected" : ""
      } ${isNextMonth ? "next-month" : ""}`;

      if (eventList.length > 0) {
        classNames += ` event-day`;
        if (eventList.length === 1) {
          classNames += ` single-event`;
        } else if (eventList.length === 2) {
          classNames += ` double-event`;
        } else if (eventList.length === 3) {
          classNames += ` triple-event`;
        }
      }

      calendarGrid.push(
        <div
          key={day}
          className={classNames}
          onClick={() => handleDateClick(date)}
          style={{
            background: getBackgroundColor(eventList.length),
            color: isToday && "#000",
          }}
        >
          <div className="date">{day}</div>
          {eventList.length > 0 && (
            <>
              {eventList.map((event, index) => (
                <div
                  className="event-indicator"
                  key={index}
                  style={{ color: event.color }}
                >
                  {event.name}
                  {event.time && <span>{event.time}</span>}
                  {event.invitees && <span>{event.invitees}</span>}
                  <div className="event-btn">
                    <button onClick={() => handleEditClick(date, index)}>
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      );
    }

    return <div className="calendar-grid">{calendarGrid}</div>;
  };

  const renderAddEventForm = () => {
    if (!showAddEvent) return null;
    return (
      <>
        <h3>{addEventTitle}</h3>
        <div className="add-event-form">
          <input
            type="text"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            placeholder="Event Name"
          />
          <input
            type="time"
            value={eventTime}
            onChange={(e) => setEventTime(e.target.value)}
            placeholder="Event Time"
          />
          <input
            type="text"
            value={eventInvitees}
            onChange={(e) => setEventInvitees(e.target.value)}
            placeholder="Invitees"
          />
          <button
            className="add-event-btn"
            onClick={
              selectedEvent
                ? handleEditEvent
                : () => handleAddEvent(selectedDate)
            }
          >
            {selectedEvent ? "Edit Event" : "Add Event"}
          </button>
          {selectedEvent && (
            <button onClick={handleDeleteEvent}>Delete Event</button>
          )}
        </div>
      </>
    );
  };

  const isSameDate = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const getRandomColor = () => {
    return "#" + Math.floor(Math.random() * 16777215).toString(16);
  };

  const getBackgroundColor = (eventCount) => {
    switch (eventCount) {
      case 1:
        return "lightblue";
      case 2:
        return "lightgreen";
      case 3:
        return "lightcoral";
      default:
        return "white";
    }
  };

  return (
    <div>
      <h2>Calendar</h2>
      <div className="calendar-navigation">
        <button className="previous-btn" onClick={handlePreviousMonth}>
          {"<"}
        </button>
        <span>
          {selectedDate.toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </span>
        <button className="next-btn" onClick={handleNextMonth}>
          {">"}
        </button>
      </div>
      {renderCalendar()}
      {renderAddEventForm()}
    </div>
  );
};

export default Calendar;

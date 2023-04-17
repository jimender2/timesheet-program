
import { useEffect, useState } from 'react';
import { NavLink as RouterNavLink } from 'react-router-dom';
import { Table, Form } from 'react-bootstrap';
import { findIana } from 'windows-iana';
import { Event } from 'microsoft-graph';
import { AuthenticatedTemplate } from '@azure/msal-react';
import { add, format, getDay, parseISO } from 'date-fns';
import { endOfWeek, startOfWeek } from 'date-fns/esm';

import { getUserWeekCalendar } from './GraphService';
import { useAppContext } from './AppContext';
import CalendarDayRow from './CalendarDayRow';
import './Calendar.css';

export default function Calendar() {
    const app = useAppContext();

    const [events, setEvents] = useState<Event[]>();
    const [start, setStart] = useState('');
    let weekStart = startOfWeek(new Date());
    let weekEnd = endOfWeek(weekStart);

    useEffect(() => {
        console.log('test');
        console.log(start);
        // console.log(weekStart);
        weekStart = startOfWeek((start == null) ? new Date() : new Date(start));
        weekEnd = endOfWeek(weekStart);
        console.log("jim");
        console.log(weekStart);
        const loadEvents = async () => {
            if (app.user) {
                try {
                    const ianaTimeZones = findIana(app.user?.timeZone!);
                    const events = await getUserWeekCalendar(app.authProvider!, ianaTimeZones[0].valueOf(), startOfWeek((start == null) ? new Date() : new Date(start)));
                    console.log(events);
                    setEvents(events);
                } catch (err) {
                    const error = err as Error;
                    app.displayError!(error.message);
                }
            }
        };

        loadEvents();
    }, [start]);

    useEffect(() => {
        console.log("Load events");
        console.log(events);
    }, [events]);

    // <ReturnSnippet>
    // var weekStart = startOfWeek((start == null) ? new Date(start) : new Date());
    // var weekEnd = endOfWeek(weekStart);

    return (
        <AuthenticatedTemplate>
            <div className="mb-3">
                <h1 className="mb-3">{start}</h1>
                <RouterNavLink to="/newevent" className="btn btn-light btn-sm">New event</RouterNavLink>
            </div>
            <Form.Group>
                <Form.Label>Start</Form.Label>
                <Form.Control type="date"
                    name="start"
                    id="start"
                    value={start}
                    onChange={(ev) => setStart(ev.target.value)} />
            </Form.Group>
            <div className="calendar-week">
                <div className="table-responsive">
                    {events && <Table size="sm">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Event</th>
                            </tr>
                        </thead>
                        <tbody>
                            <CalendarDayRow
                                date={startOfWeek((start == null) ? new Date() : new Date(start))}
                                timeFormat={app.user?.timeFormat!}
                                events={events!.filter(event => getDay(parseISO(event.start?.dateTime!)) === 0)} />
                            <CalendarDayRow
                                date={add(startOfWeek((start == null) ? new Date() : new Date(start)), { days: 1 })}
                                timeFormat={app.user?.timeFormat!}
                                events={events!.filter(event => getDay(parseISO(event.start?.dateTime!)) === 1)} />
                            <CalendarDayRow
                                date={add(startOfWeek((start == null) ? new Date() : new Date(start)), { days: 2 })}
                                timeFormat={app.user?.timeFormat!}
                                events={events!.filter(event => getDay(parseISO(event.start?.dateTime!)) === 2)} />
                            <CalendarDayRow
                                date={add(startOfWeek((start == null) ? new Date() : new Date(start)), { days: 3 })}
                                timeFormat={app.user?.timeFormat!}
                                events={events!.filter(event => getDay(parseISO(event.start?.dateTime!)) === 3)} />
                            <CalendarDayRow
                                date={add(startOfWeek((start == null) ? new Date() : new Date(start)), { days: 4 })}
                                timeFormat={app.user?.timeFormat!}
                                events={events!.filter(event => getDay(parseISO(event.start?.dateTime!)) === 4)} />
                            <CalendarDayRow
                                date={add(startOfWeek((start == null) ? new Date() : new Date(start)), { days: 5 })}
                                timeFormat={app.user?.timeFormat!}
                                events={events!.filter(event => getDay(parseISO(event.start?.dateTime!)) === 5)} />
                            <CalendarDayRow
                                date={add(startOfWeek((start == null) ? new Date() : new Date(start)), { days: 6 })}
                                timeFormat={app.user?.timeFormat!}
                                events={events!.filter(event => getDay(parseISO(event.start?.dateTime!)) === 6)} />
                        </tbody>
                    </Table>}
                </div>
            </div>
        </AuthenticatedTemplate>
    );
    // </ReturnSnippet>
}
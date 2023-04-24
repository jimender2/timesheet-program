
import { useEffect, useState } from 'react';
import { NavLink as RouterNavLink } from 'react-router-dom';
import { Table, Form } from 'react-bootstrap';
import { findIana } from 'windows-iana';
import { Event, List } from 'microsoft-graph';
import { AuthenticatedTemplate } from '@azure/msal-react';
import { add, format, getDay, parseISO } from 'date-fns';
import { endOfWeek, startOfWeek } from 'date-fns/esm';

import { getUserWeekCalendar } from './GraphService';
import { useAppContext } from './AppContext';
import CalendarDayRow from './CalendarDayRow';
import './Calendar.css';

export default function Calendar() {

    // constructor function
    class PDay {
        //field 
        day: number;
        overtimeevents: Array<Object>;
        regulartimeevents: Array<Object>;
        overtime: number;
        regulartime: number;

        //constructor 
        constructor(day: number) {
            this.day = day;
            this.overtimeevents = [];
            this.regulartimeevents = [];
            this.overtime = 0.0;
            this.regulartime = 0.0;
        }

        //function 
        disp(): void {
            console.log("Function displays day is  :   " + this.day)
        }
    }


    const app = useAppContext();

    const [events, setEvents] = useState<Event[]>();
    const [start, setStart] = useState('');
    const [processed, setProcessed] = useState<PDay[]>();
    let weekStart = startOfWeek(new Date());
    let weekEnd = endOfWeek(weekStart);

    function listEvents() {
        console.log("listEvents");
        console.log(events);

        let processedEvents = new Array<PDay>();

        processedEvents.push(new PDay(0));
        processedEvents.push(new PDay(1));
        processedEvents.push(new PDay(2));
        processedEvents.push(new PDay(3));
        processedEvents.push(new PDay(4));
        processedEvents.push(new PDay(5));
        processedEvents.push(new PDay(6));


        // loop through events
        if (events != null) {
            for (let event of events) {
                console.log(event);
                let startDateTime = event.start?.dateTime;
                let endDateTime = event.end?.dateTime;
                let eventName = event?.subject;
                if (startDateTime != null && startDateTime != undefined && endDateTime != null && endDateTime != undefined && eventName != null && eventName != undefined) {
                    // only get the event name (proj number and then action).  Must be in format "1234 - 123"
                    var str = eventName,
                        delimiter = ' ',
                        start = 3,
                        tokens = str.split(delimiter).slice(start),
                        result = tokens.join(delimiter);

                    // To get the substring BEFORE the nth occurence
                    var tokens2 = str.split(delimiter).slice(0, start),
                        nameOfEntry = tokens2.join(delimiter);

                    let date = new Date(startDateTime);
                    let day = new Date(date).getDay();
                    // get the length of the event
                    let duration = new Date(endDateTime).getTime() - new Date(startDateTime).getTime();
                    // convert from milliseconds to hours
                    let lengthOfEvent = duration / 1000 / 60 / 60;
                    console.log(duration);
                    let currenttime = processedEvents[day].regulartime
                    if (currenttime + lengthOfEvent <= 8.0) {
                        processedEvents[day].regulartime = currenttime + lengthOfEvent
                        processedEvents[day].regulartimeevents.push({ "name": nameOfEntry, "duration": lengthOfEvent });
                    }
                }
            }
        }

        console.log(processedEvents);
        setProcessed(processedEvents);


    }

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
            <button onClick={listEvents}>
                test
            </button>
        </AuthenticatedTemplate>
    );
    // </ReturnSnippet>
}
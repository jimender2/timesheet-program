
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

    enum days {
        sunday = 0,
        monday = 1,
        tuesday = 2,
        wednesday = 3,
        thursday = 4,
        friday = 5,
        saturday = 6
    }

    enum odays {
        osunday = 0,
        omonday = 1,
        otuesday = 2,
        owednesday = 3,
        othursday = 4,
        ofriday = 5,
        osaturday = 6
    }

    // constructor function
    class PDay {
        //field 
        day: number;
        overtimeevents: Array<CalEvent>;
        regulartimeevents: Array<CalEvent>;
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

    class CalEvent {
        name: string;
        duration: number;

        constructor(name: string, duration: number) {
            this.name = name;
            this.duration = duration;
        }
    }

    class Cal {
        project: string;
        sunday: number;
        monday: number;
        tuesday: number;
        wednesday: number;
        thursday: number;
        friday: number;
        saturday: number;
        osunday: number;
        omonday: number;
        otuesday: number;
        owednesday: number;
        othursday: number;
        ofriday: number;
        osaturday: number;

        constructor(project: string) {
            this.project = project;
            this.sunday = 0;
            this.monday = 0;
            this.tuesday = 0;
            this.wednesday = 0;
            this.thursday = 0;
            this.friday = 0;
            this.saturday = 0;
            this.osunday = 0;
            this.omonday = 0;
            this.otuesday = 0;
            this.owednesday = 0;
            this.othursday = 0;
            this.ofriday = 0;
            this.osaturday = 0;

        }
    }


    const app = useAppContext();

    const [events, setEvents] = useState<Event[]>();
    const [start, setStart] = useState('');
    const [processed, setProcessed] = useState<PDay[]>();
    const [processedCalendar, setProcessedCalendar] = useState<Cal[]>();
    let weekStart = startOfWeek(new Date());
    // let weekEnd = endOfWeek(weekStart);

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
                    let str = eventName,
                        delimiter = ' ',
                        start = 3,
                        tokens = str.split(delimiter).slice(start),
                        result = tokens.join(delimiter);

                    // To get the substring BEFORE the nth occurence
                    let tokens2 = str.split(delimiter).slice(0, start),
                        nameOfEntry = tokens2.join(delimiter);

                    let date = new Date(startDateTime);
                    let day = new Date(date).getDay();
                    // get the length of the event
                    let duration = new Date(endDateTime).getTime() - new Date(startDateTime).getTime();
                    // convert from milliseconds to hours
                    let lengthOfEvent = duration / 1000 / 60 / 60;
                    console.log(duration);
                    let currenttime = processedEvents[day].regulartime
                    let currentOvertime = processedEvents[day].overtime;
                    if (currenttime + lengthOfEvent <= 8.0) {
                        console.log("go into first");
                        processedEvents[day].regulartime = currenttime + lengthOfEvent
                        processedEvents[day].regulartimeevents.push(new CalEvent(nameOfEntry, lengthOfEvent));
                    } else if (currenttime + lengthOfEvent > 8.0) {
                        console.log("go into second");

                        let addToOvertime = (currenttime + lengthOfEvent) % 8.0;
                        let addToRegulartime = lengthOfEvent - addToOvertime;

                        console.log(addToRegulartime);
                        console.log(addToOvertime);

                        console.log(currenttime);
                        console.log(currentOvertime)
                        processedEvents[day].regulartime = currenttime + addToRegulartime;
                        processedEvents[day].regulartimeevents.push(new CalEvent(nameOfEntry, addToRegulartime));

                        processedEvents[day].overtime = currentOvertime + addToOvertime;
                        processedEvents[day].overtimeevents.push(new CalEvent(nameOfEntry, addToOvertime));
                    } else {
                        console.log("go into third");
                        let addToOvertime = lengthOfEvent;
                        processedEvents[day].overtime = currentOvertime + addToOvertime;
                        processedEvents[day].overtimeevents.push(new CalEvent(nameOfEntry, addToOvertime));
                    }
                }
            }

            let calculateCal: { [project: string]: Cal; } = {};
            // loop through all processedevents
            for (let day of processedEvents) {
                // console.log("f");
                // console.log(day);
                // loop through all normal events
                let dayValue = day.day;
                for (let event of day.regulartimeevents) {
                    if (!(event.name in calculateCal)) {
                        if (dayValue == 0) {
                            calculateCal[event.name] = new Cal(event.name);
                        } else if (dayValue == 1) {
                            calculateCal[event.name] = new Cal(event.name);
                        } else if (dayValue == 2) {
                            calculateCal[event.name] = new Cal(event.name);
                        } else if (dayValue == 3) {
                            calculateCal[event.name] = new Cal(event.name);
                        } else if (dayValue == 4) {
                            calculateCal[event.name] = new Cal(event.name);
                        } else if (dayValue == 5) {
                            calculateCal[event.name] = new Cal(event.name);
                        } else if (dayValue == 6) {
                            calculateCal[event.name] = new Cal(event.name);
                        }
                    }
                    if (dayValue == 0) {
                        calculateCal[event.name].sunday = calculateCal[event.name].sunday + event.duration;
                    } else if (dayValue == 1) {
                        calculateCal[event.name].monday = calculateCal[event.name].monday + event.duration;
                    } else if (dayValue == 2) {
                        calculateCal[event.name].tuesday = calculateCal[event.name].tuesday + event.duration;
                    } else if (dayValue == 3) {
                        calculateCal[event.name].wednesday = calculateCal[event.name].wednesday + event.duration;
                    } else if (dayValue == 4) {
                        calculateCal[event.name].thursday = calculateCal[event.name].thursday + event.duration;
                    } else if (dayValue == 5) {
                        calculateCal[event.name].friday = calculateCal[event.name].friday + event.duration;
                    } else if (dayValue == 6) {
                        calculateCal[event.name].saturday = calculateCal[event.name].saturday + event.duration;
                    }


                }

                for (let event of day.overtimeevents) {
                    if (!(event.name in calculateCal)) {
                        if (dayValue == 0) {
                            calculateCal[event.name] = new Cal(event.name);
                        } else if (dayValue == 1) {
                            calculateCal[event.name] = new Cal(event.name);
                        } else if (dayValue == 2) {
                            calculateCal[event.name] = new Cal(event.name);
                        } else if (dayValue == 3) {
                            calculateCal[event.name] = new Cal(event.name);
                        } else if (dayValue == 4) {
                            calculateCal[event.name] = new Cal(event.name);
                        } else if (dayValue == 5) {
                            calculateCal[event.name] = new Cal(event.name);
                        } else if (dayValue == 6) {
                            calculateCal[event.name] = new Cal(event.name);
                        }
                    }
                    if (dayValue == 0) {
                        calculateCal[event.name].osunday = calculateCal[event.name].osunday + event.duration;
                    } else if (dayValue == 1) {
                        calculateCal[event.name].omonday = calculateCal[event.name].omonday + event.duration;
                    } else if (dayValue == 2) {
                        calculateCal[event.name].otuesday = calculateCal[event.name].otuesday + event.duration;
                    } else if (dayValue == 3) {
                        calculateCal[event.name].owednesday = calculateCal[event.name].owednesday + event.duration;
                    } else if (dayValue == 4) {
                        calculateCal[event.name].othursday = calculateCal[event.name].othursday + event.duration;
                    } else if (dayValue == 5) {
                        calculateCal[event.name].ofriday = calculateCal[event.name].ofriday + event.duration;
                    } else if (dayValue == 6) {
                        calculateCal[event.name].osaturday = calculateCal[event.name].osaturday + event.duration;
                    }
                }


            }

            setProcessedCalendar(Object.values(calculateCal));
            console.log("fuck");
            console.log(Object.values(calculateCal));
        }

        // console.log(processedEvents);
        setProcessed(processedEvents);


    }

    useEffect(() => {
        console.log('test');
        console.log(start);
        // old code example console.log(weekStart);
        weekStart = startOfWeek((start == null) ? new Date() : new Date(start));
        // old code example weekEnd = endOfWeek(weekStart);
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
                <div className="table-responsive">
                    {processed && <Table size="sm">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Event</th>
                            </tr>
                        </thead>
                        <tbody>
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
import {
    Button,
    Container
} from 'react-bootstrap';
import { AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react';
import { useAppContext } from './AppContext';

export default function Welcome() {
    const app = useAppContext();

    return (
        <div className="p-5 mb-4 bg-light rounded-3">
            <Container fluid>
                <h1>Timesheet program</h1>
                <p className="lead">
                    This app lets you connect to your calendar inside of Outlook and calculate your timesheets.  Use the format "2345 - 123" for the format of items.
                </p>
                <AuthenticatedTemplate>
                    <div>
                        <h4>Welcome {app.user?.displayName ?? ''}!</h4>
                        <p>Use the navigation bar at the top of the page to go to the calendar page.</p>
                    </div>
                </AuthenticatedTemplate>
                <UnauthenticatedTemplate>
                    <Button color="primary" onClick={app.signIn!}>Click here to sign in</Button>
                </UnauthenticatedTemplate>
            </Container>
        </div>
    );
}

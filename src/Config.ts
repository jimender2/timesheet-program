const config = {
    appId: process.env.REACT_APP_APPID || "",
    redirectUri: process.env.REACT_APP_REDIRECT || "",
    scopes: [
        'user.read',
        'mailboxsettings.read',
        'calendars.readwrite'
    ]
};

export default config;
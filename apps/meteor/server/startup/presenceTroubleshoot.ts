import { Meteor } from 'meteor/meteor';

import { settings } from '../../app/settings/server';
import { Presence } from '../sdk';

// maybe this setting should disable the listener to 'presence.status' event on listerners.module.ts
Meteor.startup(function () {
	settings.watch('Troubleshoot_Disable_Presence_Broadcast', (value) => {
		try {
			Presence.toggleBroadcast(!value);
		} catch (e) {
			// do nothing
		}
	});
});

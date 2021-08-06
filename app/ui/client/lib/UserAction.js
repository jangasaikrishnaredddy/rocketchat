import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Session } from 'meteor/session';
import _ from 'underscore';

import { settings } from '../../../settings';
import { Notifications } from '../../../notifications';

const timeout = 15000;
const renew = timeout / 3;
const rooms = {};

export const USER_RECORDING = 'user-recording';
export const USER_TYPING = 'user-typing';
export const USER_UPLOADING = 'user-uploading';
export const USER_ACTIVITY = 'user-activity';
const TYPING = 'typing';


const activityTimeouts = new Map();
const activityRenews = new Map();
const continuingIntervals = new Map();
// stores in the form of
// {
// 	rid1: {'user-typing': { user-name1: timeout1, user-name2: timeout2}, 'user-recording': {user-name3: timeout3}},
// 	tmid1: {'user-uploading': { user-name4: timeout4}},
// }

const performingUsers = new ReactiveDict();

const shownName = function(user) {
	if (!user) {
		return;
	}
	if (settings.get('UI_Use_Real_Name')) {
		return user.name;
	}
	return user.username;
};

const fireOldTypingEvent = function() {
	return settings.get('Fire_Old_Typing_Event');
};

// use 'typing' stream if the client wants to use older 'user action indicator' version.
// otherwise use 'user-activity' stream.
const stopActivity = (rid, activityType, extras) => {
	const stream = activityType === USER_TYPING && fireOldTypingEvent() ? TYPING : USER_ACTIVITY;
	return Notifications.notifyRoom(rid, stream, shownName(Meteor.user()), false, activityType, extras);
};
const startActivity = (rid, activityType, extras) => {
	const stream = activityType === USER_TYPING && fireOldTypingEvent() ? TYPING : USER_ACTIVITY;
	return Notifications.notifyRoom(rid, stream, shownName(Meteor.user()), true, activityType, extras);
};

function handleStreamAction(rid, username, actionType, isActive, extras = {}) {
	// actionType and extras will be null if Fire_Old_Typing_Event is true.
	const activityType = actionType || USER_TYPING;
	const id = extras?.tmid || rid;
	const activities = performingUsers.all() || {};
	const roomActivities = activities[id] || {};

	if (_.isEmpty(roomActivities)) {
		activities[id] = roomActivities;
	}

	const users = roomActivities[activityType] || {};
	if (_.isEmpty(users)) {
		roomActivities[activityType] = users;
	}

	if (isActive === true) {
		clearTimeout(users[username]);
		users[username] = setTimeout(function() {
			const activities = performingUsers.all();
			const roomActivities = activities[id];
			const u = roomActivities[activityType];
			delete u[username];
			performingUsers.set(activities);
		}, timeout);
	} else {
		clearTimeout(users[username]);
		delete users[username];
	}

	performingUsers.set(activities);
}

export const UserAction = new class {
	constructor() {
		Tracker.autorun(() => Session.get('openedRoom') && this.addStream(Session.get('openedRoom')));
	}


	addStream(rid) {
		if (rooms[rid]) {
			return;
		}
		rooms[rid] = function(username, activity, activityType, extras) {
			const user = Meteor.users.findOne(Meteor.userId(), { fields: { name: 1, username: 1 } });
			if (username === shownName(user)) {
				return;
			}
			handleStreamAction(rid, username, activityType, activity, extras);
		};
		// We have subscribed to new as well as older user-activity versions for compatiblity purpose.
		// We can remove it once all clients support new user-activity.
		Notifications.onRoom(rid, TYPING, rooms[rid]);
		return Notifications.onRoom(rid, USER_ACTIVITY, rooms[rid]);
	}

	performContinuosly(rid, activityType, extras = {}) {
		const id = extras?.tmid || rid;
		const key = `${ activityType }-${ id }`;

		if (continuingIntervals.get(key)) {
			return;
		}
		this.start(rid, activityType, extras);

		continuingIntervals.set(key, setInterval(() => {
			this.start(rid, activityType, extras);
		}, renew));
	}

	start(rid, activityType, extras = {}) {
		const id = extras?.tmid || rid;
		const key = `${ activityType }-${ id }`;

		if (activityRenews.get(key)) {
			return;
		}

		activityRenews.set(key, setTimeout(() => {
			clearTimeout(activityRenews.get(key));
			activityRenews.delete(key);
		}, renew));

		startActivity(rid, activityType, extras);

		if (activityTimeouts.get(key)) {
			clearTimeout(activityTimeouts.get(key));
			activityTimeouts.delete(key);
		}

		activityTimeouts.set(key, setTimeout(() => this.stop(rid, activityType, extras), timeout));
		return activityTimeouts.get(key);
	}

	stop(rid, activityType, extras) {
		const id = extras?.tmid || rid;
		const key = `${ activityType }-${ id }`;

		if (activityTimeouts.get(key)) {
			clearTimeout(activityTimeouts.get(key));
			activityTimeouts.delete(key);
		}
		if (activityRenews.get(key)) {
			clearTimeout(activityRenews.get(key));
			activityRenews.delete(key);
		}
		if (continuingIntervals.get(key)) {
			clearInterval(continuingIntervals.get(key));
			continuingIntervals.delete(key);
		}
		return stopActivity(rid, activityType, extras);
	}

	cancel(rid) {
		if (!rooms[rid]) {
			return;
		}

		Notifications.unRoom(rid, TYPING, rooms[rid]);
		Notifications.unRoom(rid, USER_ACTIVITY, rooms[rid]);
		delete rooms[rid];

		Object.values(performingUsers.all() || {}).forEach((roomActivities) => {
			Object.values(roomActivities || {}).forEach((activity) => {
				Object.values(activity || {}).forEach((value) => {
					clearTimeout(value);
				});
			});
		});

		performingUsers.clear();
	}

	get(roomId) {
		return performingUsers.get(roomId);
	}
}();

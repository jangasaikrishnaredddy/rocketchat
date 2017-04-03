

Template.channels.helpers({
	isActive() {
		if (ChatSubscription.findOne({ t: { $in: ['c']}, f: { $ne: true }, open: true, rid: Session.get('openedRoom') }, { fields: { _id: 1 } }) !== null) {
			return 'active';
		}
	},

	rooms() {
		const query = {
			t: { $in: ['c']},
			open: true
		};

		if (RocketChat.settings.get('Favorite_Rooms')) {
			query.f = { $ne: true };
		}

		if (Meteor.user() && Meteor.user().settings && Meteor.user().settings.preferences && Meteor.user().settings.preferences.unreadRoomsMode) {
			query.alert =
				{$ne: true};
		}

		let subscriptions = ChatSubscription.find(query, { sort: { 't': 1, 'name': 1 }}).fetch();
		if (Session.equals('RoomSortType', 'activity')) {
			subscriptions = RocketChat.SubscriptionUtil.sortSubscriptionsByActivity(subscriptions);
		}
		return subscriptions;
	}
});

Template.channels.events({
	'click .more-channels'() {
		SideNav.setFlex('listChannelsFlex');
		return SideNav.openFlex();
	}
});

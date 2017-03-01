Meteor.methods({
	getUsersOfRoom(roomId, showAll) {
		if (!Meteor.userId()) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'getUsersOfRoom' });
		}

		const room = Meteor.call('canAccessRoom', roomId, Meteor.userId());
		if (!room) {
			throw new Meteor.Error('error-invalid-room', 'Invalid room', { method: 'getUsersOfRoom' });
		}

		const filter = (record) => {
			if (!record._user) {
				console.log('Subscription without user', record._id);
				return false;
			}

			if (showAll === true) {
				return true;
			}

			return record._user.status !== 'offline';
		};

		const map = (record) => {
			return record._user.username;
		};

		var names = {};

		const records = RocketChat.models.Subscriptions.findByRoomId(roomId).fetch();

		records.filter(filter).forEach(function(record) {
			names[record._user.username] = record._user.name;
		});

		return {
			total: records.length,
			records: records.filter(filter).map(map),
			names: names
		};
	}
});

import { Meteor } from 'meteor/meteor';
import s from 'underscore.string';

import { Subscriptions } from '../../app/models';
import { hasPermission } from '../../app/authorization';
import { settings } from '../../app/settings';

function findUsers({ rid, status, skip, limit, filter = '' }) {
	const regex = new RegExp(s.trim(s.escapeRegExp(filter)), 'i');
	return Subscriptions.model.rawCollection().aggregate([
		{
			$match: { rid },
		},
		{
			$lookup:
				{
					from: 'users',
					localField: 'u._id',
					foreignField: '_id',
					as: 'u',
				},
		},
		{
			$project: {
				'u._id': 1,
				'u.name': 1,
				'u.username': 1,
				'u.status': 1,
				'u.avatarETag': 1,
			},
		},
		...status ? [{ $match: { 'u.status': status } }] : [],
		...filter.trim() ? [{ $match: { $or: [{ 'u.name': regex }, { 'u.username': regex }] } }] : [],
		{
			$sort: {
				[settings.get('UI_Use_Real_Name') ? 'u.name' : 'u.username']: 1,
			},
		},
		...skip > 0 ? [{ $skip: skip }] : [],
		...limit > 0 ? [{ $limit: limit }] : [],
		{
			$project: {
				_id: { $arrayElemAt: ['$u._id', 0] },
				name: { $arrayElemAt: ['$u.name', 0] },
				username: { $arrayElemAt: ['$u.username', 0] },
				avatarETag: { $arrayElemAt: ['$u.avatarETag', 0] },
			},
		},
	]).toArray();
}

Meteor.methods({
	async getUsersOfRoom(rid, showAll, { limit, skip } = {}, filter) {
		const userId = Meteor.userId();
		if (!userId) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'getUsersOfRoom' });
		}

		const room = Meteor.call('canAccessRoom', rid, userId);
		if (!room) {
			throw new Meteor.Error('error-invalid-room', 'Invalid room', { method: 'getUsersOfRoom' });
		}

		if (room.broadcast && !hasPermission(userId, 'view-broadcast-member-list', rid)) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', { method: 'getUsersOfRoom' });
		}

		const total = Subscriptions.findByRoomIdWhenUsernameExists(rid).count();
		const users = await findUsers({ rid, status: { $ne: 'offline' }, limit, skip, filter });
		if (showAll && (!limit || users.length < limit)) {
			const offlineUsers = await findUsers({
				rid,
				status: { $eq: 'offline' },
				limit: limit ? limit - users.length : 0,
				skip: skip || 0,
				filter,
			});

			return {
				total,
				records: users.concat(offlineUsers),
			};
		}

		return {
			total,
			records: users,
		};
	},
});

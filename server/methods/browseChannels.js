import { Meteor } from 'meteor/meteor';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import s from 'underscore.string';

import { hasPermission } from '../../app/authorization';
import { Rooms, Users, Subscriptions } from '../../app/models';
import { settings } from '../../app/settings/server';
import { getFederationDomain } from '../../app/federation/server/lib/getFederationDomain';
import { isFederationEnabled } from '../../app/federation/server/lib/isFederationEnabled';
import { federationSearchUsers } from '../../app/federation/server/handler';
import { escapeRegExp } from '../../lib/escapeRegExp';
import { Team } from '../sdk';

const sortChannels = function(field, direction) {
	switch (field) {
		case 'createdAt':
			return {
				ts: direction === 'asc' ? 1 : -1,
			};
		case 'lastMessage':
			return {
				'lastMessage.ts': direction === 'asc' ? 1 : -1,
			};
		default:
			return {
				[field]: direction === 'asc' ? 1 : -1,
			};
	}
};

const sortUsers = function(field, direction) {
	switch (field) {
		case 'email':
			return {
				'emails.address': direction === 'asc' ? 1 : -1,
				username: direction === 'asc' ? 1 : -1,
			};
		default:
			return {
				[field]: direction === 'asc' ? 1 : -1,
			};
	}
};
/* eslint-disable */
Meteor.methods({
	browseChannels({ text = '', workspace = '', type = 'channels', sortBy = 'name', sortDirection = 'asc', page, offset, limit = 10 }) {
		const regex = new RegExp(s.trim(escapeRegExp(text)), 'i');

		if (!['channels', 'users', 'teams'].includes(type)) {
			return;
		}

		if (!['asc', 'desc'].includes(sortDirection)) {
			return;
		}

		if ((!page && page !== 0) && (!offset && offset !== 0)) {
			return;
		}

		if (!['name', 'createdAt', 'usersCount', ['channels', 'teams'].includes(...type) ? ['usernames', 'lastMessage'] : [], ...type === 'users' ? ['username', 'email', 'bio'] : []].includes(sortBy)) {
			return;
		}

		const skip = Math.max(0, offset || (page > -1 ? limit * page : 0));

		limit = limit > 0 ? limit : 10;

		const pagination = {
			skip,
			limit,
		};

		const canViewAnonymous = settings.get('Accounts_AllowAnonymousRead') === true;

		const user = Meteor.user();

		if (type === 'channels') {
			const sort = sortChannels(sortBy, sortDirection);
			if ((!user && !canViewAnonymous) || (user && !hasPermission(user._id, 'view-c-room'))) {
				return;
			}

			const result = Rooms.findByNameOrFNameAndType(regex, 'c', {
				...pagination,
				sort: {
					featured: -1,
					...sort,
				},
				fields: {
					t: 1,
					description: 1,
					topic: 1,
					name: 1,
					fname: 1,
					lastMessage: 1,
					ts: 1,
					archived: 1,
					default: 1,
					featured: 1,
					usersCount: 1,
					prid: 1,
				},
			});

			return {
				total: result.count(), // count ignores the `skip` and `limit` options
				results: result.fetch(),
			};
		}

		// non-logged id user
		if (!user) {
			return;
		}

		if (type === 'teams') {
			const sort = sortChannels(sortBy, sortDirection);
			const userSubs = Subscriptions.cachedFindByUserId(user._id).fetch();
			const ids = userSubs.map((sub) => sub.rid);
			const result = Rooms.findByNameOrFNameInIdsWithTeams(regex, ids, {
				...pagination,
				sort: {
					featured: -1,
					...sort,
				},
				fields: {
					t: 1,
					description: 1,
					topic: 1,
					name: 1,
					fname: 1,
					lastMessage: 1,
					ts: 1,
					archived: 1,
					default: 1,
					featured: 1,
					usersCount: 1,
					prid: 1,
					teamId: 1,
					teamMain: 1,
				},
			});

			const rooms = result.fetch();
			const teamIds = [...new Set(rooms.map((r) => r.teamId))];
			const teams = Promise.await(Team.listByIds(teamIds, { projection: { _id: 1, name: 1 } }));

			const roomsWithTeamInfo = rooms.reduce((prev, room) => {
				const teamOfRoom = teams.find((t) => t._id === room.teamId);
				room.teamName = teamOfRoom.name;

				return prev.push(room) && prev;
			}, []);

			return {
				total: result.count(), // count ignores the `skip` and `limit` options
				results: roomsWithTeamInfo,
			};
		}

		// type === users
		if (!hasPermission(user._id, 'view-outside-room') || !hasPermission(user._id, 'view-d-room')) {
			return;
		}

		const forcedSearchFields = workspace === 'all' && ['username', 'name', 'emails.address'];

		const viewFullOtherUserInfo = hasPermission(user._id, 'view-full-other-user-info');

		const options = {
			...pagination,
			sort: sortUsers(sortBy, sortDirection),
			fields: {
				username: 1,
				name: 1,
				nickname: 1,
				bio: 1,
				createdAt: 1,
				...viewFullOtherUserInfo && { emails: 1 },
				federation: 1,
				avatarETag: 1,
			},
		};

		let result;
		if (workspace === 'all') {
			result = Users.findByActiveUsersExcept(text, [], options, forcedSearchFields);
		} else if (workspace === 'external') {
			result = Users.findByActiveExternalUsersExcept(text, [], options, forcedSearchFields, getFederationDomain());
		} else {
			result = Users.findByActiveLocalUsersExcept(text, [], options, forcedSearchFields, getFederationDomain());
		}

		const total = result.count(); // count ignores the `skip` and `limit` options
		const results = result.fetch();

		// Try to find federated users, when applicable
		if (isFederationEnabled() && type === 'users' && workspace === 'external' && text.indexOf('@') !== -1) {
			const users = federationSearchUsers(text);

			for (const user of users) {
				if (results.find((e) => e._id === user._id)) { continue; }

				// Add the federated user to the results
				results.unshift({
					username: user.username,
					name: user.name,
					bio: user.bio,
					nickname: user.nickname,
					emails: user.emails,
					federation: user.federation,
					isRemote: true,
				});
			}
		}

		return {
			total,
			results,
		};
	},
});

DDPRateLimiter.addRule({
	type: 'method',
	name: 'browseChannels',
	userId(/* userId*/) {
		return true;
	},
}, 100, 100000);

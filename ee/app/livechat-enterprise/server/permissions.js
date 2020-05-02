import _ from 'underscore';

import { Permissions, Roles } from '../../../../app/models/server';

export const createPermissions = () => {
	if (!Permissions) {
		return;
	}

	const livechatMonitorRole = 'livechat-monitor';
	const livechatManagerRole = 'livechat-manager';
	const adminRole = 'admin';

	const roles = _.pluck(Roles.find().fetch(), 'name');
	if (roles.indexOf(livechatMonitorRole) === -1) {
		Roles.createOrUpdate(livechatMonitorRole);
	}

	const permissions = [
		'view-l-room',
		'view-livechat-rooms',
		'close-livechat-room',
		'close-others-livechat-room',
		'save-others-livechat-room-info',
		'remove-closed-livechat-rooms',
		'view-livechat-analytics',
		'add-livechat-department-agents',
		'view-livechat-queue',
		'transfer-livechat-guest',
		'view-livechat-manager',
		'view-livechat-departments',
		'view-livechat-current-chats',
		'view-livechat-analytics',
		'view-livechat-real-time-monitoring',
		'view-livechat-officeHours',
		'manage-livechat-agents',
	];


	permissions.map((p) => Permissions.addRole(p, livechatMonitorRole));

	Permissions.createOrUpdate('manage-livechat-units', [adminRole, livechatManagerRole]);
	Permissions.createOrUpdate('manage-livechat-monitors', [adminRole, livechatManagerRole]);
	Permissions.createOrUpdate('manage-livechat-tags', [adminRole, livechatManagerRole]);
	Permissions.createOrUpdate('manage-livechat-priorities', [adminRole, livechatManagerRole]);
};

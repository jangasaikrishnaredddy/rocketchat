import { Meteor } from 'meteor/meteor';
import { TAPi18n } from 'meteor/rocketchat:tap-i18n';

import { callbacks } from '../../../app/callbacks/server';
import { canAddNewUser, handleMaxSeatsBanners, isEnterprise } from '../../app/license/server/license';
import { createSeatsLimitBanners } from '../../app/license/server/maxSeatsBanners';
import { validateUserRoles } from '../../app/authorization/server/validateUserRoles';
import { Users } from '../../../app/models/server';
import type { IUser } from '../../../definition/IUser';

callbacks.add('onCreateUser', ({ isGuest }: { isGuest: boolean }) => {
	if (isGuest) {
		return;
	}

	if (!canAddNewUser()) {
		throw new Meteor.Error('error-license-user-limit-reached', TAPi18n.__('error-license-user-limit-reached'));
	}
}, callbacks.priority.MEDIUM, 'check-max-user-seats');


callbacks.add('beforeActivateUser', (user: IUser) => {
	if (user.roles.length === 1 && user.roles.includes('guest')) {
		return;
	}

	if (user.type === 'app') {
		return;
	}

	if (!canAddNewUser()) {
		throw new Meteor.Error('error-license-user-limit-reached', TAPi18n.__('error-license-user-limit-reached'));
	}
}, callbacks.priority.MEDIUM, 'check-max-user-seats');

callbacks.add('validateUserRoles', (userData: Record<string, any>) => {
	const isGuest = userData.roles?.includes('guest');
	if (isGuest) {
		validateUserRoles(Meteor.userId(), userData);
		return;
	}

	if (!userData._id) {
		return;
	}

	const currentUserData = Users.findOneById(userData._id);
	if (currentUserData.type === 'app') {
		return;
	}

	const wasGuest = currentUserData?.roles?.length === 1 && currentUserData.roles.includes('guest');
	if (!wasGuest) {
		return;
	}

	if (!canAddNewUser()) {
		throw new Meteor.Error('error-license-user-limit-reached', TAPi18n.__('error-license-user-limit-reached'));
	}
}, callbacks.priority.MEDIUM, 'check-max-user-seats');

callbacks.add('afterCreateUser', handleMaxSeatsBanners, callbacks.priority.MEDIUM, 'handle-max-seats-banners');

callbacks.add('afterSaveUser', handleMaxSeatsBanners, callbacks.priority.MEDIUM, 'handle-max-seats-banners');

callbacks.add('afterDeleteUser', handleMaxSeatsBanners, callbacks.priority.MEDIUM, 'handle-max-seats-banners');

callbacks.add('afterDeactivateUser', handleMaxSeatsBanners, callbacks.priority.MEDIUM, 'handle-max-seats-banners');

callbacks.add('afterActivateUser', handleMaxSeatsBanners, callbacks.priority.MEDIUM, 'handle-max-seats-banners');

Meteor.startup(() => {
	if (isEnterprise()) {
		createSeatsLimitBanners();
	}
});

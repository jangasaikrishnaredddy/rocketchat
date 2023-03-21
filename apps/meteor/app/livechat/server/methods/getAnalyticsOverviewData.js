import { Meteor } from 'meteor/meteor';

import { hasPermissionAsync } from '../../../authorization/server/functions/hasPermission';
import { Users } from '../../../models/server';
import { settings } from '../../../settings/server';
import { Livechat } from '../lib/Livechat';

Meteor.methods({
	async 'livechat:getAnalyticsOverviewData'(options) {
		const userId = Meteor.userId();
		if (!userId || !(await hasPermissionAsync(userId, 'view-livechat-manager'))) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', {
				method: 'livechat:getAnalyticsOverviewData',
			});
		}

		if (!(options.analyticsOptions && options.analyticsOptions.name)) {
			Livechat.logger.error('Incorrect analytics options');
			return;
		}

		const user = Users.findOneById(userId, { fields: { _id: 1, utcOffset: 1, language: 1 } });
		const language = user.language || settings.get('Language') || 'en';

		return Livechat.Analytics.getAnalyticsOverviewData({
			...options,
			utcOffset: user?.utcOffset || 0,
			language,
		});
	},
});

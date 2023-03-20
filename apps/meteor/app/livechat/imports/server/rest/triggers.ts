import { isGETLivechatTriggersParams } from '@rocket.chat/rest-typings';

import { API } from '../../../../api/server';
import { findTriggers, findTriggerById } from '../../../server/api/lib/triggers';
import { getPaginationItems } from '../../../../api/server/helpers/getPaginationItems';
import { parseJsonQuery } from '../../../../api/server/helpers/parseJsonQuery';

API.v1.addRoute(
	'livechat/triggers',
	{ authRequired: true, permissionsRequired: ['view-livechat-manager'], validateParams: isGETLivechatTriggersParams },
	{
		async get() {
			const { offset, count } = await getPaginationItems(this.queryParams);
			const { sort } = await parseJsonQuery(
				this.request.route,
				this.userId,
				this.queryParams,
				this.logger,
				this.queryFields,
				this.queryOperations,
			);

			const triggers = await findTriggers({
				pagination: {
					offset,
					count,
					sort,
				},
			});

			return API.v1.success(triggers);
		},
	},
);

API.v1.addRoute(
	'livechat/triggers/:_id',
	{ authRequired: true, permissionsRequired: ['view-livechat-manager'] },
	{
		async get() {
			const trigger = await findTriggerById({
				triggerId: this.urlParams._id,
			});

			return API.v1.success({
				trigger,
			});
		},
	},
);

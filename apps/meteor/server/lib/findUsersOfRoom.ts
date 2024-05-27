import type { IUser } from '@rocket.chat/core-typings';
import type { FindPaginated } from '@rocket.chat/model-typings';
import { Users } from '@rocket.chat/models';
import type { FilterOperators, FindCursor } from 'mongodb';

import { settings } from '../../app/settings/server';

type FindUsersParam = {
	rid: string;
	status?: FilterOperators<string>;
	skip?: number;
	limit?: number;
	filter?: string;
	sort?: Record<string, any>;
};

export function findUsersOfRoom({ rid, status, skip = 0, limit = 0, filter = '', sort }: FindUsersParam): FindPaginated<FindCursor<IUser>> {
	const options = {
		projection: {
			name: 1,
			username: 1,
			nickname: 1,
			status: 1,
			avatarETag: 1,
			_updatedAt: 1,
			federated: 1,
		},
		sort: {
			statusConnection: -1,
			...(sort || { ...(settings.get('UI_Use_Real_Name') && { name: 1 }), username: 1 }),
		},
		...(skip > 0 && { skip }),
		...(limit > 0 && { limit }),
	};

	const searchFields = settings.get<string>('Accounts_SearchFields').trim().split(',');

	return Users.findPaginatedByActiveUsersExcept(filter, undefined, searchFields, options, [
		{
			__rooms: rid,
			...(status && { status }),
		},
	]);
}

import React, { useMemo, useState } from 'react';
import _ from 'underscore';

import { usePermission } from '../../../../../client/contexts/AuthorizationContext';
import { useEndpointData } from '../../../../../ee/app/engagement-dashboard/client/hooks/useEndpointData';
import { NotAuthorizedPage } from '../settings/NotAuthorizedPage';
import { UsersAndRoomsTab } from './UsersAndRoomsTab';
import { useRoute } from '../../../../../client/contexts/RouterContext';

import { RoomsTab, useSwitchTab } from '.';

const useQuery = (params, sort) => useMemo(() => ({
	filter: params.term || '',
	types: JSON.stringify(['c', 'p', 'd', 'l', 'discussion']),
	sort: JSON.stringify({ [sort[0]]: sort[1] === 'asc' ? 1 : -1 }),
	...params.itemsPerPage && { count: params.itemsPerPage },
	...params.current && { offset: params.current },
}), [params, sort]);


export default function RoomsTabRoute({ props }) {
	const canViewRoomAdministration = usePermission('view-room-administration');

	const [params, setParams] = useState({});
	const [sort, setSort] = useState(['name', 'asc']);

	const routeName = 'admin-rooms';

	const query = useQuery(params, sort);

	const data = useEndpointData('GET', 'rooms.adminRooms', query) || {};

	const switchTab = useSwitchTab(routeName);

	const router = useRoute(routeName);
	const onClick = (rid) => () => router.push({
		context: 'edit',
		id: rid,
	});

	const onHeaderClick = (id) => {
		const [sortBy, sortDirection] = sort;

		if (sortBy === id) {
			setSort([id, sortDirection === 'asc' ? 'desc' : 'asc']);
			return;
		}
		setSort([id, 'asc']);
	};

	if (sort[0] === 'name' && data.rooms) {
		data.rooms = data.rooms.sort((a, b) => {
			const aName = a.name || a.usernames.join(' x ');
			const bName = b.name || b.usernames.join(' x ');
			if (aName === bName) { return 0; }
			const result = aName < bName ? -1 : 1;
			return sort[1] === 'asc' ? result : result * -1;
		});
	}

	if (!canViewRoomAdministration) {
		return <NotAuthorizedPage />;
	}

	return <UsersAndRoomsTab route={routeName} switchTab={switchTab} tab='rooms' {...props}>
		<RoomsTab setParams={_.debounce(setParams, 300)} onHeaderClick={onHeaderClick} data={data} onClick={onClick} sort={sort}/>
	</UsersAndRoomsTab>;
}

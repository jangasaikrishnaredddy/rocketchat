import Ajv from 'ajv';

import type { PaginatedRequest } from '../../helpers/PaginatedRequest';

const ajv = new Ajv({
	coerceTypes: true,
});

export type UsersListStatusParamsGET = {
	status: 'active' | 'all' | 'deactivated' | 'pending';
	roles: string[];
	searchTerm: string;
} & PaginatedRequest;

const UsersListStatusParamsGetSchema = {
	type: 'object',
	properties: {
		status: {
			type: 'string',
			enum: ['active', 'all', 'deactivated', 'pending'],
		},
		roles: {
			type: 'array',
			items: {
				type: 'string',
			},
			nullable: true,
		},
		searchTerm: {
			type: 'string',
			nullable: true,
		},
		sort: {
			type: 'string',
			nullable: true,
		},
		count: {
			type: 'number',
			nullable: true,
		},
		offset: {
			type: 'number',
			nullable: true,
		},
	},
	additionalProperties: false,
};

export const isUsersListStatusProps = ajv.compile<UsersListStatusParamsGET>(UsersListStatusParamsGetSchema);

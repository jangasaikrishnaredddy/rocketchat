import Ajv from 'ajv';
import type { IRoom } from '@rocket.chat/core-typings';

const ajv = new Ajv();

export type ChannelsConvertToTeamProps =
	| { channelId: IRoom['_id']; channelName?: IRoom['name'] }
	| { channelName: IRoom['name']; channelId?: IRoom['_id'] };

const channelsConvertToTeamPropsSchema = {
	oneOf: [
		{
			type: 'object',
			properties: {
				channelId: { type: 'string' },
			},
			required: ['channelId'],
			additionalProperties: false,
		},
		{
			type: 'object',
			properties: {
				channelName: { type: 'string' },
			},
			required: ['channelName'],
			additionalProperties: false,
		},
	],
};

export const isChannelsConvertToTeamProps = ajv.compile<ChannelsConvertToTeamProps>(channelsConvertToTeamPropsSchema);

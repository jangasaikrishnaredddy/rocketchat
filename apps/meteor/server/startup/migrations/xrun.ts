import { Settings } from '@rocket.chat/models';

import { upsertPermissions } from '../../../app/authorization/server/functions/upsertPermissions';
import { migrateDatabase, onServerVersionChange } from '../../lib/migrations';
import { ensureCloudWorkspaceRegistered } from '../cloudRegistration';

const { MIGRATION_VERSION = 'latest' } = process.env;

const [version, ...subcommands] = MIGRATION_VERSION.split(',');

const maxAgeSettingMap = new Map([
	['RetentionPolicy_MaxAge_Channels', 'RetentionPolicy_TTL_Channels'],
	['RetentionPolicy_MaxAge_Groups', 'RetentionPolicy_TTL_Groups'],
	['RetentionPolicy_MaxAge_DMs', 'RetentionPolicy_TTL_DMs'],
]);

const moveRetentionSetting = async () => {
	const convertDaysToMs = (days: number) => days * 24 * 60 * 60 * 1000;

	const promises: Array<Promise<any>> = [];
	await Settings.find({ _id: { $in: Array.from(maxAgeSettingMap.keys()) } }, { projection: { _id: 1, value: 1 } }).forEach(
		({ _id, value }) => {
			if (!maxAgeSettingMap.has(_id)) {
				throw new Error(`moveRetentionSetting - Setting ${_id} equivalent does not exist`);
			}

			if (Number(value) === -1) return;

			promises.push(
				Settings.update(
					{
						_id: maxAgeSettingMap.get(_id),
					},
					{
						$set: {
							value: convertDaysToMs(Number(value)),
						},
					},
				),
			);
		},
	);

	await Promise.all(promises);
	await Settings.updateMany({ _id: { $in: Array.from(maxAgeSettingMap.keys()) } }, { $set: { value: -1 } });
};

export const performMigrationProcedure = async (): Promise<void> => {
	await migrateDatabase(version === 'latest' ? version : parseInt(version), subcommands);
	// perform operations when the server is starting with a different version
	await onServerVersionChange(async () => {
		await upsertPermissions();
		await ensureCloudWorkspaceRegistered();
		await moveRetentionSetting();
	});
};

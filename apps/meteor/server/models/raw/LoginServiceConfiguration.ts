import type { ILoginServiceConfiguration, LoginServiceConfiguration, RocketChatRecordDeleted } from '@rocket.chat/core-typings';
import type { ILoginServiceConfigurationModel } from '@rocket.chat/model-typings';
import type { Collection, Db, DeleteResult } from 'mongodb';

import { BaseRaw } from './BaseRaw';

export class LoginServiceConfigurationRaw extends BaseRaw<ILoginServiceConfiguration> implements ILoginServiceConfigurationModel {
	constructor(db: Db, trash?: Collection<RocketChatRecordDeleted<ILoginServiceConfiguration>>) {
		super(db, 'meteor_accounts_loginServiceConfiguration', trash, {
			preventSetUpdatedAt: true,
			collectionNameResolver(name) {
				return name;
			},
		});
	}

	async createOrUpdateService(
		serviceName: string,
		serviceData: Partial<LoginServiceConfiguration>,
	): Promise<LoginServiceConfiguration['_id']> {
		console.log('DEBUGOAUTH', new Date().toISOString(), 'createOrUpdateService', serviceName);
		const service = serviceName.toLowerCase();

		const existing = await this.findOne({ service });
		if (!existing) {
			console.log('DEBUGOAUTH', new Date().toISOString(), 'createOrUpdateService', 'INSERT');
			const insertResult = await this.insertOne({
				service,
				...serviceData,
			});

			return insertResult.insertedId;
		}

		if (Object.keys(serviceData).length > 0) {
			console.log('DEBUGOAUTH', new Date().toISOString(), 'createOrUpdateService', 'UPDATE');
			await this.updateOne(
				{
					_id: existing._id,
				},
				{
					$set: serviceData,
				},
			);
		}

		return existing._id;
	}

	async removeService(serviceName: string): Promise<DeleteResult> {
		console.log('DEBUGOAUTH', new Date().toISOString(), 'removeService', serviceName);
		const service = serviceName.toLowerCase();

		return this.deleteOne({ service });
	}
}

import type { IOAuthApps, IUser } from '@rocket.chat/core-typings';

import type { OauthAppsGetParams } from './oauthapps/OauthAppsGetParams';
import type { UpdateOAuthAppParams } from './oauthapps/UpdateOAuthAppParams';
import type { OauthAppsAddParams } from './oauthapps/OauthAppsAddParams';
import type { DeleteOAuthAppParams } from './oauthapps/DeleteOAuthAppParams';

export type OAuthAppsEndpoint = {
	'/v1/oauth-apps.list': {
		GET: (params: { uid: IUser['_id'] }) => {
			oauthApps: IOAuthApps[];
		};
	};

	'/v1/oauth-apps.get': {
		GET: (params: OauthAppsGetParams) => {
			oauthApp: IOAuthApps;
		};
	};

	'/v1/oauth-apps.create': {
		POST: (params: OauthAppsAddParams) => { application: IOAuthApps };
	};

	'/v1/oauth-apps.update': {
		POST: (params: UpdateOAuthAppParams) => IOAuthApps | null;
	};

	'/v1/oauth-apps.delete': {
		POST: (params: DeleteOAuthAppParams) => boolean;
	};
};

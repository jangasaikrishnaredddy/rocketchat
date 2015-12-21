Package.describe({
	name: 'rocketchat:channel-settings-mail-messages',
	version: '0.0.1',
	summary: 'Channel Settings - Mail Messages',
	git: ''
});

Package.onUse(function(api) {
	api.versionsFrom('1.0');

	api.use([
		'coffeescript',
		'templating',
		'reactive-var',
		'less@2.5.0',
		'rocketchat:lib@0.0.1',
		'rocketchat:channel-settings'
	]);

	api.addFiles([
		'client/lib/ChannelSettings.coffee',
		'client/lib/RocketChatChannelSettingsMailMessages.coffee',
		'client/views/channelSettingsMailMessages.html',
		'client/views/channelSettingsMailMessages.coffee',
		'client/views/mailMessagesInstructions.html',
		'client/views/mailMessagesInstructions.coffee'
	], 'client');

	// TAPi18n
	var _ = Npm.require('underscore');
	var fs = Npm.require('fs');
	tapi18nFiles = _.compact(_.map(fs.readdirSync('packages/rocketchat-channel-settings-mail-messages/i18n'), function(filename) {
		if (fs.statSync('packages/rocketchat-channel-settings-mail-messages/i18n/' + filename).size > 16) {
			return 'i18n/' + filename;
		}
	}));
	api.use('tap:i18n@1.6.1');
	api.imply('tap:i18n');
	api.addFiles(tapi18nFiles);
});

Package.onTest(function(api) {

});

Package.describe({
	name: 'rocketchat:importer-slack',
	version: '0.0.1',
	summary: 'Importer for Slack',
	git: ''
});

Package.onUse(function(api) {
	api.use([
		'coffeescript',
		'rocketchat:lib@0.0.1',
		'rocketchat:importer@0.0.1'
	]);
	api.use(['mrt:moment-timezone@0.2.1'], 'server');
	api.use('rocketchat:logger', 'server');
	api.addFiles('server.coffee', 'server');
	api.addFiles('main.coffee', ['client', 'server']);
});

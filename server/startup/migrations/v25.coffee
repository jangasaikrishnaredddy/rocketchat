RocketChat.Migrations.add
	version: 25
	up: ->
		RocketChat.models.Settings.update({ _id: /Accounts_OAuth_Custom/ }, { $set: { persistent: true }, $unset: {hidden: true} }, { multi: true })

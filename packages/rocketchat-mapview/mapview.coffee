###
# MapView is a named function that will replace geolocation in messages with a Google Static Map
# @param {Object} message - The message object
###

class MapView
	constructor: (message) ->
		
		# get enable setting
		mv_enabled = RocketChat.settings.get 'MapView_Enabled'
		
		if _.trim message.html and mv_enabled == true
			
			# regex to match mapview string
			latLngPattern = /// ^  # begin of line
				\(maps:      	   # define hardcoded maps tag
				(-*[0-9]+.[0-9]+)  # match latitude
				,                  # literal comma
				(-*[0-9]+.[0-9]+)  # match longitude
				\)			       # end maps tag
				$ ///i             # EOL
			
			# test html for a match
			match_loc_string = latLngPattern.exec message.html
				
			if match_loc_string
				
				# retrieve google maps api key from settings
				gMapsAPIKey = RocketChat.settings.get 'MapView_GMapsAPIKey'
				
				# confirm we have an api key set, and generate the html required for the mapview
				if gMapsAPIKey != ''
					message.html  = '<a href="https://maps.google.com/maps?daddr='+match_loc_string[1]+','+match_loc_string[2]+'" target="_blank"><img src="https://maps.googleapis.com/maps/api/staticmap?zoom=14&size=250x250&markers=color:gray%7Clabel:%7C'+match_loc_string[1]+','+match_loc_string[2]+'&key='+gMapsAPIKey+'" /></a>'
					
		return message

RocketChat.callbacks.add 'renderMessage', MapView, RocketChat.callbacks.priority.HIGH

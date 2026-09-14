fx_version("cerulean")
game("gta5")
description("js runtime monkaW")
authors({ "itschip", "erik-sn", "TasoOneAsia", "kidz", "RockySouthpaw", "SamShanks", "c-wide", "mojito" })
version("3.16.0")
-- Lua pieces (lua/) talk to qbx directly: ox_lib callbacks and qbx's vehicle helpers.
shared_scripts({
	"@ox_lib/init.lua",
	"@qbx_core/modules/lib.lua",
	"lua/services/config.lua",
	"lua/gigs/config.lua",
	"lua/crimeapp/config.lua",
})

client_scripts({
	"dist/game/client/client.js",
	"dist/game/client/*.lua",
	"lua/garage/client.lua",
	"lua/services/client.lua",
	"lua/gigs/client.lua",
	"lua/home/client.lua",
	"lua/music/client.lua",
	"lua/geocache/client.lua",
	"lua/fitbit/client.lua",
	"lua/crimeapp/client_functions.lua",
	"lua/crimeapp/client.lua",
})

server_script({
	-- This is a file that lives purely in source code and isn't compiled alongside
	-- rest of the release. It's used to detect whether a user can read or not.
	"dist/game/server/server.js",
	"@oxmysql/lib/MySQL.lua",
	"lua/garage/server.lua",
	"lua/services/server.lua",
	"lua/gigs/server.lua",
	"lua/home/server.lua",
	"lua/music/server.lua",
	"lua/fitbit/server.lua",
	"lua/crimeapp/server_framework.lua",
	"lua/crimeapp/server_logs.lua",
	"lua/crimeapp/server_accounts.lua",
	"lua/crimeapp/server_heat.lua",
	"lua/crimeapp/server_main.lua",
	"lua/crimeapp/server_showcase.lua",
})

lua54("yes")

ui_page("dist/html/index.html")

files({
	"config.json",
	"dist/html/index.html",
	"dist/html/**/*",
})

dependency({
	"screenshot-basic",
	"pma-voice",
})

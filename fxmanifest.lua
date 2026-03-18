fx_version 'cerulean'
game 'gta5'

author 'wokn'
description 'Standalone FiveM watermark script. Each player can independently position and resize their own watermark via /watermark.'
version '1.0.0'

ui_page 'ui/index.html'

client_scripts {
    'client/main.lua',
    'client/commands.lua'
}

files {
    'ui/index.html',
    'ui/style.css',
    'ui/app.js',
    'watermark.png'
}

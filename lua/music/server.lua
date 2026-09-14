-- -----------------------------------------------------------------------------
-- Music app, server side: the playlist lives here, and speaker playback is
-- broadcast from here so everyone nearby hears the same thing.
--
-- Earbuds mode never reaches the server -- it is one player's own client
-- playing to itself, and telling the server about it would only add latency
-- to a private sound.
-- -----------------------------------------------------------------------------

local TRACK_LIMIT = 50
local SPEAKER_DISTANCE = 30.0

-- One speaker per player: starting a new track replaces your old one rather
-- than stacking a second stream on top of it.
local speakers = {}

MySQL.ready(function()
    MySQL.query.await([[
        CREATE TABLE IF NOT EXISTS npwd_music_tracks
        (
            id         INT(11)      NOT NULL AUTO_INCREMENT,
            identifier VARCHAR(48)  NOT NULL,
            title      VARCHAR(120) NOT NULL,
            url        VARCHAR(500) NOT NULL,
            createdAt  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            INDEX identifier (identifier)
        )
    ]])
end)

local function citizenId(source)
    local player = exports.qbx_core:GetPlayer(source)
    return player and player.PlayerData.citizenid
end

local function soundName(source)
    return ('npwd_music_%s'):format(source)
end

lib.callback.register('npwd:music:getTracks', function(source)
    local cid = citizenId(source)
    if not cid then return {} end

    return MySQL.query.await(
        'SELECT id, title, url FROM npwd_music_tracks WHERE identifier = ? ORDER BY id DESC',
        { cid }
    ) or {}
end)

lib.callback.register('npwd:music:addTrack', function(source, title, url)
    local cid = citizenId(source)
    if not cid or type(url) ~= 'string' then return false end

    url = url:gsub('^%s+', ''):gsub('%s+$', '')
    if not url:match('^https://') then return false end

    local count = MySQL.scalar.await(
        'SELECT COUNT(*) FROM npwd_music_tracks WHERE identifier = ?', { cid }
    ) or 0
    if count >= TRACK_LIMIT then return false end

    title = (type(title) == 'string' and title ~= '' and title or 'Untitled'):sub(1, 120)

    MySQL.insert.await(
        'INSERT INTO npwd_music_tracks (identifier, title, url) VALUES (?, ?, ?)',
        { cid, title, url:sub(1, 500) }
    )

    return true
end)

lib.callback.register('npwd:music:removeTrack', function(source, id)
    local cid = citizenId(source)
    if not cid or not id then return false end

    -- Ownership is part of the DELETE rather than a prior read.
    local affected = MySQL.update.await(
        'DELETE FROM npwd_music_tracks WHERE id = ? AND identifier = ?', { id, cid }
    )

    return (affected or 0) > 0
end)

---Speaker playback: everyone in range gets the same sound at the same spot.
lib.callback.register('npwd:music:playSpeaker', function(source, url, volume)
    if type(url) ~= 'string' or not url:match('^https://') then return false end

    local ped = GetPlayerPed(source)
    if not ped or ped == 0 then return false end

    local coords = GetEntityCoords(ped)
    local name = soundName(source)

    speakers[source] = name
    -- -1 so it plays for every client; xsound handles the falloff from there.
    exports.xsound:PlayUrlPos(-1, name, url, math.min(math.max(volume or 0.5, 0.0), 1.0), coords, false)
    exports.xsound:Distance(-1, name, SPEAKER_DISTANCE)

    return true
end)

local function stopSpeaker(source)
    local name = speakers[source]
    if not name then return end

    exports.xsound:Destroy(-1, name)
    speakers[source] = nil
end

lib.callback.register('npwd:music:stopSpeaker', function(source)
    stopSpeaker(source)
    return true
end)

lib.callback.register('npwd:music:setSpeakerVolume', function(source, volume)
    local name = speakers[source]
    if not name then return false end

    exports.xsound:setVolumeMax(-1, name, math.min(math.max(volume or 0.5, 0.0), 1.0))
    return true
end)

-- A speaker with nobody to own it should not keep playing.
AddEventHandler('playerDropped', function()
    stopSpeaker(source)
end)

AddEventHandler('onResourceStop', function(resource)
    if resource ~= GetCurrentResourceName() then return end

    for src in pairs(speakers) do
        stopSpeaker(src)
    end
end)

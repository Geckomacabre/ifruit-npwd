-- -----------------------------------------------------------------------------
-- Music app, client side.
--
-- Two ways to listen, and they are genuinely different mechanisms rather than
-- a cosmetic switch:
--   earbuds -- xsound on this client only, nobody else hears it
--   speaker -- the server broadcasts it as a positioned sound, so anyone
--              standing near where you started it hears it too
-- -----------------------------------------------------------------------------

local EARBUD_SOUND = 'npwd_music_local'

local current = nil -- { id, title, url, mode, volume, paused }

local function stopEarbuds()
    if exports.xsound:soundExists(EARBUD_SOUND) then
        exports.xsound:Destroy(EARBUD_SOUND)
    end
end

local function stopEverything()
    stopEarbuds()
    lib.callback.await('npwd:music:stopSpeaker', false)
    current = nil
end

RegisterNUICallback('npwd:music:fetch', function(_, cb)
    cb({
        tracks = lib.callback.await('npwd:music:getTracks', false) or {},
        current = current,
    })
end)

RegisterNUICallback('npwd:music:add', function(data, cb)
    local ok = lib.callback.await('npwd:music:addTrack', false, data and data.title, data and data.url)
    cb({ ok = ok == true })
end)

RegisterNUICallback('npwd:music:remove', function(data, cb)
    -- Deleting whatever is playing should also stop it, or the sound outlives
    -- the row it came from with no way to stop it from the UI.
    if current and data and current.id == data.id then
        stopEverything()
    end

    local ok = lib.callback.await('npwd:music:removeTrack', false, data and data.id)
    cb({ ok = ok == true })
end)

RegisterNUICallback('npwd:music:play', function(data, cb)
    if not data or not data.url then return cb({ ok = false }) end

    stopEverything()

    local volume = math.min(math.max(tonumber(data.volume) or 0.5, 0.0), 1.0)
    local mode = data.mode == 'speaker' and 'speaker' or 'earbuds'
    local ok

    if mode == 'speaker' then
        ok = lib.callback.await('npwd:music:playSpeaker', false, data.url, volume)
    else
        exports.xsound:PlayUrl(EARBUD_SOUND, data.url, volume, false)
        ok = true
    end

    if ok then
        current = {
            id = data.id,
            title = data.title,
            url = data.url,
            mode = mode,
            volume = volume,
            paused = false,
        }
    end

    cb({ ok = ok == true, current = current })
end)

RegisterNUICallback('npwd:music:togglePause', function(_, cb)
    if not current then return cb({ ok = false }) end

    -- Only earbuds can pause: a speaker is shared, and silently freezing one
    -- for everyone else from a phone in your pocket is not the same action.
    if current.mode ~= 'earbuds' then
        return cb({ ok = false, message = 'Speakers cannot be paused, only stopped.' })
    end

    if current.paused then
        exports.xsound:Resume(EARBUD_SOUND)
    else
        exports.xsound:Pause(EARBUD_SOUND)
    end

    current.paused = not current.paused
    cb({ ok = true, current = current })
end)

RegisterNUICallback('npwd:music:stop', function(_, cb)
    stopEverything()
    cb({ ok = true })
end)

RegisterNUICallback('npwd:music:setVolume', function(data, cb)
    if not current then return cb({ ok = false }) end

    local volume = math.min(math.max(tonumber(data and data.volume) or 0.5, 0.0), 1.0)
    current.volume = volume

    if current.mode == 'speaker' then
        lib.callback.await('npwd:music:setSpeakerVolume', false, volume)
    else
        exports.xsound:setVolume(EARBUD_SOUND, volume)
    end

    cb({ ok = true, current = current })
end)

AddEventHandler('onResourceStop', function(resource)
    if resource ~= GetCurrentResourceName() then return end
    stopEarbuds()
end)

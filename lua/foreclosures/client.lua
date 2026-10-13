-- -----------------------------------------------------------------------------
-- Maze Bank Foreclosures, client side: NUI callbacks for the phone. Everything that matters happens on the server (server.lua). The client's
-- own jobs: naming where a property is (the game's zone names only exist on the client) and dropping a waypoint.
-- -----------------------------------------------------------------------------

local zoneCache = {}

--- "Vinewood", "Del Perro": what the game calls the area around a point.
local function zoneName(x, y, z)
    local key = ('%d:%d'):format(x // 25, y // 25)
    if zoneCache[key] then return zoneCache[key] end

    local label = GetLabelText(GetNameOfZone(x + 0.0, y + 0.0, (z or 0.0) + 0.0))
    if label == 'NULL' then label = nil end

    zoneCache[key] = label
    return label
end

RegisterNUICallback('npwd:foreclosures:market', function(_, cb)
    local market = lib.callback.await('npwd:foreclosures:market', false)
    if not market then return cb(nil) end

    for _, l in ipairs(market.listings) do
        if l.x and l.y then l.zone = zoneName(l.x, l.y, l.z) end
    end

    cb(market)
end)

RegisterNUICallback('npwd:foreclosures:catalog', function(data, cb)
    cb(lib.callback.await('npwd:foreclosures:catalog', false, data and data.key) or {})
end)

RegisterNUICallback('npwd:foreclosures:quote', function(data, cb)
    cb(lib.callback.await('npwd:foreclosures:quote', false, data and data.key, data and data.choices) or { error = 'No answer.' })
end)

RegisterNUICallback('npwd:foreclosures:buy', function(data, cb)
    cb(lib.callback.await('npwd:foreclosures:buy', false, data and data.key, data and data.choices) or { ok = false, message = 'No answer.' })
end)

RegisterNUICallback('npwd:foreclosures:locate', function(data, cb)
    local x, y = data and tonumber(data.x), data and tonumber(data.y)
    if not x or not y then return cb({ ok = false }) end

    SetNewWaypoint(x + 0.0, y + 0.0)
    cb({ ok = true })
end)

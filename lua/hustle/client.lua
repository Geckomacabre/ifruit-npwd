-- -----------------------------------------------------------------------------
-- Hustle app, client side: every way to make money on the server.
--
-- The list itself lives in um_guide (resources/[UM]/um_guide/config.lua), the
-- same data that explains a place the first time you walk up to it, so there
-- is one list to keep right rather than two. This file only relays it to the
-- phone and drops waypoints, which um_guide does (it knows the coordinates;
-- the phone is only ever sent distances).
-- -----------------------------------------------------------------------------

local function guideRunning()
    return GetResourceState('um_guide') == 'started'
end

RegisterNUICallback('npwd:hustle:fetch', function(_, cb)
    if not guideRunning() then
        return cb({ categories = {}, activities = {}, found = 0, total = 0, error = 'The city guide is offline.' })
    end

    local ok, dir = pcall(function() return exports.um_guide:GetDirectory() end)
    if not ok or type(dir) ~= 'table' then
        return cb({ categories = {}, activities = {}, found = 0, total = 0, error = 'The city guide is offline.' })
    end

    cb(dir)
end)

RegisterNUICallback('npwd:hustle:waypoint', function(data, cb)
    local id = data and data.id
    local step = data and tonumber(data.step)
    if type(id) ~= 'string' or not guideRunning() then return cb({ ok = false }) end

    local ok, set = pcall(function() return exports.um_guide:SetWaypoint(id, step) end)
    cb({ ok = ok and set == true })
end)

-- Small helper: forward a server callback result to the NUI cb as {ok, err, extra}.
local function action(name, payload, cb)
    lib.callback(name, false, function(ok, err, extra)
        cb({ ok = ok, err = err, extra = extra })
    end, payload)
end

-- Current street + area label from the player's position.
local function positionLabels()
    local coords = GetEntityCoords(PlayerPedId())
    local s1 = GetStreetNameAtCoord(coords.x, coords.y, coords.z)
    local street = GetStreetNameFromHashKey(s1)
    local zoneCode = GetNameOfZone(coords.x, coords.y, coords.z)
    local area = GetLabelText(zoneCode)
    if area == 'NULL' or area == nil then area = zoneCode end
    return coords, street or '', area or ''
end

RegisterNUICallback('npwd:crime:getPosition', function(_, cb)
    local coords, street, area = positionLabels()
    cb({ coords = { x = coords.x, y = coords.y, z = coords.z }, streetLabel = street, zoneLabel = area })
end)

RegisterNUICallback('npwd:crime:getAppData', function(_, cb)
    lib.callback('noted_crimeapp:getAppData', false, function(data) cb(data or {}) end)
end)

RegisterNUICallback('npwd:crime:signup',         function(data, cb) action('noted_crimeapp:signup', data, cb) end)
RegisterNUICallback('npwd:crime:login',          function(data, cb) action('noted_crimeapp:login', data, cb) end)
RegisterNUICallback('npwd:crime:logout',         function(_, cb)    action('noted_crimeapp:logout', nil, cb) end)
RegisterNUICallback('npwd:crime:changePassword', function(data, cb) action('noted_crimeapp:changePassword', data, cb) end)
RegisterNUICallback('npwd:crime:confirmReport', function(data, cb) action('noted_crimeapp:confirmReport', data.id, cb) end)
RegisterNUICallback('npwd:crime:commentReport', function(data, cb) action('noted_crimeapp:commentReport', data, cb) end)
RegisterNUICallback('npwd:crime:deleteReport',  function(data, cb) action('noted_crimeapp:deleteReport', data.id, cb) end)
RegisterNUICallback('npwd:crime:deleteComment', function(data, cb) action('noted_crimeapp:deleteComment', data, cb) end)
RegisterNUICallback('npwd:crime:getHeat', function(_, cb)
    lib.callback('noted_crimeapp:getHeat', false, function(data) cb(data or { cells = {} }) end)
end)

RegisterNUICallback('npwd:crime:canDelete', function(data, cb)
    lib.callback('noted_crimeapp:canDelete', false, function(v) cb(v == true) end, data.id)
end)
RegisterNUICallback('npwd:crime:sos',           function(data, cb) action('noted_crimeapp:sos', data, cb) end)
RegisterNUICallback('npwd:crime:setSubscribed', function(data, cb) action('noted_crimeapp:setSubscribed', data.value, cb) end)

-- postReport: enrich with authoritative-side labels (coords come from server).
RegisterNUICallback('npwd:crime:postReport', function(data, cb)
    local _, street, area = positionLabels()
    data.streetLabel, data.zoneLabel = street, area
    action('noted_crimeapp:postReport', data, cb)
end)

RegisterNUICallback('npwd:crime:setWaypoint', function(data, cb)
    if data and data.x and data.y then SetNewWaypoint(data.x + 0.0, data.y + 0.0) end
    cb('ok')
end)

-- Server pushes → UI (only meaningful while app is open; harmless otherwise).
RegisterNetEvent('noted_crimeapp:reports', function(kind, report)
    SendAppMessage('reports', { kind = kind, report = report })
end)

RegisterNetEvent('noted_crimeapp:notify', function(payload)
    -- Phone notification (works even if the app isn't focused).
    exports.npwd:createNotification({
        notisId = ('crime:%s'):format(GetGameTimer()),
        appId = 'CRIME',
        content = payload.body,
        secondaryTitle = payload.title,
        path = '/crime',
    })
    SendAppMessage('notify', payload)
end)

-- Tell the server we're ready so it can register us as a subscriber.
CreateThread(function()
    Wait(1500)
    TriggerServerEvent('noted_crimeapp:clientReady')
end)

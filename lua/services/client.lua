-- -----------------------------------------------------------------------------
-- Services app, client side: thin NUI -> server callback bridge, plus pushing
-- new messages into the phone. All checks happen on the server.
-- -----------------------------------------------------------------------------

---@param name string
---@param handler fun(data: table): table
local function nui(name, handler)
    RegisterNUICallback('npwd:services:' .. name, function(data, cb)
        cb(handler(type(data) == 'table' and data or {}))
    end)
end

nui('getCompanies', function()
    return lib.callback.await('npwd:services:getCompanies', false) or { companies = {} }
end)

nui('getThreads', function()
    return lib.callback.await('npwd:services:getThreads', false) or {}
end)

nui('openThread', function(data)
    return { id = lib.callback.await('npwd:services:openThread', false, data.job) }
end)

nui('getThread', function(data)
    return lib.callback.await('npwd:services:getThread', false, data.id) or { error = 'no_access' }
end)

nui('sendMessage', function(data)
    local ok, result = lib.callback.await('npwd:services:sendMessage', false, data.id, data.text, data.shareLocation == true)
    if ok then return { ok = true, message = result } end
    return { ok = false, error = result }
end)

nui('setDuty', function(data)
    return { ok = lib.callback.await('npwd:services:setDuty', false, data.onDuty == true) == true }
end)

nui('getManagement', function()
    return lib.callback.await('npwd:services:getManagement', false) or { error = 'not_boss' }
end)

nui('moveMoney', function(data)
    local ok, result = lib.callback.await('npwd:services:moveMoney', false, data.direction, data.amount)
    if ok then return { ok = true, balance = result } end
    return { ok = false, error = result }
end)

nui('fire', function(data)
    return { ok = lib.callback.await('npwd:services:fire', false, data.citizenid) == true }
end)

nui('setGrade', function(data)
    return { ok = lib.callback.await('npwd:services:setGrade', false, data.citizenid, data.grade) == true }
end)

nui('hire', function(data)
    local ok, err = lib.callback.await('npwd:services:hire', false, data.targetId)
    return { ok = ok == true, error = err }
end)

nui('setWaypoint', function(data)
    local x, y = tonumber(data.x), tonumber(data.y)
    if x and y then SetNewWaypoint(x + 0.0, y + 0.0) end
    return { ok = x ~= nil and y ~= nil }
end)

RegisterNetEvent('npwd:services:newMessage', function(message, title, preview)
    SendNUIMessage({ app = 'SERVICES', method = 'npwd:services:newMessage', data = message })
    SendNUIMessage({
        app = 'PHONE',
        method = 'npwd:createNotification',
        data = {
            appId = 'SERVICES',
            notisId = 'npwd:services:' .. tostring(message.id),
            secondaryTitle = title,
            content = preview,
            keepOpen = false,
            duration = 4000,
            path = '/services/thread/' .. tostring(message.channelId),
        },
    })
end)

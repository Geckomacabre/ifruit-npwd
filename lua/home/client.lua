-- -----------------------------------------------------------------------------
-- Home app, client side: NUI callbacks for the phone. Everything real happens
-- on the server (see server.lua); the only client-side work is dropping a
-- waypoint, which the server cannot do.
-- -----------------------------------------------------------------------------

RegisterNUICallback('npwd:home:fetch', function(_, cb)
    cb(lib.callback.await('npwd:home:getProperties', false) or {})
end)

RegisterNUICallback('npwd:home:locate', function(data, cb)
    local x, y = data and data.x, data and data.y
    if not x or not y then return cb({ ok = false }) end

    SetNewWaypoint(x + 0.0, y + 0.0)
    cb({ ok = true })
end)

RegisterNUICallback('npwd:home:revokeKey', function(data, cb)
    local ok = lib.callback.await(
        'npwd:home:revokeKey', false,
        data and data.propertyId,
        data and data.citizenid
    )
    cb({ ok = ok == true })
end)

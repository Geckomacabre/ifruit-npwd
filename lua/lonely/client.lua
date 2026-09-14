-- -----------------------------------------------------------------------------
-- LonelyMans, client side.
--
-- Ported from the lonelymans resource. Beyond the usual lb-phone removal, this
-- one needed a framework swap: it was written against qb-core, which does not
-- exist on this server (Qbox ships qbx_core), so it could never have started
-- here. QBCore.Functions calls are now their qbx equivalents and
-- TriggerCallback is ox_lib's lib.callback, as used by the rest of npwd/lua.
-- -----------------------------------------------------------------------------

-- ─── NUI Callbacks ───────────────────────────────────────────────────────────

-- Called on app boot instead of a login screen.
-- Returns the player's GTA character identity so the UI knows who they are.
RegisterNUICallback('npwd:lonely:getPlayerData', function(_, cb)
    local PlayerData = exports.qbx_core:GetPlayerData()
    cb({
        citizenid = PlayerData.citizenid,
        charName  = PlayerData.charinfo.firstname .. ' ' .. PlayerData.charinfo.lastname,
        phone     = PlayerData.charinfo.phone or '',
    })
end)

RegisterNUICallback('npwd:lonely:getConfig', function(_, cb)
    cb({
        minSubPrice  = Config.MinSubPrice,
        maxSubPrice  = Config.MaxSubPrice,
        maxPostPrice = Config.MaxPostPrice,
        creatorCut   = Config.CreatorCut,
    })
end)

RegisterNUICallback('npwd:lonely:getFeed', function(_, cb)
    lib.callback('lonelymans:getFeed', false, function(result)
        cb(result or {})
    end)
end)

RegisterNUICallback('npwd:lonely:getCreators', function(_, cb)
    lib.callback('lonelymans:getCreators', false, function(result)
        cb(result or {})
    end)
end)

RegisterNUICallback('npwd:lonely:getCreatorProfile', function(data, cb)
    lib.callback('lonelymans:getCreatorProfile', false, function(result)
        cb(result or {})
    end, data.creatorId)
end)

RegisterNUICallback('npwd:lonely:getMyProfile', function(_, cb)
    lib.callback('lonelymans:getMyProfile', false, function(result)
        cb(result or {})
    end)
end)

RegisterNUICallback('npwd:lonely:subscribe', function(data, cb)
    lib.callback('lonelymans:subscribe', false, function(result)
        cb(result or { success = false, message = 'No response from server.' })
    end, data.creatorId)
end)

RegisterNUICallback('npwd:lonely:unlockPost', function(data, cb)
    lib.callback('lonelymans:unlockPost', false, function(result)
        cb(result or { success = false, message = 'No response from server.' })
    end, data.postId)
end)

RegisterNUICallback('npwd:lonely:createProfile', function(data, cb)
    lib.callback('lonelymans:createProfile', false, function(result)
        cb(result or { success = false, message = 'No response from server.' })
    end, data)
end)

RegisterNUICallback('npwd:lonely:updateProfile', function(data, cb)
    lib.callback('lonelymans:updateProfile', false, function(result)
        cb(result or { success = false, message = 'No response from server.' })
    end, data)
end)

RegisterNUICallback('npwd:lonely:createPost', function(data, cb)
    lib.callback('lonelymans:createPost', false, function(result)
        cb(result or { success = false, message = 'No response from server.' })
    end, data)
end)

RegisterNUICallback('npwd:lonely:deletePost', function(data, cb)
    lib.callback('lonelymans:deletePost', false, function(result)
        cb(result or { success = false, message = 'No response from server.' })
    end, data.postId)
end)

-- ─── Login / Account ─────────────────────────────────────────────────────────

-- Returns all configured social apps with their enabled status
RegisterNUICallback('npwd:lonely:getSocialApps', function(_, cb)
    local list = {}
    for key, cfg in pairs(Config.SocialApps or {}) do
        list[#list + 1] = {
            key     = key,
            label   = cfg.Label,
            color   = cfg.Color,
            enabled = cfg.Enabled,
        }
    end
    cb(list)
end)

RegisterNUICallback('npwd:lonely:checkAccount', function(_, cb)
    lib.callback('lonelymans:checkAccount', false, function(result)
        cb(result or {})
    end)
end)

RegisterNUICallback('npwd:lonely:loginWithApp', function(data, cb)
    lib.callback('lonelymans:loginWithApp', false, function(result)
        cb(result or { success = false, message = 'No response from server.' })
    end, data.appKey)
end)

RegisterNUICallback('npwd:lonely:createAccount', function(data, cb)
    lib.callback('lonelymans:createAccount', false, function(result)
        cb(result or { success = false, message = 'No response from server.' })
    end, data)
end)

RegisterNUICallback('npwd:lonely:logout', function(_, cb)
    lib.callback('lonelymans:logout', false, function(result)
        cb(result or { success = false })
    end)
end)

RegisterNUICallback('npwd:lonely:toggleLike', function(data, cb)
    lib.callback('lonelymans:toggleLike', false, function(result)
        cb(result or { success = false })
    end, data.postId)
end)

RegisterNUICallback('npwd:lonely:getComments', function(data, cb)
    lib.callback('lonelymans:getComments', false, function(result)
        cb(result or {})
    end, data.postId)
end)

RegisterNUICallback('npwd:lonely:addComment', function(data, cb)
    lib.callback('lonelymans:addComment', false, function(result)
        cb(result or { success = false })
    end, data)
end)

RegisterNUICallback('npwd:lonely:getCreatorPhone', function(data, cb)
    lib.callback('lonelymans:getCreatorPhone', false, function(result)
        cb(result)
    end, data.creatorId)
end)



---Raised by the server, which cannot call NPWD's client-side notification
---export itself.
RegisterNetEvent('npwd:lonely:notify', function(title, content)
    exports.npwd:createNotification({
        notisId = ('lonely:%s'):format(GetGameTimer()),
        appId = 'LONELY',
        content = content,
        secondaryTitle = title,
        path = '/lonely',
    })
end)

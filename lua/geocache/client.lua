-- -----------------------------------------------------------------------------
-- GeoCache app, client side.
--
-- A thin proxy: all the gameplay lives in qbx_geocaching, which already exposes
-- everything this needs as lib.callbacks. The only real work done here is the
-- placement mode, where the player nudges a ghost prop into position before
-- submitting a cache -- that has to be client-side because it reads controls
-- and the ground height.
-- -----------------------------------------------------------------------------

local PLACE_STEP = 0.04
local GHOST_MODEL = `prop_box_ammo07a`

RegisterNUICallback('npwd:geocache:getCaches', function(_, cb)
    cb(lib.callback.await('qbx_geocaching:phone:getCaches', false) or {})
end)

RegisterNUICallback('npwd:geocache:getCacheDetail', function(data, cb)
    cb(lib.callback.await(
        'qbx_geocaching:phone:getCacheDetail', false,
        data and data.cacheId, data and data.cacheType
    ) or {})
end)

RegisterNUICallback('npwd:geocache:getMyStats', function(_, cb)
    cb(lib.callback.await('qbx_geocaching:phone:getMyStats', false)
        or { found = 0, submitted = 0, recent = {} })
end)

RegisterNUICallback('npwd:geocache:rateCache', function(data, cb)
    cb(lib.callback.await(
        'qbx_geocaching:phone:rateCache', false,
        data and data.cacheId, data and data.cacheType, data and data.stars
    ) or { ok = false })
end)

RegisterNUICallback('npwd:geocache:addComment', function(data, cb)
    cb(lib.callback.await(
        'qbx_geocaching:phone:addComment', false,
        data and data.cacheId, data and data.cacheType, data and data.text
    ) or { ok = false })
end)

---@param x number
---@param y number
---@param z number
---@return number
local function snapToGround(x, y, z)
    local found, groundZ = GetGroundZFor_3dCoord(x, y, z + 3.0, false)
    return found and (groundZ + 0.05) or z
end

RegisterNUICallback('npwd:geocache:startPlacement', function(data, cb)
    local name = data and data.name or ''
    local clue = data and data.clue or ''
    local difficulty = data and data.difficulty or 3

    -- The phone goes away for placement rather than just dropping NUI focus:
    -- NPWD owns its own visibility, and yanking focus out from under it leaves
    -- the shell on screen with nothing able to receive input.
    exports.npwd:setPhoneVisible(false)

    CreateThread(function()
        lib.requestModel(GHOST_MODEL)

        local ghost = CreateObjectNoOffset(GHOST_MODEL, 0, 0, 0, false, false, false)
        SetEntityAsMissionEntity(ghost, true, true)
        SetEntityAlpha(ghost, 150, false)
        SetEntityCollision(ghost, false, false)

        lib.showTextUI('[↑↓←→] Move  |  [E] Confirm  |  [ESC] Cancel', {
            position = 'top-center',
            icon = 'fa-solid fa-box',
        })

        local start = GetEntityCoords(cache.ped)
        local pos = vector3(start.x, start.y, snapToGround(start.x, start.y, start.z))
        local result

        while result == nil do
            local heading = GetEntityHeading(cache.ped)

            -- Freeze the character so the arrow keys only move the ghost.
            DisableControlAction(0, 30, true)
            DisableControlAction(0, 31, true)
            DisableControlAction(0, 21, true)

            local rad = math.rad(heading)
            local forward = vector3(-math.sin(rad), math.cos(rad), 0.0)
            local right = vector3(math.cos(rad), math.sin(rad), 0.0)

            -- 172-175 are the frontend arrow keys, which stay live even with
            -- the movement controls above disabled.
            if IsControlPressed(0, 172) then pos = pos + forward * PLACE_STEP end
            if IsControlPressed(0, 173) then pos = pos - forward * PLACE_STEP end
            if IsControlPressed(0, 174) then pos = pos - right * PLACE_STEP end
            if IsControlPressed(0, 175) then pos = pos + right * PLACE_STEP end

            pos = vector3(pos.x, pos.y, snapToGround(pos.x, pos.y, pos.z))

            SetEntityCoordsNoOffset(ghost, pos.x, pos.y, pos.z, false, false, false)
            SetEntityHeading(ghost, heading)

            if IsControlJustPressed(0, 38) then -- E
                result = lib.callback.await(
                    'qbx_geocaching:phone:submitCache', false,
                    name, clue, difficulty, pos.x, pos.y, pos.z, heading
                ) or { ok = false, message = 'Server error.' }
            elseif IsControlJustPressed(0, 200) or IsControlJustPressed(0, 322) then -- ESC
                result = { ok = false, message = 'Placement cancelled.' }
            end

            Wait(0)
        end

        lib.hideTextUI()
        if DoesEntityExist(ghost) then DeleteObject(ghost) end
        SetModelAsNoLongerNeeded(GHOST_MODEL)

        exports.npwd:setPhoneVisible(true)
        cb(result)
    end)
end)

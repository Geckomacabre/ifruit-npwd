-- -----------------------------------------------------------------------------
-- Fitbit app, server side: the alert thresholds, stored on player metadata
-- under 'fitbit' -- the same key noted_fitbit used, so anyone who already set
-- thresholds there keeps them.
-- -----------------------------------------------------------------------------

local function getSettings(source)
    local player = exports.qbx_core:GetPlayer(source)
    if not player then return nil end

    local meta = player.PlayerData.metadata.fitbit
    return {
        food = tonumber(meta and meta.food) or 0,
        thirst = tonumber(meta and meta.thirst) or 0,
        interval = tonumber(meta and meta.interval) or 0,
    }
end

lib.callback.register('npwd:fitbit:getSettings', function(source)
    return getSettings(source)
end)

---@param stat 'food'|'thirst'|'interval'
---@param value number food/thirst: 0 disables. interval: minutes between repeats.
lib.callback.register('npwd:fitbit:setAlert', function(source, stat, value)
    value = tonumber(value)
    if not value or value ~= value then return false end

    if stat == 'food' or stat == 'thirst' then
        value = math.floor(value / 5 + 0.5) * 5 -- snap to 5s, as the sliders do
        if value < 0 or value > 95 then return false end
    elseif stat == 'interval' then
        value = math.floor(value)
        if value < 1 or value > 30 then return false end
    else
        return false
    end

    local settings = getSettings(source)
    if not settings then return false end

    settings[stat] = value

    local player = exports.qbx_core:GetPlayer(source)
    if not player then return false end
    player.Functions.SetMetaData('fitbit', settings)

    return true, settings
end)

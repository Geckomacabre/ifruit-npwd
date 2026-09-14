-- -----------------------------------------------------------------------------
-- Fitbit app, client side: watches hunger and thirst and pushes a phone
-- notification when either drops below the threshold the player set.
--
-- Ported from noted_fitbit. That resource carried a three-framework bridge
-- (qbox/qbcore/esx); this one talks to qbx directly like every other Lua app
-- in npwd/lua, because the phone already targets qbx.
-- -----------------------------------------------------------------------------

-- Repeat gap used until the player picks their own reminder frequency.
local DEFAULT_COOLDOWN_MS = 2 * 60 * 1000

local ALERTS = {
    food = 'Nutrition low: %d%%. Eat something soon.',
    thirst = 'Hydration low: %d%%. Drink something soon.',
}

-- food/thirst: alert below this, 0 = off. interval: minutes between repeats,
-- 0 = fall back to DEFAULT_COOLDOWN_MS.
local thresholds = { food = 0, thirst = 0, interval = 0 }
local nextAlert = { food = 0, thirst = 0 }
local status = { food = 100, thirst = 100 }

---@param stat 'food'|'thirst'
---@param value number
local function onStatus(stat, value)
    if type(value) ~= 'number' then return end
    status[stat] = value

    local threshold = thresholds[stat]
    if not threshold or threshold <= 0 or value >= threshold then return end

    local now = GetGameTimer()
    if now < nextAlert[stat] then return end

    local cooldown = thresholds.interval > 0 and thresholds.interval * 60000 or DEFAULT_COOLDOWN_MS
    nextAlert[stat] = now + cooldown

    exports.npwd:createNotification({
        notisId = ('fitbit:%s:%s'):format(stat, now),
        appId = 'FITBIT',
        content = ALERTS[stat]:format(math.floor(value + 0.5)),
        path = '/fitbit',
    })
end

-- qbx pushes these only when the value actually changes.
AddEventHandler('hud:client:UpdateNeeds', function(food, thirst)
    onStatus('food', food)
    onStatus('thirst', thirst)
end)

local function loadSettings()
    local settings = lib.callback.await('npwd:fitbit:getSettings', false)
    if not settings then return end

    thresholds.food = settings.food or 0
    thresholds.thirst = settings.thirst or 0
    thresholds.interval = settings.interval or 0
end

---Reads the live values straight off the player rather than waiting for the
---next needs event, so opening the app never shows a stale 100%.
local function readStatus()
    local data = exports.qbx_core:GetPlayerData()
    local metadata = data and data.metadata

    if metadata then
        status.food = tonumber(metadata.hunger) or status.food
        status.thirst = tonumber(metadata.thirst) or status.thirst
    end
end

RegisterNetEvent('QBCore:Client:OnPlayerLoaded', function()
    readStatus()
    loadSettings()
end)

RegisterNetEvent('QBCore:Client:OnPlayerUnload', function()
    thresholds.food, thresholds.thirst, thresholds.interval = 0, 0, 0
end)

RegisterNUICallback('npwd:fitbit:fetch', function(_, cb)
    readStatus()
    if thresholds.food == 0 and thresholds.thirst == 0 and thresholds.interval == 0 then
        -- Covers a mid-session restart, where the loaded event already fired.
        loadSettings()
    end

    cb({ status = status, thresholds = thresholds })
end)

RegisterNUICallback('npwd:fitbit:setAlert', function(data, cb)
    local ok, settings = lib.callback.await(
        'npwd:fitbit:setAlert', false,
        data and data.stat, data and data.value
    )

    if ok and settings then
        thresholds.food = settings.food or 0
        thresholds.thirst = settings.thirst or 0
        thresholds.interval = settings.interval or 0
        -- Apply the new settings on the next tick rather than making the
        -- player wait out a cooldown started under the old ones.
        nextAlert.food, nextAlert.thirst = 0, 0
    end

    cb({ ok = ok == true, thresholds = thresholds })
end)

CreateThread(function()
    Wait(2000)
    readStatus()
    loadSettings()
end)

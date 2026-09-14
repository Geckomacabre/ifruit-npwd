-- -----------------------------------------------------------------------------
-- Garage app, client side: NUI callbacks for the phone, driving valet/summoned
-- cars to the player, and key-fob feedback for remote locking.
-- -----------------------------------------------------------------------------

local VALET_MIN_DISTANCE = 75.0
local VALET_MAX_DISTANCE = 250.0
local DRIVE_SPEED = 20.0
local ARRIVE_DISTANCE = 12.0
local GIVE_UP_MS = 120000
local LOCK_FEEDBACK_DISTANCE = 60.0

---A road node near the player, far enough that the car visibly drives up.
---@return vector3?, number?
local function findSpawnNode()
    local coords = GetEntityCoords(cache.ped)

    for nth = 1, 80 do
        local found, position, heading = GetNthClosestVehicleNodeWithHeading(coords.x, coords.y, coords.z, nth, 0, 0, 0)
        if not found then return end

        local distance = #(coords - position)
        if distance > VALET_MAX_DISTANCE then return end
        if distance > VALET_MIN_DISTANCE then return position, heading end
    end
end

---@param netId number
---@return number? entity
local function waitForNetworkEntity(netId)
    local timeout = GetGameTimer() + 5000

    while not NetworkDoesEntityExistWithNetworkId(netId) do
        if GetGameTimer() > timeout then return end
        Wait(50)
    end

    return NetToEnt(netId)
end

---@param entity number
---@return boolean
local function takeControl(entity)
    local timeout = GetGameTimer() + 3000
    NetworkRequestControlOfEntity(entity)

    while not NetworkHasControlOfEntity(entity) do
        if GetGameTimer() > timeout then return false end
        NetworkRequestControlOfEntity(entity)
        Wait(50)
    end

    return true
end

---@param vehicleNetId number
---@param driverNetId number?
---@param label string
local function driveToPlayer(vehicleNetId, driverNetId, label)
    local vehicle = waitForNetworkEntity(vehicleNetId)
    if not vehicle then
        TriggerServerEvent('npwd:garage:driverArrived')
        return
    end

    local blip = AddBlipForEntity(vehicle)
    SetBlipSprite(blip, 225)
    SetBlipColour(blip, 5)
    BeginTextCommandSetBlipName('STRING')
    AddTextComponentSubstringPlayerName(label)
    EndTextCommandSetBlipName(blip)

    local driver = driverNetId and waitForNetworkEntity(driverNetId)

    if driver and takeControl(driver) then
        local target = GetEntityCoords(cache.ped)

        SetBlockingOfNonTemporaryEvents(driver, true)
        SetPedKeepTask(driver, true)
        TaskVehicleDriveToCoordLongrange(driver, vehicle, target.x, target.y, target.z, DRIVE_SPEED, 786603, 8.0)

        local giveUpAt = GetGameTimer() + GIVE_UP_MS
        while DoesEntityExist(vehicle)
            and #(GetEntityCoords(vehicle) - GetEntityCoords(cache.ped)) > ARRIVE_DISTANCE
            and GetGameTimer() < giveUpAt do
            Wait(1000)
        end

        if DoesEntityExist(driver) then
            TaskLeaveVehicle(driver, vehicle, 0)
            Wait(1500)
            TaskWanderStandard(driver, 10.0, 10)
        end
    end

    RemoveBlip(blip)
    TriggerServerEvent('npwd:garage:driverArrived')
end

RegisterNUICallback('npwd:garage:fetchVehicles', function(_, cb)
    cb(lib.callback.await('npwd:garage:getVehicles', false) or {})
end)

RegisterNUICallback('npwd:garage:locate', function(data, cb)
    local coords = lib.callback.await('npwd:garage:locate', false, data and data.plate)

    if coords then
        SetNewWaypoint(coords.x, coords.y)
    end

    cb({ ok = coords and true or false })
end)

RegisterNUICallback('npwd:garage:toggleLock', function(data, cb)
    local ok, result = lib.callback.await('npwd:garage:toggleLock', false, data and data.plate)

    if not ok then
        return cb({ ok = false, error = result })
    end

    cb({ ok = true, locked = result })
end)

RegisterNUICallback('npwd:garage:summon', function(data, cb)
    local ok, vehicleNetId, driverNetId = lib.callback.await('npwd:garage:summon', false, data and data.plate)

    if not ok then
        return cb({ ok = false, error = vehicleNetId })
    end

    cb({ ok = true })
    CreateThread(function() driveToPlayer(vehicleNetId, driverNetId, 'Summoned vehicle') end)
end)

RegisterNUICallback('npwd:garage:valet', function(data, cb)
    if cache.vehicle then
        return cb({ ok = false, error = 'in_vehicle' })
    end

    local position, heading = findSpawnNode()
    if not position then
        return cb({ ok = false, error = 'no_spot' })
    end

    local ok, vehicleNetId, driverNetId = lib.callback.await('npwd:garage:valet', false, data and data.id, {
        x = position.x,
        y = position.y,
        z = position.z,
        w = heading,
    })

    if not ok then
        return cb({ ok = false, error = vehicleNetId })
    end

    cb({ ok = true })
    CreateThread(function() driveToPlayer(vehicleNetId, driverNetId, 'Valet') end)
end)

-- Key-fob feedback when the car is close enough to see: one flash and chirp
-- to lock, two to unlock.
RegisterNetEvent('npwd:garage:lockChanged', function(netId, locked)
    if not NetworkDoesEntityExistWithNetworkId(netId) then return end

    local vehicle = NetToVeh(netId)
    if #(GetEntityCoords(vehicle) - GetEntityCoords(cache.ped)) > LOCK_FEEDBACK_DISTANCE then return end

    CreateThread(function()
        for _ = 1, locked and 1 or 2 do
            SetVehicleLights(vehicle, 2)
            StartVehicleHorn(vehicle, 80, `HELDDOWN`, false)
            Wait(180)
            SetVehicleLights(vehicle, 0)
            Wait(180)
        end
    end)
end)

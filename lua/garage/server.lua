-- -----------------------------------------------------------------------------
-- Garage app, server side.
--
-- Lua rather than the phone's TypeScript on purpose: owned vehicles, garages,
-- spawning and locks all go through qbx's own code (qbx_vehicles, qbx_garages,
-- qbx.spawnVehicle, qbx_vehiclekeys), so a car handled from the phone behaves
-- exactly like one handled in the world -- same props, vehicleid state bag,
-- keys and lock state.
-- -----------------------------------------------------------------------------

local VALET_PRICE = 100 -- lb-phone's Config.Valet.Price
local DRIVER_MODEL = `S_M_Y_XMech_01`
local VALET_MAX_SPAWN_DISTANCE = 250.0
local SUMMON_MAX_DISTANCE = 400.0
local DRIVER_CLEANUP_MS = 30000

local VehicleState = { OUT = 0, GARAGED = 1, IMPOUNDED = 2 }

local valetBusy = {}
local activeDrivers = {} -- source -> driver entity currently bringing them a car

---@param plate string
---@return number? entity
local function findSpawnedVehicle(plate)
    if not plate or plate == '' then return end
    plate = qbx.string.trim(plate)

    for _, vehicle in ipairs(GetAllVehicles()) do
        if qbx.string.trim(GetVehicleNumberPlateText(vehicle)) == plate then
            return vehicle
        end
    end
end

---@param source number
---@return string?
local function citizenIdOf(source)
    local player = exports.qbx_core:GetPlayer(source)
    return player and player.PlayerData.citizenid
end

---The player's own car with this plate, if it currently exists in the world.
---@param source number
---@param plate string
---@return number? entity
local function findOwnedSpawnedVehicle(source, plate)
    local citizenid = citizenIdOf(source)
    if not citizenid or type(plate) ~= 'string' then return end

    local vehicleId = exports.qbx_vehicles:GetVehicleIdByPlate(plate)
    if not vehicleId or not exports.qbx_vehicles:GetPlayerVehicle(vehicleId, { citizenid = citizenid }) then
        return
    end

    return findSpawnedVehicle(plate)
end

---@param vehicle number
---@return boolean
local function isLocked(vehicle)
    local state = Entity(vehicle).state.doorslockstate
    if state == nil then state = GetVehicleDoorLockStatus(vehicle) end
    return state == 2
end

---Puts a driver in the car to bring it to the player (valet and summon).
---@param source number
---@param vehicle number
---@return number? driverNetId
local function spawnDriver(source, vehicle)
    local driver = CreatePedInsideVehicle(vehicle, 4, DRIVER_MODEL, -1, true, true)
    if not driver or driver == 0 then return end

    local timeout = GetGameTimer() + 2000
    while not DoesEntityExist(driver) and GetGameTimer() < timeout do Wait(0) end
    if not DoesEntityExist(driver) then return end

    activeDrivers[source] = driver
    return NetworkGetNetworkIdFromEntity(driver)
end

local function vehicleName(info, modelName)
    if not info then return modelName end
    local brand = info.brand and info.brand ~= '' and (info.brand .. ' ') or ''
    return brand .. (info.name or modelName)
end

lib.callback.register('npwd:garage:getVehicles', function(source)
    local citizenid = citizenIdOf(source)
    if not citizenid then return {} end

    local owned = exports.qbx_vehicles:GetPlayerVehicles({ citizenid = citizenid })
    local garages = exports.qbx_garages:GetGarages()
    local shared = exports.qbx_core:GetVehiclesByName()
    local list = {}

    for _, vehicle in ipairs(owned) do
        local props = vehicle.props or {}
        local plate = props.plate and qbx.string.trim(props.plate) or ''
        local entity = findSpawnedVehicle(plate)
        local garage = vehicle.garage and garages[vehicle.garage]

        local state = 'garaged'
        if entity or vehicle.state == VehicleState.OUT then
            state = 'out'
        elseif vehicle.state == VehicleState.IMPOUNDED then
            state = 'impounded'
        end

        local info = shared[vehicle.modelName]

        list[#list + 1] = {
            id = vehicle.id,
            plate = plate,
            name = vehicleName(info, vehicle.modelName),
            category = info and info.category or 'other',
            state = state,
            spawned = entity ~= nil,
            locked = entity and isLocked(entity) or nil,
            garage = garage and garage.label or vehicle.garage,
            depotPrice = vehicle.depotPrice or 0,
            fuel = math.floor(props.fuelLevel or 100),
            engine = math.floor((props.engineHealth or 1000) / 10),
            body = math.floor((props.bodyHealth or 1000) / 10),
        }
    end

    table.sort(list, function(a, b) return a.name < b.name end)
    return list
end)

---@param plate string
lib.callback.register('npwd:garage:locate', function(source, plate)
    local entity = findOwnedSpawnedVehicle(source, plate)
    if not entity then return false end

    local coords = GetEntityCoords(entity)
    return { x = coords.x, y = coords.y }
end)

-- Remote lock/unlock. Owning the car is the key: this sets the same lock state
-- bag qbx_vehiclekeys' own fob, lockpick and slim jim flows use, so everything
-- stays in sync. SetLockState ignores cars configured as noLock or shared.
---@param plate string
lib.callback.register('npwd:garage:toggleLock', function(source, plate)
    local vehicle = findOwnedSpawnedVehicle(source, plate)
    if not vehicle then return false, 'not_found' end

    exports.qbx_vehiclekeys:SetLockState(vehicle, isLocked(vehicle) and 'unlock' or 'lock')

    local locked = isLocked(vehicle)
    TriggerClientEvent('npwd:garage:lockChanged', source, NetworkGetNetworkIdFromEntity(vehicle), locked)

    return true, locked
end)

-- A car that is already out drives itself to the player.
---@param plate string
lib.callback.register('npwd:garage:summon', function(source, plate)
    if valetBusy[source] or activeDrivers[source] then return false, 'busy' end

    local vehicle = findOwnedSpawnedVehicle(source, plate)
    if not vehicle then return false, 'not_found' end

    for seat = -1, 6 do
        if GetPedInVehicleSeat(vehicle, seat) ~= 0 then return false, 'occupied' end
    end

    if #(GetEntityCoords(vehicle) - GetEntityCoords(GetPlayerPed(source))) > SUMMON_MAX_DISTANCE then
        return false, 'too_far'
    end

    local driverNetId = spawnDriver(source, vehicle)
    if not driverNetId then return false, 'error' end

    return true, NetworkGetNetworkIdFromEntity(vehicle), driverNetId
end)

---@param vehicleId number
---@param spawn { x: number, y: number, z: number, w: number } road node the client picked near the player
lib.callback.register('npwd:garage:valet', function(source, vehicleId, spawn)
    if valetBusy[source] or activeDrivers[source] then return false, 'busy' end

    local citizenid = citizenIdOf(source)
    if not citizenid then return false, 'error' end

    -- Only cars parked in a garage: an OUT car may still exist somewhere, and a
    -- valet copy of it would duplicate the vehicle.
    local vehicle = exports.qbx_vehicles:GetPlayerVehicle(tonumber(vehicleId), {
        citizenid = citizenid,
        states = VehicleState.GARAGED,
    })
    if not vehicle then return false, 'not_garaged' end
    if findSpawnedVehicle(vehicle.props.plate) then return false, 'already_out' end

    if type(spawn) ~= 'table' or not tonumber(spawn.x) or not tonumber(spawn.y) or not tonumber(spawn.z) then
        return false, 'no_spot'
    end

    local spawnCoords = vec3(spawn.x + 0.0, spawn.y + 0.0, spawn.z + 0.0)
    if #(GetEntityCoords(GetPlayerPed(source)) - spawnCoords) > VALET_MAX_SPAWN_DISTANCE then
        return false, 'no_spot'
    end

    if (exports.qbx_core:GetMoney(source, 'bank') or 0) < VALET_PRICE
        or not exports.qbx_core:RemoveMoney(source, 'bank', VALET_PRICE, 'npwd-garage-valet') then
        return false, 'no_money'
    end

    valetBusy[source] = true

    local ok, netId, entity = pcall(qbx.spawnVehicle, {
        spawnSource = vec4(spawnCoords.x, spawnCoords.y, spawnCoords.z, (tonumber(spawn.w) or 0.0) + 0.0),
        model = vehicle.props.model,
        props = vehicle.props,
    })

    if not ok or not netId or not entity then
        valetBusy[source] = nil
        exports.qbx_core:AddMoney(source, 'bank', VALET_PRICE, 'npwd-garage-valet-refund')
        lib.print.error(('valet spawn failed for %s: %s'):format(source, ok and 'no entity' or netId))
        return false, 'error'
    end

    Entity(entity).state:set('vehicleid', vehicle.id, false)
    exports.qbx_vehicles:SaveVehicle(entity, { state = VehicleState.OUT })
    TriggerClientEvent('vehiclekeys:client:SetOwner', source, vehicle.props.plate)

    local driverNetId = spawnDriver(source, entity)

    valetBusy[source] = nil
    return true, netId, driverNetId
end)

-- The client's driver has parked; server-created peds are never cleaned up by
-- the game, so remove it once it has had time to walk off.
RegisterNetEvent('npwd:garage:driverArrived', function()
    local source = source
    local driver = activeDrivers[source]
    activeDrivers[source] = nil
    if not driver then return end

    SetTimeout(DRIVER_CLEANUP_MS, function()
        if DoesEntityExist(driver) then DeleteEntity(driver) end
    end)
end)

AddEventHandler('playerDropped', function()
    local source = source
    local driver = activeDrivers[source]
    activeDrivers[source] = nil
    valetBusy[source] = nil
    if driver and DoesEntityExist(driver) then DeleteEntity(driver) end
end)

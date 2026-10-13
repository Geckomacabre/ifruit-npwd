-- -----------------------------------------------------------------------------
-- Home app, server side.
--
-- Reads qbx_properties' own `properties` table directly rather than going
-- through that resource: it registers lib.callbacks for its own client, not
-- exports another resource can call, so a query is the honest way in. Nothing
-- here writes to a property's core fields -- the only mutation is revoking a
-- key, which is the one thing a phone should be able to do from a distance.
-- -----------------------------------------------------------------------------

local function citizenId(source)
    local player = exports.qbx_core:GetPlayer(source)
    return player and player.PlayerData.citizenid
end

---qbx_properties keeps keyholders as a JSON array of citizenids -- it appends
---with `keyholders[#keyholders + 1] = cid` and checks with lib.table.contains --
---even though the column's DEFAULT is JSON_OBJECT(). An object keyed by
---citizenid is accepted too, in case an older fork of it is running.
---@param raw string?
---@return table decoded, boolean isArray
local function decodeKeyholders(raw)
    local decoded = raw and json.decode(raw)
    if type(decoded) ~= 'table' then return {}, true end

    -- An untouched row is `{}`, which decodes the same as an empty array.
    return decoded, next(decoded) == nil or decoded[1] ~= nil
end

---@param raw string?
---@return string[]
local function keyholderIds(raw)
    local decoded, isArray = decodeKeyholders(raw)
    local ids = {}

    if isArray then
        for _, cid in ipairs(decoded) do
            if type(cid) == 'string' then ids[#ids + 1] = cid end
        end
    else
        for cid in pairs(decoded) do
            if type(cid) == 'string' then ids[#ids + 1] = cid end
        end
    end

    return ids
end

---Properties owned by, or shared with, this player.
---@param source number
---@return table
local function loadProperties(source)
    local cid = citizenId(source)
    if not cid then return {} end

    -- JSON_CONTAINS matches the citizenid as an element of the keyholders array
    -- (how qbx_properties stores it); JSON_CONTAINS_PATH covers the object shape.
    local rows = MySQL.query.await([[
        SELECT id, property_name, coords, price, owner, keyholders, rent_interval
        FROM properties
        WHERE owner = ?
           OR JSON_CONTAINS(keyholders, JSON_QUOTE(?))
           OR JSON_CONTAINS_PATH(keyholders, 'one', ?)
        ORDER BY (owner = ?) DESC, property_name ASC
    ]], { cid, cid, '$."' .. cid .. '"', cid }) or {}

    local out = {}

    for _, row in ipairs(rows) do
        local coords = row.coords and json.decode(row.coords) or nil

        -- Stored either as an array of entry points or a single point.
        local point = coords
        if coords and coords[1] then point = coords[1] end

        local holders = {}
        for _, holderCid in ipairs(keyholderIds(row.keyholders)) do
            local name = MySQL.scalar.await(
                'SELECT CONCAT(JSON_VALUE(charinfo, "$.firstname"), " ", JSON_VALUE(charinfo, "$.lastname")) FROM players WHERE citizenid = ?',
                { holderCid }
            )
            holders[#holders + 1] = { citizenid = holderCid, name = name or holderCid }
        end

        out[#out + 1] = {
            id = row.id,
            name = row.property_name,
            price = row.price,
            rentInterval = row.rent_interval,
            owned = row.owner == cid,
            x = point and (point.x or point[1]) or nil,
            y = point and (point.y or point[2]) or nil,
            z = point and (point.z or point[3]) or nil,
            keyholders = holders,
        }
    end

    return out
end

lib.callback.register('npwd:home:getProperties', function(source)
    return loadProperties(source)
end)

lib.callback.register('npwd:home:revokeKey', function(source, propertyId, targetCid)
    local cid = citizenId(source)
    if not cid or not propertyId or not targetCid then return false end

    -- Only the owner can take a key back, and never their own.
    local owner = MySQL.scalar.await('SELECT owner FROM properties WHERE id = ?', { propertyId })
    if owner ~= cid or targetCid == cid then return false end

    local raw = MySQL.scalar.await('SELECT keyholders FROM properties WHERE id = ?', { propertyId })
    local keyholders, isArray = decodeKeyholders(raw)

    if isArray then
        local index
        for i, holder in ipairs(keyholders) do
            if holder == targetCid then index = i break end
        end
        if not index then return false end
        table.remove(keyholders, index)
    else
        if keyholders[targetCid] == nil then return false end
        keyholders[targetCid] = nil
    end

    MySQL.update.await('UPDATE properties SET keyholders = ? WHERE id = ?', {
        json.encode(keyholders),
        propertyId,
    })

    return true
end)

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

---Properties owned by, or shared with, this player.
---@param source number
---@return table
local function loadProperties(source)
    local cid = citizenId(source)
    if not cid then return {} end

    -- JSON_CONTAINS_PATH finds the citizenid as a KEY of the keyholders object,
    -- which is how qbx_properties stores shared access.
    local rows = MySQL.query.await([[
        SELECT id, property_name, coords, price, owner, keyholders, rent_interval
        FROM properties
        WHERE owner = ? OR JSON_CONTAINS_PATH(keyholders, 'one', ?)
        ORDER BY (owner = ?) DESC, property_name ASC
    ]], { cid, '$."' .. cid .. '"', cid }) or {}

    local out = {}

    for _, row in ipairs(rows) do
        local coords = row.coords and json.decode(row.coords) or nil
        local keyholders = row.keyholders and json.decode(row.keyholders) or {}

        -- Stored either as an array of entry points or a single point.
        local point = coords
        if coords and coords[1] then point = coords[1] end

        local holders = {}
        for holderCid in pairs(keyholders) do
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
    local keyholders = raw and json.decode(raw) or {}
    if keyholders[targetCid] == nil then return false end

    keyholders[targetCid] = nil
    MySQL.update.await('UPDATE properties SET keyholders = ? WHERE id = ?', {
        json.encode(keyholders),
        propertyId,
    })

    return true
end)

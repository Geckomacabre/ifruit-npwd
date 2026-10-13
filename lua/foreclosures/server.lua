-- -----------------------------------------------------------------------------
-- Maze Bank Foreclosures, server side. See config.lua for what a provider is.
--
-- The phone is a shop window: it lists, quotes and asks. Everything that matters is decided by the resource that owns the stock (ownership,
-- money, "one club per player", "already sold"), and checked again by it at the moment of purchase. Nothing from the NUI is trusted: a listing
-- is named by `kind:id` and both halves are checked against the providers here before anything is forwarded.
-- -----------------------------------------------------------------------------

local function bankOf(player)
    return player.PlayerData.money and player.PlayerData.money[ForeclosuresConfig.account] or 0
end

--- Calls an export of a provider resource, safely: a resource that is stopped or broken is "not available", never an error in the phone.
local function callExport(resource, fn, ...)
    if GetResourceState(resource) ~= 'started' then return false, ('%s is not running.'):format(resource) end

    local args = table.pack(...)
    local ok, a, b = pcall(function()
        local res = exports[resource]
        return res[fn](res, table.unpack(args, 1, args.n))
    end)

    if not ok then
        print(('[foreclosures] %s:%s failed: %s'):format(resource, fn, tostring(a)))
        return false, 'That is not available right now.'
    end

    return true, a, b
end

local function providerFor(kind)
    for _, p in ipairs(ForeclosuresConfig.providers) do
        if p.kind == kind then return p end
    end
end

--- 'nightclub:Some Club' -> 'nightclub', 'Some Club'. Nil unless it is a key this app could have produced.
local function splitKey(key)
    if type(key) ~= 'string' or #key > 120 then return nil end
    local kind, id = key:match('^(%a+):(.+)$')
    return kind, id
end

local function isApartment(row)
    local haystack = ((row.interior or '') .. ' ' .. (row.property_name or '')):lower()
    for _, word in ipairs(ForeclosuresConfig.apartmentWords) do
        if haystack:find(word, 1, true) then return true end
    end
    return false
end

--- Homes and apartments nobody owns, as listings.
local function propertyListings()
    local ok, rows = callExport(ForeclosuresConfig.properties.resource, 'ListAvailableProperties')
    if not ok or type(rows) ~= 'table' then return {} end

    local list = {}

    for _, row in ipairs(rows) do
        local coords = row.coords and json.decode(row.coords) or nil
        local point = coords and (coords[1] or coords) or nil

        list[#list + 1] = {
            key = 'property:' .. row.id,
            kind = 'property',
            id = row.id,
            name = row.property_name,
            category = isApartment(row) and 'apartment' or 'house',
            price = row.price,
            mode = row.rent_interval and 'rent' or 'buy',
            rentInterval = row.rent_interval,
            status = 'available',
            x = point and (point.x or point[1]) or nil,
            y = point and (point.y or point[2]) or nil,
            z = point and (point.z or point[3]) or nil,
        }
    end

    return list
end

lib.callback.register('npwd:foreclosures:market', function(source)
    local player = exports.qbx_core:GetPlayer(source)
    if not player then return nil end

    local listings, ownedNightclub = {}, nil

    for _, p in ipairs(ForeclosuresConfig.providers) do
        local ok, view = callExport(p.resource, 'ForeclosureListings', source)

        if ok and type(view) == 'table' then
            for _, l in ipairs(view.listings or {}) do
                l.key = ('%s:%s'):format(l.kind or p.kind, l.id)
                l.category = l.category or l.kind or p.kind
                listings[#listings + 1] = l
            end

            if p.kind == 'nightclub' then ownedNightclub = view.ownedId end
        end
    end

    for _, l in ipairs(propertyListings()) do listings[#listings + 1] = l end

    return {
        listings = listings,
        balance = bankOf(player),
        account = ForeclosuresConfig.account,
        ownedNightclub = ownedNightclub,
    }
end)

--- What can be chosen before buying (a nightclub's decor and dancers); nil when there is nothing to choose.
lib.callback.register('npwd:foreclosures:catalog', function(source, key)
    local kind, id = splitKey(key)
    local provider = kind and providerFor(kind)
    if not provider then return nil end

    local ok, catalog = callExport(provider.resource, 'ForeclosureCatalog', id)
    return ok and catalog or nil
end)

--- The price of a listing with the buyer's choices. Returns { quote = {...} } or { error = '...' }.
lib.callback.register('npwd:foreclosures:quote', function(source, key, choices)
    local kind, id = splitKey(key)
    if not kind then return { error = 'Unknown listing.' } end

    local provider = providerFor(kind)

    if provider then
        local ok, quote, why = callExport(provider.resource, 'ForeclosureQuote', id, type(choices) == 'table' and choices or {})
        if not ok then return { error = quote } end
        if not quote then return { error = why or 'Unknown listing.' } end
        return { quote = quote }
    end

    if kind == 'property' then
        for _, l in ipairs(propertyListings()) do
            if l.key == key then
                return { quote = { total = l.price, base = l.price, extras = 0, lines = {}, mode = l.mode, rentInterval = l.rentInterval } }
            end
        end
        return { error = 'That property is not for sale any more.' }
    end

    return { error = 'Unknown listing.' }
end)

lib.callback.register('npwd:foreclosures:buy', function(source, key, choices)
    local player = exports.qbx_core:GetPlayer(source)
    if not player then return { ok = false, message = 'Player not loaded.' } end

    local kind, id = splitKey(key)
    if not kind then return { ok = false, message = 'Unknown listing.' } end

    local provider = providerFor(kind)

    if provider then
        local ok, done, receipt = callExport(provider.resource, 'ForeclosurePurchase', source, id, type(choices) == 'table' and choices or {})
        if not ok then return { ok = false, message = done } end
        if not done then return { ok = false, message = receipt or 'That did not go through.' } end
        return { ok = true, message = ('You now own %s.'):format(type(receipt) == 'table' and receipt.label or 'it'), receipt = receipt, balance = bankOf(player) }
    end

    if kind == 'property' then
        local rentable
        for _, l in ipairs(propertyListings()) do
            if l.key == key then rentable = l.mode == 'rent' end
        end

        if rentable == nil then return { ok = false, message = 'That property is not for sale any more.' } end

        local ok, done, name = callExport(ForeclosuresConfig.properties.resource, rentable and 'RentPropertyRemote' or 'BuyPropertyRemote', source, tonumber(id))
        if not ok then return { ok = false, message = done } end
        if not done then return { ok = false, message = name or 'That did not go through.' } end

        return {
            ok = true,
            message = rentable and ('You are now renting %s.'):format(name) or ('You now own %s.'):format(name),
            balance = bankOf(player),
        }
    end

    return { ok = false, message = 'Unknown listing.' }
end)

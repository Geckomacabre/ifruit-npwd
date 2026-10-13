-- Maze Bank Foreclosures: the phone app that sells property (foreclosures.maze-bank.com in the game).
--
-- Every kind of property is a PROVIDER, a resource that knows its own stock and takes its own money. The app never touches ownership or
-- money itself: it asks a provider for listings, a price quote and the purchase, so what a provider refuses (not for sale any more, one
-- club per player, too little money) is shown to the player as it comes.
--
-- A provider resource exports four functions, all plain data in and out (no vectors):
--   ForeclosureListings(src)            -> { listings = { { kind, id, name, price, status, x, y, z, ... } }, ownedId, accountName }
--   ForeclosureCatalog(id)              -> what can be chosen for this listing before buying, with prices (or nil)
--   ForeclosureQuote(id, choices)       -> { total, base, extras, lines = { { label, price } } }  or nil, reason
--   ForeclosurePurchase(src, id, choices) -> true, receipt  or false, reason
-- `status` is 'available' | 'sold' | 'yours'. um_nightclubs is the first; add another resource here and it appears in the app.
ForeclosuresConfig = {
    providers = {
        { kind = 'nightclub', resource = 'um_nightclubs' },
    },

    -- Homes and apartments come from qbx_properties (its `properties` table); it exports ListAvailableProperties / BuyPropertyRemote /
    -- RentPropertyRemote for this (a local patch: see the comment in qbx_properties/server/property.lua).
    properties = { resource = 'qbx_properties' },

    -- qbx_properties stores an apartment's interior by its IPL/shell name; these words in the name mark a property as an apartment.
    apartmentWords = { 'apt', 'apart', 'condo', 'flat' },

    -- The account the phone shows and the properties are paid from.
    account = 'bank',
}

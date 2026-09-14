-- Companies listed in the Services app. Same set (and artwork) lb-phone had.
ServicesConfig = {
    companies = {
        {
            job = 'police',
            name = 'Police',
            icon = 'https://cdn-icons-png.flaticon.com/512/7211/7211100.png',
            location = { name = 'Mission Row', x = 428.9, y = -984.5 },
        },
        {
            job = 'ambulance',
            name = 'Ambulance',
            icon = 'https://cdn-icons-png.flaticon.com/128/1032/1032989.png',
            location = { name = 'Pillbox', x = 304.2, y = -587.0 },
        },
        {
            job = 'mechanic',
            name = 'Mechanic',
            icon = 'https://cdn-icons-png.flaticon.com/128/10281/10281554.png',
            location = { name = 'LS Customs', x = -336.6, y = -134.3 },
        },
        {
            job = 'taxi',
            name = 'Taxi',
            icon = 'https://cdn-icons-png.flaticon.com/128/433/433449.png',
            location = { name = 'Taxi HQ', x = 984.2, y = -219.0 },
        },
    },

    messageMaxLength = 500,
    -- A boss can only hire someone standing this close, so nobody gets hired
    -- across the map by typing a random server ID.
    hireDistance = 10.0,
}

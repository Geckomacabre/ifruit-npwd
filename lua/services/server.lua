-- -----------------------------------------------------------------------------
-- Services app, server side: company list, customer <-> company threads, duty,
-- and boss management. Every action re-checks the caller's job and access here;
-- nothing the phone sends is trusted on its own.
-- -----------------------------------------------------------------------------

local companies = {}
for _, company in ipairs(ServicesConfig.companies) do
    companies[company.job] = company
end

MySQL.ready(function()
    MySQL.query.await([[
        CREATE TABLE IF NOT EXISTS npwd_services_channels (
            id INT NOT NULL AUTO_INCREMENT,
            company VARCHAR(50) NOT NULL,
            contact_citizenid VARCHAR(50) NOT NULL,
            contact_name VARCHAR(100) NOT NULL,
            contact_number VARCHAR(20) DEFAULT NULL,
            last_message VARCHAR(100) DEFAULT NULL,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY company_contact (company, contact_citizenid),
            INDEX company (company)
        )
    ]])
    MySQL.query.await([[
        CREATE TABLE IF NOT EXISTS npwd_services_messages (
            id INT NOT NULL AUTO_INCREMENT,
            channel_id INT NOT NULL,
            sender_citizenid VARCHAR(50) NOT NULL,
            sender_name VARCHAR(100) NOT NULL,
            from_company TINYINT(1) NOT NULL DEFAULT 0,
            message VARCHAR(500) NOT NULL DEFAULT '',
            x FLOAT DEFAULT NULL,
            y FLOAT DEFAULT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            INDEX channel_id (channel_id)
        )
    ]])
end)

---@param source number
local function playerInfo(source)
    local player = exports.qbx_core:GetPlayer(source)
    if not player then return end

    local data = player.PlayerData
    return {
        citizenid = data.citizenid,
        name = ('%s %s'):format(data.charinfo.firstname, data.charinfo.lastname),
        phone = data.charinfo.phone and tostring(data.charinfo.phone) or nil,
        job = data.job,
    }
end

---The listed company this player works for, if any.
local function employerOf(info)
    return info and companies[info.job.name] and info.job.name or nil
end

---The listed company this player is a boss of, if any.
local function bossCompanyOf(info)
    local job = employerOf(info)
    return job and info.job.isboss and job or nil
end

local function getChannel(id)
    return id and MySQL.single.await('SELECT * FROM npwd_services_channels WHERE id = ?', { id })
end

local function canAccessChannel(info, channel)
    return channel ~= nil and (channel.contact_citizenid == info.citizenid or channel.company == employerOf(info))
end

local function companyName(job)
    return companies[job] and companies[job].name or job
end

local function formatMessage(row, viewerCitizenid)
    return {
        id = row.id,
        channelId = row.channel_id,
        senderName = row.sender_name,
        fromCompany = row.from_company == 1 or row.from_company == true,
        mine = row.sender_citizenid == viewerCitizenid,
        message = row.message,
        x = row.x,
        y = row.y,
        createdAt = row.createdAt,
    }
end

lib.callback.register('npwd:services:getCompanies', function(source)
    local info = playerInfo(source)
    local list = {}

    for _, company in ipairs(ServicesConfig.companies) do
        local onDuty = exports.qbx_core:GetDutyCountJob(company.job) or 0
        list[#list + 1] = {
            job = company.job,
            name = company.name,
            icon = company.icon,
            location = company.location,
            open = onDuty > 0,
        }
    end

    local job = employerOf(info)

    return {
        companies = list,
        employment = job and {
            job = job,
            name = companyName(job),
            grade = info.job.grade and info.job.grade.name or '',
            isBoss = info.job.isboss == true,
            onDuty = info.job.onduty == true,
        } or nil,
    }
end)

lib.callback.register('npwd:services:getThreads', function(source)
    local info = playerInfo(source)
    if not info then return {} end

    local rows = MySQL.query.await([[
        SELECT id, company, contact_citizenid, contact_name, last_message,
               CAST(UNIX_TIMESTAMP(updated_at) AS UNSIGNED) * 1000 AS updatedAt
        FROM npwd_services_channels
        WHERE contact_citizenid = ? OR company = ?
        ORDER BY updated_at DESC
        LIMIT 50
    ]], { info.citizenid, employerOf(info) or '' })

    local threads = {}

    for _, row in ipairs(rows) do
        local asContact = row.contact_citizenid == info.citizenid
        threads[#threads + 1] = {
            id = row.id,
            company = row.company,
            title = asContact and companyName(row.company) or row.contact_name,
            icon = companies[row.company] and companies[row.company].icon or nil,
            asCompany = not asContact,
            lastMessage = row.last_message,
            updatedAt = row.updatedAt,
        }
    end

    return threads
end)

---@param job string
lib.callback.register('npwd:services:openThread', function(source, job)
    local info = playerInfo(source)
    if not info or not companies[job] then return end

    local id = MySQL.scalar.await(
        'SELECT id FROM npwd_services_channels WHERE company = ? AND contact_citizenid = ?',
        { job, info.citizenid }
    )
    if id then return id end

    return MySQL.insert.await(
        'INSERT INTO npwd_services_channels (company, contact_citizenid, contact_name, contact_number) VALUES (?, ?, ?, ?)',
        { job, info.citizenid, info.name, info.phone }
    )
end)

---@param channelId number
lib.callback.register('npwd:services:getThread', function(source, channelId)
    local info = playerInfo(source)
    local channel = getChannel(tonumber(channelId))
    if not info or not canAccessChannel(info, channel) then return end

    local asContact = channel.contact_citizenid == info.citizenid
    local rows = MySQL.query.await([[
        SELECT id, channel_id, sender_citizenid, sender_name, from_company, message, x, y,
               CAST(UNIX_TIMESTAMP(created_at) AS UNSIGNED) * 1000 AS createdAt
        FROM npwd_services_messages
        WHERE channel_id = ?
        ORDER BY id DESC
        LIMIT 100
    ]], { channel.id })

    local messages = {}
    for i = #rows, 1, -1 do
        messages[#messages + 1] = formatMessage(rows[i], info.citizenid)
    end

    return {
        id = channel.id,
        company = channel.company,
        title = asContact and companyName(channel.company) or channel.contact_name,
        asCompany = not asContact,
        contactNumber = not asContact and channel.contact_number or nil,
        messages = messages,
    }
end)

local lastSentAt = {}

---@param channelId number
---@param text string
---@param shareLocation boolean
lib.callback.register('npwd:services:sendMessage', function(source, channelId, text, shareLocation)
    local now = GetGameTimer()
    if lastSentAt[source] and now - lastSentAt[source] < 750 then return false, 'slow_down' end
    lastSentAt[source] = now

    local info = playerInfo(source)
    local channel = getChannel(tonumber(channelId))
    if not info or not canAccessChannel(info, channel) then return false, 'no_access' end

    text = type(text) == 'string' and (text:gsub('^%s+', ''):gsub('%s+$', '')) or ''
    if #text > ServicesConfig.messageMaxLength then
        text = text:sub(1, ServicesConfig.messageMaxLength)
    end

    local x, y
    if shareLocation then
        local coords = GetEntityCoords(GetPlayerPed(source))
        x, y = coords.x, coords.y
    end

    if text == '' and not x then return false, 'empty' end

    local fromCompany = channel.contact_citizenid ~= info.citizenid
    local id = MySQL.insert.await(
        'INSERT INTO npwd_services_messages (channel_id, sender_citizenid, sender_name, from_company, message, x, y) VALUES (?, ?, ?, ?, ?, ?, ?)',
        { channel.id, info.citizenid, info.name, fromCompany, text, x, y }
    )

    local preview = text ~= '' and text or 'Shared a location'
    MySQL.update.await(
        'UPDATE npwd_services_channels SET last_message = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        { preview:sub(1, 100), channel.id }
    )

    local message = {
        id = id,
        channelId = channel.id,
        senderName = info.name,
        fromCompany = fromCompany,
        message = text,
        x = x,
        y = y,
        createdAt = os.time() * 1000,
    }

    -- A company reply goes to the customer; a customer message goes to every
    -- employee of that company who is on duty.
    local recipients = {}
    local name = companyName(channel.company)

    if fromCompany then
        local contact = exports.qbx_core:GetPlayerByCitizenId(channel.contact_citizenid)
        if contact then recipients[contact.PlayerData.source] = name end
    else
        local _, employees = exports.qbx_core:GetDutyCountJob(channel.company)
        for _, employeeSource in ipairs(employees or {}) do
            recipients[employeeSource] = ('%s · %s'):format(name, info.name)
        end
    end

    recipients[source] = nil

    for target, title in pairs(recipients) do
        TriggerClientEvent('npwd:services:newMessage', target, message, title, preview)
    end

    message.mine = true
    return true, message
end)

---@param onDuty boolean
lib.callback.register('npwd:services:setDuty', function(source, onDuty)
    local info = playerInfo(source)
    if not employerOf(info) then return false end

    exports.qbx_core:SetJobDuty(source, onDuty == true)
    return true
end)

lib.callback.register('npwd:services:getManagement', function(source)
    local info = playerInfo(source)
    local job = bossCompanyOf(info)
    if not job then return end

    local jobDef = exports.qbx_core:GetJob(job)
    local grades = {}

    for level, grade in pairs(jobDef and jobDef.grades or {}) do
        grades[#grades + 1] = { level = tonumber(level), name = grade.name, isBoss = grade.isboss == true }
    end
    table.sort(grades, function(a, b) return a.level < b.level end)

    local employees = {}

    for _, member in ipairs(exports.qbx_core:GetGroupMembers(job, 'job') or {}) do
        local online = exports.qbx_core:GetPlayerByCitizenId(member.citizenid)
        local player = online or exports.qbx_core:GetOfflinePlayer(member.citizenid)
        local charinfo = player and player.PlayerData.charinfo

        employees[#employees + 1] = {
            citizenid = member.citizenid,
            name = charinfo and ('%s %s'):format(charinfo.firstname, charinfo.lastname) or member.citizenid,
            grade = member.grade,
            online = online ~= nil,
            onDuty = online ~= nil and online.PlayerData.job.name == job and online.PlayerData.job.onduty == true,
            isSelf = member.citizenid == info.citizenid,
        }
    end
    table.sort(employees, function(a, b) return a.grade > b.grade end)

    return {
        balance = exports['Renewed-Banking']:getAccountMoney(job) or 0,
        grades = grades,
        employees = employees,
    }
end)

---@param direction 'deposit' | 'withdraw'
---@param amount number
lib.callback.register('npwd:services:moveMoney', function(source, direction, amount)
    local job = bossCompanyOf(playerInfo(source))
    if not job then return false, 'not_boss' end

    amount = math.floor(tonumber(amount) or 0)
    if amount <= 0 then return false, 'invalid_amount' end

    local bank = exports['Renewed-Banking']

    if direction == 'deposit' then
        if (exports.qbx_core:GetMoney(source, 'bank') or 0) < amount
            or not exports.qbx_core:RemoveMoney(source, 'bank', amount, 'npwd-services-deposit') then
            return false, 'no_money'
        end

        if not bank:addAccountMoney(job, amount) then
            exports.qbx_core:AddMoney(source, 'bank', amount, 'npwd-services-deposit-refund')
            return false, 'error'
        end
    elseif direction == 'withdraw' then
        if not bank:removeAccountMoney(job, amount) then return false, 'no_company_money' end
        exports.qbx_core:AddMoney(source, 'bank', amount, 'npwd-services-withdraw')
    else
        return false, 'error'
    end

    return true, bank:getAccountMoney(job) or 0
end)

---@param citizenid string
lib.callback.register('npwd:services:fire', function(source, citizenid)
    local info = playerInfo(source)
    local job = bossCompanyOf(info)
    if not job or type(citizenid) ~= 'string' or citizenid == info.citizenid then return false end

    return exports.qbx_core:RemovePlayerFromJob(citizenid, job) == true
end)

---@param citizenid string
---@param grade number
lib.callback.register('npwd:services:setGrade', function(source, citizenid, grade)
    local info = playerInfo(source)
    local job = bossCompanyOf(info)
    grade = tonumber(grade)
    if not job or type(citizenid) ~= 'string' or citizenid == info.citizenid or not grade then return false end

    local jobDef = exports.qbx_core:GetJob(job)
    if not jobDef or not jobDef.grades[grade] then return false end

    return exports.qbx_core:AddPlayerToJob(citizenid, job, grade) == true
end)

---@param targetId number server ID of the player to hire
lib.callback.register('npwd:services:hire', function(source, targetId)
    local job = bossCompanyOf(playerInfo(source))
    targetId = tonumber(targetId)
    if not job or not targetId or targetId == source then return false, 'invalid' end

    local target = exports.qbx_core:GetPlayer(targetId)
    if not target then return false, 'not_found' end

    local distance = #(GetEntityCoords(GetPlayerPed(source)) - GetEntityCoords(GetPlayerPed(targetId)))
    if distance > ServicesConfig.hireDistance then return false, 'too_far' end

    if not exports.qbx_core:AddPlayerToJob(target.PlayerData.citizenid, job, 0) then return false, 'error' end
    exports.qbx_core:SetPlayerPrimaryJob(target.PlayerData.citizenid, job)

    return true
end)

AddEventHandler('playerDropped', function()
    lastSentAt[source] = nil
end)

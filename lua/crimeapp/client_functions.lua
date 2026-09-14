-- Pushes a live update into the app's UI while it is open. lb-phone had its own
-- per-app message channel; NPWD's equivalent is sendNPWDMessage(app, method, data).
---@param action string
---@param data any
function SendAppMessage(action, data)
    exports.npwd:sendNPWDMessage('CRIME', action, data)
end

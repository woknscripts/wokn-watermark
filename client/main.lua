local isEditing = false
local KVP_KEY = 'wokn_watermark_v2'
local watermarkData = {
    x = 88.0,
    y = 1.5,
    width = 210,
    height = 45
}

local function loadSavedData()
    local saved = GetResourceKvpString(KVP_KEY)
    if saved then
        local decoded = json.decode(saved)
        if decoded then
            watermarkData = decoded
        end
    end
end

local function saveData()
    SetResourceKvp(KVP_KEY, json.encode(watermarkData))
end

local function openEditor()
    if isEditing then return end
    isEditing = true
    SetNuiFocus(true, true)
    SendNUIMessage({
        type = 'openEditor',
        data = watermarkData
    })
end

local function closeEditor(save)
    isEditing = false
    SetNuiFocus(false, false)
    if save then
        saveData()
    end
    SendNUIMessage({ type = 'closeEditor' })
end

RegisterCommand('watermark', function()
    openEditor()
end, false)

RegisterNUICallback('updatePosition', function(data, cb)
    watermarkData.x = data.x
    watermarkData.y = data.y
    watermarkData.width = data.width
    watermarkData.height = data.height
    cb({})
end)

RegisterNUICallback('saveAndClose', function(data, cb)
    watermarkData.x = data.x
    watermarkData.y = data.y
    watermarkData.width = data.width
    watermarkData.height = data.height
    closeEditor(true)
    cb({})
end)

RegisterNUICallback('cancelEditor', function(_, cb)
    closeEditor(false)
    cb({})
end)

AddEventHandler('onClientResourceStart', function(resourceName)
    if resourceName ~= GetCurrentResourceName() then return end
    loadSavedData()
    SendNUIMessage({ type = 'init', data = watermarkData })
end)

exports('getWatermarkData', function()
    return watermarkData
end)

ContinuumLoot = LibStub("AceAddon-3.0"):NewAddon("ContinuumLoot", "AceConsole-3.0")

function ContinuumLoot:OnInitialize()
  ContinuumLoot:RegisterChatCommand('cloot', 'HandleChatCommand')
end

function ContinuumLoot:HandleChatCommand(input)
  local args = {}
  for s in string.gmatch(input, "%S+") do
    args[#args+1] = s
  end

  local playerName, _ = UnitName('player')

  if args[1] == 'attendance' then
    local exportString = ContinuumLoot:CreateExportString()
    if (exportString ~= '') then
      ContinuumLoot:DisplayExportString(exportString)
    end
    return
  end

  ContinuumLoot:Print('Continuum Loot Help:')
  ContinuumLoot:Print('attendance -- Snapshots Attendance')

end

function ContinuumLoot:DisplayExportString(exportString)
  CLootFrame:Show()
  CLootFrameScroll:Show()
  CLootFrameScrollText:Show()
  CLootFrameScrollText:SetText(exportString)
  CLootFrameScrollText:HighlightText()
  CLootFrameButton:SetScript('OnClick', function(self)
    CLootFrame:Hide()
    end
  );
end

function ContinuumLoot:CreateExportString()
  local name, rank, subgroup, level, class, zone, online, isDead, role, isML, _ = GetRaidRosterInfo(1);
  if (name == nil) then
    ContinuumLoot:Print('ERROR: Not in Group')
    return ''
  end
  local exportString = '' .. name

  for groupindex = 2,40 do
    name, rank, subgroup, level, class, zone, online, isDead, role, isML, _ = GetRaidRosterInfo(groupindex);
    if (name ~= nil) then
      exportString = exportString .. ',' .. name
    end
  end
  return exportString
end
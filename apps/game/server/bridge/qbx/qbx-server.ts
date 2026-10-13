import { config } from '@npwd/config/server';
import PlayerService from '../../players/player.service';
import { mainLogger } from '../../sv_logger';
import { Strategy } from '../framework-strategy';

export class QBXFramework implements Strategy {
  constructor() {
    mainLogger.info('Loading QBX bridge....');

    config.general.useResourceIntegration = true;
    config.database.identifierColumn = 'citizenid';
    config.database.phoneNumberColumn = 'phone_number';
    config.database.playerTable = 'players';
    config.database.identifierType = 'license';
  }

  init(): void {
    on('QBCore:Server:PlayerLoaded', async (qbPlayer: any) => {
      const playerIdent = qbPlayer.PlayerData.citizenid;
      const phoneNumber = qbPlayer.PlayerData.charinfo.phone;
      const charInfo = qbPlayer.PlayerData.charinfo;
      const playerSrc = qbPlayer.PlayerData.source;

      await PlayerService.handleNewPlayerEvent({
        identifier: playerIdent,
        source: playerSrc,
        phoneNumber: phoneNumber.toString(),
        firstname: charInfo.firstname,
        lastname: charInfo.lastname,
      });
    });

    on('QBCore:Server:OnPlayerUnload', async () => {
      await PlayerService.handleUnloadPlayerEvent(global.source);
    });

    mainLogger.info('QBX bridge initialized');
  }

  onStart(): void {
    on('onServerResourceStart', async (resource: string) => {
      if (resource === GetCurrentResourceName()) {
        // This server runs qbx_core, not qb-core -- exports['qb-core'] does
        // not exist here and threw every time npwd restarted, which is why a
        // player who did not relog kept getting a null Player (and the
        // FETCH_CREDENTIALS crash) until they fully reconnected. qbx_core
        // kept the same GetQBPlayers() name, just flat on the export table
        // instead of behind .GetCoreObject().Functions.
        const onlinePlayers = global.exports['qbx_core'].GetQBPlayers();
        for (const player of Object.values(onlinePlayers)) {
          await PlayerService.handleNewPlayerEvent({
            source: player.PlayerData.source,
            identifier: player.PlayerData.citizenid,
            phoneNumber: player.PlayerData.charinfo.phone.toString(),
            firstname: player.PlayerData.charinfo.firstname,
            lastname: player.PlayerData.charinfo.lastname,
          });
        }
      }
    });
  }
}

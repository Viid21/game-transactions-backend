import { Injectable } from '@nestjs/common';

@Injectable()
export class PlayerService {
    getPlayers() {
        return [
            {
                id: 'player_001',
                name: 'Player One',
                steamId: 'STEAM_0:1:12345678'
            }
        ];
    }
}
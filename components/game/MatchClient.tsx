'use client';

// MatchClient — boots a boardgame.io match when a match starts.
//   Single-player today: Local() master in the browser + a headless AI bot on
//   seat '1'. The human is seat '0'.
//   PLUG-IN POINT (online PvP): swap `Local()` for `SocketIO({ server })` and
//   remove the bot — the SkyforgeGame definition is identical for both.
import { useEffect, useMemo } from 'react';
import { Client } from 'boardgame.io/react';
import { Client as RawClient } from 'boardgame.io/client';
import { Local } from 'boardgame.io/multiplayer';
import type { Prism } from '@/lib/game/types';
import { SkyforgeGame } from '@/lib/game/game';
import BgioBoard from './BgioBoard';
import { attachBot } from './bot';

export interface MatchClientProps {
  matchId: string;
  mode: string;
  myName: string;
  myAvatar: string;
  myDeckName: string;
  oppName: string;
  oppAvatar: string;
  myCards: string[];
  myPrisms: Prism[];
  oppCards: string[];
  oppPrisms: Prism[];
}

export default function MatchClient(props: MatchClientProps) {
  const { Comp, bot } = useMemo(() => {
    const local = Local();
    const Comp = Client({
      game: SkyforgeGame,
      board: BgioBoard,
      multiplayer: local,
      numPlayers: 2,
      debug: false,
    });
    const bot = RawClient({
      game: SkyforgeGame,
      multiplayer: local,
      matchID: props.matchId,
      playerID: '1',
      numPlayers: 2,
    });
    return { Comp, bot };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.matchId]);

  useEffect(() => {
    bot.start();
    const cancel = attachBot(bot, '1', props.oppCards, props.oppPrisms);
    return () => {
      cancel();
      bot.stop();
    };
  }, [bot, props.oppCards, props.oppPrisms]);

  // Extra props after playerID/matchID flow straight through to BgioBoard.
  return (
    <Comp
      playerID="0"
      matchID={props.matchId}
      myName={props.myName}
      myAvatar={props.myAvatar}
      oppName={props.oppName}
      oppAvatar={props.oppAvatar}
      myCards={props.myCards}
      myPrisms={props.myPrisms}
      mode={props.mode}
      myDeckName={props.myDeckName}
    />
  );
}

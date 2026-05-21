import { useRules } from '@/composables/useRules';
import { useTurnsStore } from '@/stores/turns';
import { generateId } from '@/utilities/id';
import { assertActivePinia } from './assertActivePinia';

/* ========================================================================== */

type AddTurnsInput = Partial<TurnInput> & { tilesPlayed: 0 | 1 };
type PlayedTurnInput = Omit<PlayedTurn, 'id' | 'playerId' | 'roundId' | 'score'>;

/* ========================================================================== */

const defaultPlayedTurnInput: PlayedTurnInput = {
	bonusBridge: false,
	bonusDouble: false,
	bonusHexagon: false,
	triple: false,
	tilesDrawn: 0,
	tilesPlayed: 1,
	tileValue: 6
};

/* ========================================================================== */

function createPlayedTurn(playerId: Id, input?: Partial<PlayedTurnInput>): PlayedTurn {
	const mergedInput: PlayedTurnInput = {
		...defaultPlayedTurnInput,
		...input
	};
	const score = useRules().calculateTurnScore(mergedInput);

	return {
		...mergedInput,
		id: generateId(),
		playerId,
		score
	} satisfies PlayedTurn;
}

function createSkippedTurn(playerId: Id, tilesDrawn: number = 3): SkippedTurn {
	const input: TurnInput = { tilesDrawn, tilesPlayed: 0, tileValue: undefined };
	const score = useRules().calculateTurnScore(input);

	return {
		...input,
		id: generateId(),
		playerId,
		score
	} satisfies SkippedTurn;
}

function addNewTurnsToStore(playerIds: Id[], input: AddTurnsInput, count?: number): Turn[] {
	assertActivePinia('addNewTurnsToStore');

	const turnStore = useTurnsStore();

	const ubound = count ?? playerIds.length;
	const turns: Turn[] = [];

	for (let i = 0; i < ubound; i++) {
		const playerIndex = i % playerIds.length;
		const turn = input.tilesPlayed === 0
			? createSkippedTurn(playerIds[playerIndex], input.tilesDrawn)
			: createPlayedTurn(playerIds[playerIndex], input);

		turnStore.addTurn(turn);
		turns.push(turn);
	}

	return turns;
}

/* ========================================================================== */

export {
	addNewTurnsToStore,
	createPlayedTurn,
	createSkippedTurn
};

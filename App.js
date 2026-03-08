import { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Animated, Dimensions
} from 'react-native';

const { width: SW, height: SH } = Dimensions.get('window');

const MAX_PLAYERS = 7;
const ROUNDS_OPTIONS = [1, 2, 3, 5, 7, 10];

const PLAYER_COLORS = ['#00F5FF','#FF006E','#FFBE0B','#FB5607','#8338EC','#3A86FF','#06D6A0'];
const PLAYER_EMOJIS = ['🎮','🎯','⚡','🔥','💎','🌙','⭐'];

function generateTargetTime() {
  return Math.floor(Math.random() * 9) + 2;
}

// ─── HOME ────────────────────────────────────────────────────────────────────

function HomeScreen({ onPlay }) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.06, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.screen}>
        <View style={s.logoBlock}>
          <Text style={s.logoIcon}>⏱</Text>
        </View>
        <Text style={s.title}>PERFECT{'\n'}<Text style={s.titleAccent}>TIME</Text></Text>
        <Text style={s.subtitle}>Maîtrisez le temps invisible</Text>
        <Animated.View style={{ transform: [{ scale: pulse }], marginTop: 32 }}>
          <TouchableOpacity style={s.btnMain} onPress={onPlay} activeOpacity={0.8}>
            <Text style={s.btnMainText}>JOUER</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

// ─── RÉGLAGES ────────────────────────────────────────────────────────────────

function PlayerSelectionScreen({ onStart }) {
  const [count, setCount] = useState(1);
  const [rounds, setRounds] = useState(1);

  return (
    <SafeAreaView style={s.safeArea}>
      <ScrollView contentContainerStyle={s.screen}>
        <Text style={s.screenTitle}>RÉGLAGES</Text>

        {/* Joueurs */}
        <View style={s.setupSection}>
          <Text style={s.setupLabel}>JOUEURS</Text>
          <View style={s.countRing}>
            <Text style={s.countNum}>{count}</Text>
          </View>
          <View style={s.avatarRow}>
            {[...Array(count)].map((_, i) => (
              <View key={i} style={[s.avatarChip, { borderColor: PLAYER_COLORS[i], backgroundColor: PLAYER_COLORS[i] + '33' }]}>
                <Text style={s.avatarEmoji}>{PLAYER_EMOJIS[i]}</Text>
              </View>
            ))}
          </View>
          <View style={s.stepper}>
            <TouchableOpacity style={s.stepBtn} onPress={() => setCount(Math.max(1, count - 1))}>
              <Text style={s.stepBtnText}>−</Text>
            </TouchableOpacity>
            <View style={s.stepTrack}>
              {[...Array(MAX_PLAYERS)].map((_, i) => (
                <View key={i} style={[s.stepDot, i < count && { backgroundColor: PLAYER_COLORS[i] }]} />
              ))}
            </View>
            <TouchableOpacity style={s.stepBtn} onPress={() => setCount(Math.min(MAX_PLAYERS, count + 1))}>
              <Text style={s.stepBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Manches */}
        <View style={s.setupSection}>
          <Text style={s.setupLabel}>MANCHES</Text>
          <View style={s.roundsGrid}>
            {ROUNDS_OPTIONS.map(r => (
              <TouchableOpacity
                key={r}
                style={[s.roundsBtn, rounds === r && s.roundsBtnActive]}
                onPress={() => setRounds(r)}
                activeOpacity={0.7}
              >
                <Text style={[s.roundsBtnText, rounds === r && s.roundsBtnTextActive]}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={[s.btnMain, { marginTop: 16 }]} onPress={() => onStart(count, rounds)} activeOpacity={0.8}>
          <Text style={s.btnMainText}>DÉMARRER</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── JEU ─────────────────────────────────────────────────────────────────────

function GameScreen({ currentPlayer, round, totalRounds, targetTime, phase, onStartTimer, onTap }) {
  const tapScale = useRef(new Animated.Value(1)).current;

  const handleTap = () => {
    Animated.sequence([
      Animated.timing(tapScale, { toValue: 0.92, duration: 80, useNativeDriver: true }),
      Animated.timing(tapScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
    onTap();
  };

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.screen}>
        {/* Header */}
        <View style={s.gameHeader}>
          <View style={s.roundBadge}>
            <Text style={s.roundBadgeText}>Manche {round}/{totalRounds}</Text>
          </View>
          <View style={[s.playerTurn, { borderColor: PLAYER_COLORS[currentPlayer] + '88', backgroundColor: PLAYER_COLORS[currentPlayer] + '22' }]}>
            <Text style={[s.playerTurnText, { color: PLAYER_COLORS[currentPlayer] }]}>
              {PLAYER_EMOJIS[currentPlayer]} Joueur {currentPlayer + 1}
            </Text>
          </View>
        </View>

        {/* Cible */}
        <View style={s.targetBox}>
          <Text style={s.targetLabel}>TEMPS CIBLE</Text>
          <Text style={s.targetValue}>{targetTime}<Text style={s.targetUnit}>s</Text></Text>
        </View>

        {/* Phase : attente */}
        {phase === 'waiting' && (
          <TouchableOpacity style={s.btnLancer} onPress={onStartTimer} activeOpacity={0.85}>
            <Text style={s.btnLancerText}>▶ LANCER</Text>
          </TouchableOpacity>
        )}

        {/* Phase : chrono en cours */}
        {phase === 'running' && (
          <Animated.View style={{ transform: [{ scale: tapScale }] }}>
            <TouchableOpacity style={s.btnTap} onPress={handleTap} activeOpacity={1}>
              <Text style={s.btnTapText}>TAP !</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Phase : tap enregistré */}
        {phase === 'done' && (
          <View style={s.tapDone}>
            <View style={s.checkmark}>
              <Text style={s.checkmarkText}>✓</Text>
            </View>
            <Text style={s.tapDoneText}>Temps enregistré !</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

// ─── RÉSULTAT DE MANCHE ───────────────────────────────────────────────────────

function RoundResultScreen({ targetTime, results, onNext, isLastRound, scores }) {
  const sorted = [...results].sort((a, b) => a.diff - b.diff);
  const winnerId = sorted[0].player;
  const medals = ['🥇','🥈','🥉'];

  return (
    <SafeAreaView style={s.safeArea}>
      <ScrollView contentContainerStyle={s.screen}>
        <Text style={s.targetMini}>Cible : <Text style={{ color: 'white' }}>{targetTime}s</Text></Text>
        <View style={[s.winnerBadge, { borderColor: PLAYER_COLORS[winnerId], backgroundColor: PLAYER_COLORS[winnerId] + '22' }]}>
          <Text style={[s.winnerBadgeText, { color: PLAYER_COLORS[winnerId] }]}>
            {PLAYER_EMOJIS[winnerId]} Joueur {winnerId + 1} gagne !
          </Text>
        </View>

        <View style={s.resultList}>
          {sorted.map((r, i) => (
            <View key={r.player} style={[s.resultRow, i === 0 && { borderColor: PLAYER_COLORS[r.player] + 'aa', backgroundColor: PLAYER_COLORS[r.player] + '11' }]}>
              <Text style={s.resultRank}>{medals[i] || `#${i + 1}`}</Text>
              <Text style={[s.resultPlayer, { color: PLAYER_COLORS[r.player] }]}>{PLAYER_EMOJIS[r.player]} J{r.player + 1}</Text>
              <Text style={s.resultTime}>{(r.tapped / 1000).toFixed(2)}s</Text>
              <Text style={s.resultDiff}>Δ {r.diff.toFixed(2)}s</Text>
              <Text style={s.resultPts}>{scores[r.player]} pt{scores[r.player] > 1 ? 's' : ''}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={s.btnMain} onPress={onNext} activeOpacity={0.8}>
          <Text style={s.btnMainText}>{isLastRound ? 'RÉSULTATS FINAUX' : 'MANCHE SUIVANTE'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── CLASSEMENT FINAL ─────────────────────────────────────────────────────────

function FinalScreen({ scores, playerCount, onRestart }) {
  const ranked = [...Array(playerCount)]
    .map((_, i) => ({ player: i, score: scores[i] }))
    .sort((a, b) => b.score - a.score);

  const podiumHeights = [110, 75, 55];

  return (
    <SafeAreaView style={s.safeArea}>
      <ScrollView contentContainerStyle={s.screen}>
        <Text style={s.screenTitle}>CLASSEMENT</Text>

        <View style={s.podium}>
          {ranked.slice(0, Math.min(3, playerCount)).map((r, i) => (
            <View key={r.player} style={s.podiumBlock}>
              <Text style={s.podiumEmoji}>{PLAYER_EMOJIS[r.player]}</Text>
              <Text style={[s.podiumName, { color: PLAYER_COLORS[r.player] }]}>J{r.player + 1}</Text>
              <Text style={s.podiumScore}>{r.score}<Text style={s.podiumPts}> pts</Text></Text>
              <View style={[s.podiumBar, { height: podiumHeights[i] || 40, backgroundColor: PLAYER_COLORS[r.player] }]} />
            </View>
          ))}
        </View>

        {ranked.length > 3 && (
          <View style={s.otherRanks}>
            {ranked.slice(3).map((r, i) => (
              <View key={r.player} style={[s.otherRow, { borderLeftColor: PLAYER_COLORS[r.player] }]}>
                <Text style={s.otherRank}>#{i + 4}</Text>
                <Text style={s.otherName}>{PLAYER_EMOJIS[r.player]} Joueur {r.player + 1}</Text>
                <Text style={s.otherScore}>{r.score} pts</Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity style={[s.btnMain, { marginTop: 16 }]} onPress={onRestart} activeOpacity={0.8}>
          <Text style={s.btnMainText}>REJOUER</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── APP PRINCIPALE ───────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState('home');
  const [playerCount, setPlayerCount] = useState(1);
  const [roundsPerGame, setRoundsPerGame] = useState(1);
  const [round, setRound] = useState(1);
  const [scores, setScores] = useState([]);
  const [targetTime, setTargetTime] = useState(5);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [phase, setPhase] = useState('waiting');
  const [roundResults, setRoundResults] = useState([]);

  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const elapsedRef = useRef(0);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    setPhase('running');
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      elapsedRef.current = Date.now() - startTimeRef.current;
    }, 16);
  }, []);

  const handleTap = useCallback(() => {
    stopTimer();
    const tapped = elapsedRef.current;
    const diff = Math.abs(tapped / 1000 - targetTime);
    const newResult = { player: currentPlayer, tapped, diff };
    const newResults = [...roundResults, newResult];
    setRoundResults(newResults);
    setPhase('done');

    setTimeout(() => {
      const nextPlayer = currentPlayer + 1;
      if (nextPlayer < playerCount) {
        setCurrentPlayer(nextPlayer);
        setPhase('waiting');
        elapsedRef.current = 0;
      } else {
        const sorted = [...newResults].sort((a, b) => a.diff - b.diff);
        const winnerId = sorted[0].player;
        const newScores = [...scores];
        newScores[winnerId] = (newScores[winnerId] || 0) + 1;
        setScores(newScores);
        setScreen('roundResult');
      }
    }, 800);
  }, [currentPlayer, playerCount, roundResults, scores, stopTimer, targetTime]);

  const startGame = (count, rounds) => {
    setPlayerCount(count);
    setRoundsPerGame(rounds);
    setScores(Array(count).fill(0));
    setRound(1);
    setCurrentPlayer(0);
    setTargetTime(generateTargetTime());
    setRoundResults([]);
    setPhase('waiting');
    elapsedRef.current = 0;
    setScreen('game');
  };

  const nextRound = () => {
    if (round >= roundsPerGame) {
      setScreen('final');
    } else {
      setRound(r => r + 1);
      setCurrentPlayer(0);
      setTargetTime(generateTargetTime());
      setRoundResults([]);
      setPhase('waiting');
      elapsedRef.current = 0;
      setScreen('game');
    }
  };

  useEffect(() => () => stopTimer(), [stopTimer]);

  return (
    <View style={s.appContainer}>
      {screen === 'home' && <HomeScreen onPlay={() => setScreen('playerSelect')} />}
      {screen === 'playerSelect' && <PlayerSelectionScreen onStart={startGame} />}
      {screen === 'game' && (
        <GameScreen
          currentPlayer={currentPlayer}
          round={round}
          totalRounds={roundsPerGame}
          targetTime={targetTime}
          phase={phase}
          onStartTimer={startTimer}
          onTap={handleTap}
        />
      )}
      {screen === 'roundResult' && (
        <RoundResultScreen
          targetTime={targetTime}
          results={roundResults}
          onNext={nextRound}
          isLastRound={round >= roundsPerGame}
          scores={scores}
        />
      )}
      {screen === 'final' && (
        <FinalScreen
          scores={scores}
          playerCount={playerCount}
          onRestart={() => setScreen('home')}
        />
      )}
    </View>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────

const CYAN = '#00F5FF';
const BG = '#050810';
const SURFACE = '#0d1220';
const SURFACE2 = '#131929';
const MUTED = '#4a5568';
const TEXT = '#e8eaf6';

const s = StyleSheet.create({
  appContainer: { flex: 1, backgroundColor: BG },
  safeArea: { flex: 1, backgroundColor: BG },
  screen: {
    flexGrow: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 24, paddingVertical: 32,
  },

  // HOME
  logoBlock: {
    width: 90, height: 90, borderRadius: 45,
    borderWidth: 2, borderColor: CYAN,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  logoIcon: { fontSize: 36 },
  title: {
    fontFamily: 'System', fontSize: 56, fontWeight: '900',
    color: 'white', textAlign: 'center', lineHeight: 60,
    letterSpacing: 4, textTransform: 'uppercase',
  },
  titleAccent: { color: CYAN },
  subtitle: {
    fontSize: 11, letterSpacing: 3, color: MUTED,
    textTransform: 'uppercase', marginTop: 8,
  },

  // BUTTONS
  btnMain: {
    borderWidth: 2, borderColor: CYAN, borderRadius: 50,
    paddingVertical: 16, paddingHorizontal: 48,
    alignItems: 'center',
  },
  btnMainText: {
    color: CYAN, fontSize: 20, fontWeight: '700',
    letterSpacing: 4, textTransform: 'uppercase',
  },

  // SETUP
  screenTitle: {
    fontSize: 32, fontWeight: '900', letterSpacing: 6,
    color: CYAN, textTransform: 'uppercase', marginBottom: 24,
  },
  setupSection: { width: '100%', alignItems: 'center', marginBottom: 24 },
  setupLabel: {
    fontSize: 11, letterSpacing: 4, color: MUTED,
    textTransform: 'uppercase', alignSelf: 'flex-start', marginBottom: 12,
  },
  countRing: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 3, borderColor: CYAN,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  countNum: { fontSize: 48, fontWeight: '900', color: 'white' },
  avatarRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 12 },
  avatarChip: {
    width: 42, height: 42, borderRadius: 21,
    borderWidth: 1.5, alignItems: 'center', justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 18 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  stepBtn: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: SURFACE2, borderWidth: 1.5, borderColor: MUTED,
    alignItems: 'center', justifyContent: 'center',
  },
  stepBtnText: { color: 'white', fontSize: 22, fontWeight: '600' },
  stepTrack: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  stepDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: MUTED,
  },
  roundsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, width: '100%' },
  roundsBtn: {
    flex: 1, minWidth: '30%', paddingVertical: 14,
    backgroundColor: SURFACE, borderWidth: 1.5, borderColor: MUTED,
    borderRadius: 12, alignItems: 'center',
  },
  roundsBtnActive: {
    borderColor: CYAN, backgroundColor: CYAN + '1A',
  },
  roundsBtnText: { fontSize: 22, fontWeight: '800', color: MUTED },
  roundsBtnTextActive: { color: CYAN },

  // GAME
  gameHeader: {
    position: 'absolute', top: 16, left: 16, right: 16,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  roundBadge: {
    backgroundColor: SURFACE2, paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20,
  },
  roundBadgeText: { fontSize: 11, letterSpacing: 2, color: MUTED, textTransform: 'uppercase' },
  playerTurn: {
    paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1,
  },
  playerTurnText: { fontSize: 13, fontWeight: '600', letterSpacing: 1 },
  targetBox: {
    alignItems: 'center', marginBottom: 40,
    paddingVertical: 24, paddingHorizontal: 48,
    backgroundColor: SURFACE,
    borderWidth: 1, borderColor: CYAN + '33',
    borderRadius: 20,
  },
  targetLabel: { fontSize: 10, letterSpacing: 4, color: MUTED, marginBottom: 4, textTransform: 'uppercase' },
  targetValue: { fontSize: 80, fontWeight: '900', color: 'white', lineHeight: 88 },
  targetUnit: { fontSize: 32, color: CYAN },
  btnLancer: {
    backgroundColor: CYAN, paddingVertical: 18, paddingHorizontal: 48,
    borderRadius: 50,
  },
  btnLancerText: { color: BG, fontSize: 20, fontWeight: '800', letterSpacing: 4 },
  btnTap: {
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: SURFACE,
    borderWidth: 3, borderColor: TEXT + '33',
    alignItems: 'center', justifyContent: 'center',
  },
  btnTapText: { color: 'white', fontSize: 28, fontWeight: '800', letterSpacing: 4 },
  tapDone: { alignItems: 'center', gap: 12 },
  checkmark: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#06D6A022', borderWidth: 2, borderColor: '#06D6A0',
    alignItems: 'center', justifyContent: 'center',
  },
  checkmarkText: { fontSize: 32, color: '#06D6A0' },
  tapDoneText: { color: TEXT, fontSize: 16 },

  // RESULT
  targetMini: { fontSize: 13, letterSpacing: 2, color: MUTED, marginBottom: 8 },
  winnerBadge: {
    paddingVertical: 8, paddingHorizontal: 20, borderRadius: 30,
    borderWidth: 1.5, marginBottom: 20,
  },
  winnerBadgeText: { fontWeight: '700', fontSize: 16 },
  resultList: { width: '100%', gap: 8, marginBottom: 20 },
  resultRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 14,
    backgroundColor: SURFACE, borderRadius: 12,
    borderWidth: 1, borderColor: SURFACE2, gap: 8,
  },
  resultRank: { fontSize: 16, width: 28, textAlign: 'center' },
  resultPlayer: { fontWeight: '700', fontSize: 13, width: 52 },
  resultTime: { color: TEXT, fontSize: 13, flex: 1 },
  resultDiff: { color: MUTED, fontSize: 12, flex: 1 },
  resultPts: { color: CYAN, fontWeight: '800', fontSize: 13, width: 40, textAlign: 'right' },

  // FINAL
  podium: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, width: '100%', marginBottom: 20 },
  podiumBlock: { flex: 1, alignItems: 'center', gap: 4 },
  podiumEmoji: { fontSize: 28 },
  podiumName: { fontSize: 13, fontWeight: '700' },
  podiumScore: { fontSize: 28, fontWeight: '900', color: 'white' },
  podiumPts: { fontSize: 13, color: MUTED },
  podiumBar: { width: '100%', borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  otherRanks: { width: '100%', gap: 8, marginBottom: 8 },
  otherRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, paddingHorizontal: 14,
    backgroundColor: SURFACE, borderRadius: 10,
    borderLeftWidth: 3,
  },
  otherRank: { color: MUTED, fontSize: 13 },
  otherName: { color: TEXT, fontSize: 13 },
  otherScore: { color: CYAN, fontWeight: '700', fontSize: 13 },
});

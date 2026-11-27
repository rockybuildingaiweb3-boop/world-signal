import type {
  ConfidenceLevel,
  ParsedEdition,
  ParsedSignal,
  SignalDomain,
  SignalStatus,
} from '../../../types/edition';
import {
  buildStorylineIndex,
  type StorylineRevisionKind,
} from '../storylines/buildStorylineIndex';
import type { SignalChangeReason } from '../edition-diff/compareEditions';

export const READER_STATE_STORAGE_KEY = 'world-signal-reader-desk-v1';
export const READER_SNAPSHOT_STORAGE_KEY = 'world-signal-reviewed-snapshot-v1';
export const READER_STATE_VERSION = 1;

export interface SavedSignalEntry {
  signalId: string;
  editionDate: string;
  headlineSnapshot: string;
  domain: SignalDomain;
  savedAt: string;
}

export interface FollowedSignalEntry {
  signalId: string;
  followedAt: string;
  lastKnownEditionDate: string;
  lastKnownHeadline: string;
  domain: SignalDomain;
}

export interface ReviewedSnapshotMetadata {
  editionDate: string;
  editionUpdatedAt: string;
  signalCount: number;
  hasCompactSnapshot: boolean;
}

export interface ReaderState {
  version: number;
  savedSignals: SavedSignalEntry[];
  followedSignals: FollowedSignalEntry[];
  followedTopics: string[];
  lastReviewedEditionDate: string | null;
  lastReviewedAt: string | null;
  reviewedSnapshotMetadata: ReviewedSnapshotMetadata | null;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export type ReaderStorageWarning =
  | 'storage_unavailable'
  | 'corrupt_state_recovered'
  | 'migrated_legacy_state'
  | 'quota_exceeded';

export interface LoadReaderStateResult {
  state: ReaderState;
  warning: ReaderStorageWarning | null;
}

export interface SaveReaderStateResult {
  ok: boolean;
  warning: ReaderStorageWarning | null;
}

export interface FollowedSignalStatus {
  entry: FollowedSignalEntry;
  currentHeadline: string;
  domain: SignalDomain;
  latestAvailableEdition: string | null;
  lastMaterialUpdateEdition: string | null;
  appearanceCount: number;
  latestRevisionKind: StorylineRevisionKind | 'missing';
  latestChangeReasons: SignalChangeReason[];
  presentInLatestEdition: boolean;
  latestSignal: ParsedSignal | null;
  status: SignalStatus | null;
  confidence: ConfidenceLevel | null;
  importance: 1 | 2 | 3 | 4 | 5 | null;
}

const SIGNAL_ID_RE = /^(?:WORLD|AI|ECON)-\d{8}-[a-z0-9-]+$/i;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const VALID_DOMAINS: readonly SignalDomain[] = ['world', 'ai', 'economy'];

export function createEmptyReaderState(): ReaderState {
  return {
    version: READER_STATE_VERSION,
    savedSignals: [],
    followedSignals: [],
    followedTopics: [],
    lastReviewedEditionDate: null,
    lastReviewedAt: null,
    reviewedSnapshotMetadata: null,
  };
}

function isValidDomain(value: unknown): value is SignalDomain {
  return typeof value === 'string' && VALID_DOMAINS.includes(value as SignalDomain);
}

function isValidSignalId(value: unknown): value is string {
  return typeof value === 'string' && SIGNAL_ID_RE.test(value.trim());
}

function isValidDate(value: unknown): value is string {
  return typeof value === 'string' && DATE_RE.test(value.trim());
}

function normalizeTopic(topic: string): string {
  return topic.trim().replace(/\s+/g, ' ');
}

function dedupeSavedSignals(entries: SavedSignalEntry[]): SavedSignalEntry[] {
  const byId = new Map<string, SavedSignalEntry>();
  for (const item of entries) {
    const id = item.signalId.trim();
    if (!isValidSignalId(id)) continue;
    if (!byId.has(id)) {
      byId.set(id, { ...item, signalId: id });
    }
  }
  return Array.from(byId.values());
}

function dedupeFollowedSignals(entries: FollowedSignalEntry[]): FollowedSignalEntry[] {
  const byId = new Map<string, FollowedSignalEntry>();
  for (const item of entries) {
    const id = item.signalId.trim();
    if (!isValidSignalId(id)) continue;
    if (!byId.has(id)) {
      byId.set(id, { ...item, signalId: id });
    }
  }
  return Array.from(byId.values());
}

function dedupeTopics(topics: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of topics) {
    const clean = normalizeTopic(raw);
    if (!clean) continue;
    const key = clean.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(clean);
    }
  }
  return result;
}

/**
 * Validates and migrates raw JSON parsed from local storage into a clean ReaderState.
 * Safely recovers from corrupt shapes, duplicate IDs, or legacy v0 array-of-ID formats.
 */
export function validateAndMigrateReaderState(raw: unknown): {
  state: ReaderState;
  warning: ReaderStorageWarning | null;
} {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return {
      state: createEmptyReaderState(),
      warning: 'corrupt_state_recovered',
    };
  }

  const obj = raw as Record<string, unknown>;
  const rawVersion = typeof obj.version === 'number' ? obj.version : 0;
  let warning: ReaderStorageWarning | null = null;

  if (rawVersion > READER_STATE_VERSION) {
    // Future schema version we don't understand -> attempt best-effort safe extraction
    warning = 'corrupt_state_recovered';
  } else if (rawVersion < READER_STATE_VERSION) {
    warning = 'migrated_legacy_state';
  }

  const savedSignals: SavedSignalEntry[] = [];
  if (Array.isArray(obj.savedSignals)) {
    for (const item of obj.savedSignals) {
      if (!item || typeof item !== 'object') continue;
      const rec = item as Record<string, unknown>;
      if (!isValidSignalId(rec.signalId)) continue;
      savedSignals.push({
        signalId: rec.signalId.trim(),
        editionDate: isValidDate(rec.editionDate) ? rec.editionDate.trim() : '',
        headlineSnapshot:
          typeof rec.headlineSnapshot === 'string' && rec.headlineSnapshot.trim()
            ? rec.headlineSnapshot.trim()
            : rec.signalId.trim(),
        domain: isValidDomain(rec.domain) ? rec.domain : 'world',
        savedAt:
          typeof rec.savedAt === 'string' && rec.savedAt.trim()
            ? rec.savedAt.trim()
            : new Date(0).toISOString(),
      });
    }
  } else if (Array.isArray(obj.savedSignalIds)) {
    // Legacy v0 migration support
    warning = 'migrated_legacy_state';
    for (const id of obj.savedSignalIds) {
      if (!isValidSignalId(id)) continue;
      savedSignals.push({
        signalId: id.trim(),
        editionDate: '',
        headlineSnapshot: id.trim(),
        domain: 'world',
        savedAt: new Date(0).toISOString(),
      });
    }
  }

  const followedSignals: FollowedSignalEntry[] = [];
  if (Array.isArray(obj.followedSignals)) {
    for (const item of obj.followedSignals) {
      if (!item || typeof item !== 'object') continue;
      const rec = item as Record<string, unknown>;
      if (!isValidSignalId(rec.signalId)) continue;
      followedSignals.push({
        signalId: rec.signalId.trim(),
        followedAt:
          typeof rec.followedAt === 'string' && rec.followedAt.trim()
            ? rec.followedAt.trim()
            : new Date(0).toISOString(),
        lastKnownEditionDate: isValidDate(rec.lastKnownEditionDate)
          ? rec.lastKnownEditionDate.trim()
          : '',
        lastKnownHeadline:
          typeof rec.lastKnownHeadline === 'string' && rec.lastKnownHeadline.trim()
            ? rec.lastKnownHeadline.trim()
            : rec.signalId.trim(),
        domain: isValidDomain(rec.domain) ? rec.domain : 'world',
      });
    }
  } else if (Array.isArray(obj.followedSignalIds)) {
    // Legacy v0 migration support
    warning = 'migrated_legacy_state';
    for (const id of obj.followedSignalIds) {
      if (!isValidSignalId(id)) continue;
      followedSignals.push({
        signalId: id.trim(),
        followedAt: new Date(0).toISOString(),
        lastKnownEditionDate: '',
        lastKnownHeadline: id.trim(),
        domain: 'world',
      });
    }
  }

  const followedTopics = Array.isArray(obj.followedTopics)
    ? dedupeTopics(obj.followedTopics.filter((item): item is string => typeof item === 'string'))
    : [];

  const lastReviewedEditionDate = isValidDate(obj.lastReviewedEditionDate)
    ? obj.lastReviewedEditionDate.trim()
    : null;

  const lastReviewedAt =
    typeof obj.lastReviewedAt === 'string' && obj.lastReviewedAt.trim()
      ? obj.lastReviewedAt.trim()
      : null;

  let reviewedSnapshotMetadata: ReviewedSnapshotMetadata | null = null;
  if (obj.reviewedSnapshotMetadata && typeof obj.reviewedSnapshotMetadata === 'object') {
    const meta = obj.reviewedSnapshotMetadata as Record<string, unknown>;
    if (isValidDate(meta.editionDate) && typeof meta.editionUpdatedAt === 'string') {
      reviewedSnapshotMetadata = {
        editionDate: meta.editionDate.trim(),
        editionUpdatedAt: meta.editionUpdatedAt.trim(),
        signalCount:
          typeof meta.signalCount === 'number' && Number.isFinite(meta.signalCount)
            ? Math.max(0, Math.floor(meta.signalCount))
            : 0,
        hasCompactSnapshot: Boolean(meta.hasCompactSnapshot),
      };
    }
  }

  return {
    state: {
      version: READER_STATE_VERSION,
      savedSignals: dedupeSavedSignals(savedSignals),
      followedSignals: dedupeFollowedSignals(followedSignals),
      followedTopics,
      lastReviewedEditionDate,
      lastReviewedAt,
      reviewedSnapshotMetadata,
    },
    warning,
  };
}

export function getBrowserStorage(): StorageLike | null {
  if (typeof window === 'undefined') return null;
  try {
    const storage = window.localStorage;
    const probeKey = '__ws_storage_probe__';
    storage.setItem(probeKey, '1');
    storage.removeItem(probeKey);
    return storage;
  } catch {
    return null;
  }
}

export function loadReaderState(
  storage: StorageLike | null = getBrowserStorage()
): LoadReaderStateResult {
  if (!storage) {
    return {
      state: createEmptyReaderState(),
      warning: 'storage_unavailable',
    };
  }

  try {
    const raw = storage.getItem(READER_STATE_STORAGE_KEY);
    if (!raw) {
      return { state: createEmptyReaderState(), warning: null };
    }
    const parsed: unknown = JSON.parse(raw);
    const validated = validateAndMigrateReaderState(parsed);
    if (validated.warning === 'migrated_legacy_state') {
      saveReaderState(validated.state, storage);
    }
    return validated;
  } catch {
    // Recover safely from malformed JSON without crashing
    try {
      storage.removeItem(READER_STATE_STORAGE_KEY);
    } catch {
      // Ignore cleanup errors
    }
    return {
      state: createEmptyReaderState(),
      warning: 'corrupt_state_recovered',
    };
  }
}

export function saveReaderState(
  state: ReaderState,
  storage: StorageLike | null = getBrowserStorage()
): SaveReaderStateResult {
  if (!storage) {
    return { ok: false, warning: 'storage_unavailable' };
  }

  try {
    const clean: ReaderState = {
      ...state,
      version: READER_STATE_VERSION,
      savedSignals: dedupeSavedSignals(state.savedSignals),
      followedSignals: dedupeFollowedSignals(state.followedSignals),
      followedTopics: dedupeTopics(state.followedTopics),
    };
    storage.setItem(READER_STATE_STORAGE_KEY, JSON.stringify(clean));
    return { ok: true, warning: null };
  } catch {
    return { ok: false, warning: 'quota_exceeded' };
  }
}

export function clearAllLocalReaderData(
  storage: StorageLike | null = getBrowserStorage()
): ReaderState {
  if (storage) {
    try {
      storage.removeItem(READER_STATE_STORAGE_KEY);
      storage.removeItem(READER_SNAPSHOT_STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  }
  return createEmptyReaderState();
}

export function saveSignalToReaderState(
  state: ReaderState,
  input: {
    signalId: string;
    editionDate: string;
    headline: string;
    domain: SignalDomain;
    nowIso?: string;
  }
): ReaderState {
  if (!isValidSignalId(input.signalId)) return state;
  const id = input.signalId.trim();
  const filtered = state.savedSignals.filter((item) => item.signalId !== id);
  const nextEntry: SavedSignalEntry = {
    signalId: id,
    editionDate: input.editionDate,
    headlineSnapshot: input.headline,
    domain: input.domain,
    savedAt: input.nowIso ?? new Date().toISOString(),
  };
  return {
    ...state,
    savedSignals: [nextEntry, ...filtered],
  };
}

export function unsaveSignalFromReaderState(
  state: ReaderState,
  signalId: string
): ReaderState {
  return {
    ...state,
    savedSignals: state.savedSignals.filter((item) => item.signalId !== signalId),
  };
}

export function followSignalInReaderState(
  state: ReaderState,
  input: {
    signalId: string;
    editionDate: string;
    headline: string;
    domain: SignalDomain;
    nowIso?: string;
  }
): ReaderState {
  if (!isValidSignalId(input.signalId)) return state;
  const id = input.signalId.trim();
  if (state.followedSignals.some((item) => item.signalId === id)) {
    return state;
  }
  const nextEntry: FollowedSignalEntry = {
    signalId: id,
    followedAt: input.nowIso ?? new Date().toISOString(),
    lastKnownEditionDate: input.editionDate,
    lastKnownHeadline: input.headline,
    domain: input.domain,
  };
  return {
    ...state,
    followedSignals: [nextEntry, ...state.followedSignals],
  };
}

export function unfollowSignalInReaderState(
  state: ReaderState,
  signalId: string
): ReaderState {
  return {
    ...state,
    followedSignals: state.followedSignals.filter(
      (item) => item.signalId !== signalId
    ),
  };
}

export function followTopicInReaderState(
  state: ReaderState,
  rawTopic: string
): ReaderState {
  const clean = normalizeTopic(rawTopic);
  if (!clean) return state;
  if (state.followedTopics.some((t) => t.toLowerCase() === clean.toLowerCase())) {
    return state;
  }
  return {
    ...state,
    followedTopics: [...state.followedTopics, clean],
  };
}

export function unfollowTopicInReaderState(
  state: ReaderState,
  rawTopic: string
): ReaderState {
  const lower = normalizeTopic(rawTopic).toLowerCase();
  return {
    ...state,
    followedTopics: state.followedTopics.filter(
      (t) => t.toLowerCase() !== lower
    ),
  };
}

/**
 * Evaluates all followed signals against loaded canonical editions using stable
 * `signal_id` identity and `buildStorylineIndex()` (never matching by headline).
 */
export function evaluateFollowedSignals(params: {
  followed: readonly FollowedSignalEntry[];
  loadedEditions: readonly ParsedEdition[];
  latestArchiveEditionDate: string | null;
}): FollowedSignalStatus[] {
  const { followed, loadedEditions, latestArchiveEditionDate } = params;
  if (followed.length === 0) return [];

  const storylineIndex = buildStorylineIndex([...loadedEditions]);
  const storylineById = new Map(
    storylineIndex.map((record) => [record.signalId, record])
  );

  const orderedEditions = [...loadedEditions].sort((a, b) =>
    a.frontmatter.edition_date.localeCompare(b.frontmatter.edition_date)
  );
  const newestLoadedDate =
    latestArchiveEditionDate ??
    orderedEditions[orderedEditions.length - 1]?.frontmatter.edition_date ??
    null;

  return followed.map((entry) => {
    const storyline = storylineById.get(entry.signalId);
    if (!storyline) {
      return {
        entry,
        currentHeadline: entry.lastKnownHeadline,
        domain: entry.domain,
        latestAvailableEdition: entry.lastKnownEditionDate || null,
        lastMaterialUpdateEdition: null,
        appearanceCount: 0,
        latestRevisionKind: 'missing',
        latestChangeReasons: [],
        presentInLatestEdition: false,
        latestSignal: null,
        status: null,
        confidence: null,
        importance: null,
      };
    }

    const lastRev = storyline.history[storyline.history.length - 1];
    const presentInLatestEdition = Boolean(
      newestLoadedDate && storyline.lastSeenEdition === newestLoadedDate
    );

    return {
      entry,
      currentHeadline: storyline.headline,
      domain: storyline.domain,
      latestAvailableEdition: storyline.lastSeenEdition,
      lastMaterialUpdateEdition: storyline.lastMaterialUpdateEdition,
      appearanceCount: storyline.appearanceCount,
      latestRevisionKind: lastRev?.kind ?? 'first_seen',
      latestChangeReasons: lastRev?.reasons ?? [],
      presentInLatestEdition,
      latestSignal: storyline.latestSignal,
      status: storyline.latestSignal.status,
      confidence: storyline.latestSignal.confidence.overall,
      importance: storyline.latestSignal.importance,
    };
  });
}

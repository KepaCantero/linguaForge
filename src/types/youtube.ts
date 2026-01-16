/**
 * TypeScript types for YouTube IFrame API
 *
 * These types define the YouTube Player API interface for use in
 * TypeScript components without using 'any'.
 */

// ============================================================
// YT PLAYER STATE
// ============================================================

export enum YTPlayerState {
  UNSTARTED = -1,
  ENDED = 0,
  PLAYING = 1,
  PAUSED = 2,
  BUFFERING = 3,
  CUED = 5,
}

// ============================================================
// YT PLAYER EVENT
// ============================================================

export interface YTPlayerEvent {
  target: YTPlayer;
  data: number;
}

export interface YTPlayerEventTarget extends YTPlayer {
  getPlayerState(): number;
  getCurrentTime(): number;
  getDuration(): number;
  getVideoUrl(): string;
  getPlaybackRate(): number;
  setPlaybackRate(rate: number): void;
  getVolume(): number;
  setVolume(volume: number): void;
  isMuted(): boolean;
  mute(): void;
  unMute(): void;
}

// ============================================================
// YT PLAYER OPTIONS
// ============================================================

export interface YTPlayerOptions {
  videoId: string;
  width?: number;
  height?: number;
  playerVars?: {
    autoplay?: number;
    controls?: number;
    modestbranding?: number;
    rel?: number;
    showinfo?: number;
    start?: number;
    end?: number;
    [key: string]: number | string | undefined;
  };
  events?: {
    onReady?: (event: YTPlayerEvent) => void;
    onStateChange?: (event: YTPlayerEvent) => void;
    onPlaybackQualityChange?: (event: YTPlayerEvent) => void;
    onPlaybackRateChange?: (event: YTPlayerEvent) => void;
    onError?: (event: YTPlayerEvent) => void;
    onApiChange?: (event: YTPlayerEvent) => void;
  };
}

// ============================================================
// YT PLAYER INTERFACE
// ============================================================

export interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  stopVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  setVolume(volume: number): void;
  getVolume(): number;
  mute(): void;
  unMute(): void;
  isMuted(): boolean;
  setPlaybackRate(rate: number): void;
  getPlaybackRate(): number;
  getAvailablePlaybackRates(): number[];
  setLoop(loopPlaylists: boolean): void;
  getPlaylist(): string;
  getPlaylistIndex(): number;
  nextVideo(): void;
  previousVideo(): void;
  playVideoAt(index: number): void;
  shufflePlaylist(): void;
  getPlayerState(): number;
  getCurrentTime(): number;
  getDuration(): number;
  getVideoUrl(): string;
  getVideoEmbedCode(): string;
  getVideoData(): {
    video_id: string;
    title: string;
    author: string;
  };
  getOptions(): string[];
  getOption(option: string): string;
  setOption(option: string, value: string): void;
  setSize(width: number, height: number): void;
  destroy(): void;
  getIframe(): HTMLIFrameElement | null;
}

// ============================================================
// YT GLOBAL TYPES
// ============================================================

export interface YTGlobal {
  Player: new (elementId: string, options: YTPlayerOptions) => YTPlayer;
  PlayerState: typeof YTPlayerState;
  ready(callback: () => void): void;
}

declare global {
  interface Window {
    YT?: YTGlobal;
    onYouTubeIframeAPIReady?: () => void;
  }
}

export {};

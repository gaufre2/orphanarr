import type { Torrent } from "@ctrl/qbittorrent";
import { describe, test, expect } from "bun:test";
import { MediaTorrents } from "./torrent";
import { WatchedMedia } from "./media";
import { fakeTorrents } from "../test/preload/torrents";

describe("Torrents from qbittorrent", () => {
  describe("Watch torrents", () => {
    test("Watch the first torrent", () => {
      const allTorrents = new MediaTorrents(fakeTorrents);
      const arrayOfOneTorrent = allTorrents.torrents.slice(0, 1);
      const watched = WatchedMedia.addMediaTorrents(arrayOfOneTorrent);
      expect(watched.medias[0]?.torrent.info.name).toBe(fakeTorrents[0]?.name);
    });

    test("Watch all torrents", () => {
      const allTorrents = new MediaTorrents(fakeTorrents);
      const watched = WatchedMedia.addMediaTorrents(allTorrents.torrents);
      expect(watched.medias).toBeArrayOfSize(fakeTorrents.length);
    });

    test("Watch none, empty client (no torrents)", () => {
      const noTorrents: Torrent[] = [];
      const allTorrents = new MediaTorrents(noTorrents);
      const watched = WatchedMedia.addMediaTorrents(allTorrents.torrents);
      expect(watched.medias).toBeArrayOfSize(noTorrents.length);
    });
  });
});

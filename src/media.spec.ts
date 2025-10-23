import type { Torrent } from "@ctrl/qbittorrent";
import { describe, test, expect } from "bun:test";
import { MediaTorrents } from "./torrent";
import { WatchedMedia } from "./media";
import { fakeTorrents } from "../test/preload/torrents";

describe("Torrents from qbittorrent", () => {
  describe("Watch torrents", () => {
    test("Watch the first torrent", async () => {
      const arrayOfOneMediaTorrent = (await MediaTorrents.from(fakeTorrents))
        .all()
        .slice(0, 1);
      const watched = WatchedMedia.addMediaTorrents(arrayOfOneMediaTorrent);
      expect(watched.medias[0]?.torrent.info.name).toBe(fakeTorrents[0]?.name);
    });

    test("Watch all torrents", async () => {
      const allTorrents = (await MediaTorrents.from(fakeTorrents)).all();
      const watched = WatchedMedia.addMediaTorrents(allTorrents);
      expect(watched.medias).toBeArrayOfSize(fakeTorrents.length);
    });

    test("Watch none, empty client (no torrents)", async () => {
      const noTorrents: Torrent[] = [];
      const allTorrents = (await MediaTorrents.from(noTorrents)).all();
      const watched = WatchedMedia.addMediaTorrents(allTorrents);
      expect(watched.medias).toBeArrayOfSize(noTorrents.length);
    });
  });
});

import type { Torrent } from "@ctrl/qbittorrent";
import { describe, test, expect } from "bun:test";
import { Torrents } from "./torrent";
import { WatchedMedia } from "./media";
import { fakeTorrents } from "../test/preload/torrents";

describe("Torrents from qbittorrent", () => {
  describe("Watch torrents", () => {
    test("Watch the first torrent", () => {
      const torrents = new Torrents(fakeTorrents);
      const arrayOfOneTorrent = torrents.info.slice(0, 1);
      const watched = WatchedMedia.addMediasLinkedToTorrent(arrayOfOneTorrent);
      expect(watched.medias[0]?.torrent.name).toBe(fakeTorrents[0]?.name);
    });

    test("Watch all torrents", () => {
      const torrents = new Torrents(fakeTorrents);
      const watched = WatchedMedia.addMediasLinkedToTorrent(torrents.info);
      expect(watched.medias).toBeArrayOfSize(fakeTorrents.length);
    });

    test("Watch none, empty client (no torrents)", () => {
      const noTorrents: Torrent[] = [];
      const torrents = new Torrents(noTorrents);
      const watched = WatchedMedia.addMediasLinkedToTorrent(torrents.info);
      expect(watched.medias).toBeArrayOfSize(noTorrents.length);
    });
  });
});

import type { Torrent } from "@ctrl/qbittorrent";
import { describe, test, expect } from "bun:test";
import { readFileSync } from "fs";
import { Torrents } from "./torrent";
import { WatchedMedia } from "./media";

describe("Torrents from qbittorrent", () => {
  const fakeTorrents: Torrent[] = JSON.parse(
    readFileSync("./test/mock/get-torrent-list.mock.json", "utf-8")
  );

  describe("Watch the first torrent", () => {
    test("Get the first torrent", () => {
      const torrents = new Torrents(fakeTorrents);
      const arrayOfOneTorrent = torrents.info.slice(0, 1);
      const watched = WatchedMedia.addMediasLinkedToTorrent(arrayOfOneTorrent);
      expect(watched.medias[0]?.torrent.name).toBe(fakeTorrents[0]?.name);
    });

    test("Get all torrents", () => {
      const torrents = new Torrents(fakeTorrents);
      const watched = WatchedMedia.addMediasLinkedToTorrent(torrents.info);
      expect(watched.medias.length).toBe(fakeTorrents.length);
    });
  });
});

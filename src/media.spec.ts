import type { Torrent } from "@ctrl/qbittorrent";
import { describe, test, expect } from "bun:test";
import { readFileSync } from "fs";
import { Torrents } from "./torrent";
import { WatchedMedia, WatchedMedias } from "./media";

describe("Torrents from qbittorrent", () => {
  const fakeTorrents: Torrent[] = JSON.parse(
    readFileSync("./test/mock/get-torrent-list.mock.json", "utf-8")
  );

  describe("Parse torrents", () => {
    test("Get the first torrent", () => {
      const torrents = new Torrents(fakeTorrents);
      const watchedMedia = new WatchedMedia(torrents.info[0]);
      expect(watchedMedia.torrent.name).toBe(fakeTorrents[0].name);
    });

    test("Get all torrents", () => {
      const torrents = new Torrents(fakeTorrents);
      const watched = new WatchedMedias();
      watched.addMediaFromInfoTorrents(torrents.info);
      expect(watched.medias.length).toBe(fakeTorrents.length);
    });
  });
});

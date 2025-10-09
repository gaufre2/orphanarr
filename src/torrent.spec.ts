import type { Torrent } from "@ctrl/qbittorrent";
import { describe, test, expect } from "bun:test";
import { readFileSync } from "fs";
import { Torrents } from "./torrent";

describe("Torrents from qbittorrent", () => {
  const fakeTorrents: Torrent[] = JSON.parse(
    readFileSync("./test/get-torrent-list.mock.json", "utf-8")
  );

  describe("Parse torrents", () => {
    test("Get filtered torrents by categories including 'Movies' and 'Series'", () => {
      const torrents = new Torrents(fakeTorrents);
      const filter = { categories: ["Movies", "Series"] };
      const filteredTorrents = torrents.findMatchingTorrents(filter);
      expect(filteredTorrents.length).toBe(8);
    });

    test("Get filtered torrents by tags excluding 'orphanarr.protected'", () => {
      const torrents = new Torrents(fakeTorrents);
      const filter = { excludedTags: ["orphanarr.protected"] };
      const filteredTorrents = torrents.findMatchingTorrents(filter);
      expect(filteredTorrents.length).toBe(8);
    });

    test("Get filtered torrents by tags including 'Movies' and 'Series' and excluding 'orphanarr.protected'", () => {
      const torrents = new Torrents(fakeTorrents);
      const filter = {
        categories: ["Movies", "Series"],
        excludedTags: ["orphanarr.protected"],
      };
      const filteredTorrents = torrents.findMatchingTorrents(filter);
      expect(filteredTorrents.length).toBe(6);
    });
  });
});

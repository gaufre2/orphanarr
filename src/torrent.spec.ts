import { describe, test, expect } from "bun:test";
import { Torrents } from "./torrent";
import { fakeTorrents } from "../test/preload/torrents";

describe("Torrents from qbittorrent", () => {
  describe("Parse torrents", () => {
    test("Get filtered torrents by categories including 'Movies' and 'Series'", () => {
      const allTorrents = new Torrents(fakeTorrents);
      const filter = { categories: ["Movies", "Series"] };
      const filteredTorrents = allTorrents.findMatching(filter);
      expect(filteredTorrents.length).toBe(8);
    });

    test("Get filtered torrents by tags excluding 'orphanarr.protected'", () => {
      const allTorrents = new Torrents(fakeTorrents);
      const filter = { excludedTags: ["orphanarr.protected"] };
      const filteredTorrents = allTorrents.findMatching(filter);
      expect(filteredTorrents.length).toBe(8);
    });

    test("Get filtered torrents by tags including 'Movies' and 'Series' and excluding 'orphanarr.protected'", () => {
      const allTorrents = new Torrents(fakeTorrents);
      const filter = {
        categories: ["Movies", "Series"],
        excludedTags: ["orphanarr.protected"],
      };
      const filteredTorrents = allTorrents.findMatching(filter);
      expect(filteredTorrents.length).toBe(6);
    });
  });
});

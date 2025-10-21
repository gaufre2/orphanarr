import { describe, test, expect } from "bun:test";
import { MediaTorrents, MediaTorrent } from "./torrent";
import { fakeTorrents } from "../test/preload/torrents";
import { basename } from "node:path";

describe("Torrents from qbittorrent", () => {
  describe("Parse torrents", () => {
    test("Get filtered torrents by categories including 'Movies' and 'Series'", () => {
      const allTorrents = new MediaTorrents(fakeTorrents);
      const filter = { categories: ["Movies", "Series"] };
      const filteredTorrents = allTorrents.findMatching(filter);
      expect(filteredTorrents.length).toBe(8);
    });

    test("Get filtered torrents by tags excluding 'orphanarr.protected'", () => {
      const allTorrents = new MediaTorrents(fakeTorrents);
      const filter = { excludedTags: ["orphanarr.protected"] };
      const filteredTorrents = allTorrents.findMatching(filter);
      expect(filteredTorrents.length).toBe(8);
    });

    test("Get filtered torrents by tags including 'Movies' and 'Series' and excluding 'orphanarr.protected'", () => {
      const allTorrents = new MediaTorrents(fakeTorrents);
      const filter = {
        categories: ["Movies", "Series"],
        excludedTags: ["orphanarr.protected"],
      };
      const filteredTorrents = allTorrents.findMatching(filter);
      expect(filteredTorrents.length).toBe(6);
    });
  });
});

describe("Get media files from torrents", () => {
  test("Get one media file from a torrent", async () => {
    const singleTorrentWithMediaFile = await MediaTorrent.from(
      fakeTorrents[3]
    ).collectMediaFiles();
    expect(basename(singleTorrentWithMediaFile.mediaFiles[0]?.file.name)).toBe(
      "MovieWithLinks.mkv"
    );
  });
  test("Get multiple media file from a torrent with nested directory", async () => {
    const singleTorrentWithMediaFile = await MediaTorrent.from(
      fakeTorrents[0]
    ).collectMediaFiles();
    expect(singleTorrentWithMediaFile.mediaFiles).toBeArrayOfSize(6);
  });
  test("Get no media file from a torrent with no media file", async () => {
    const singleTorrentWithMediaFile = await MediaTorrent.from(
      fakeTorrents[7]
    ).collectMediaFiles();
    expect(singleTorrentWithMediaFile.mediaFiles).toBeArrayOfSize(0);
  });
});

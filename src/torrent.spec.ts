import { describe, test, expect } from "bun:test";
import {
  MediaTorrents,
  MediaTorrent,
  type TorrentFilterCriteria,
} from "./torrent";
import { fakeTorrents } from "../test/preload/torrents";
import { basename } from "node:path";

describe("Torrents from qbittorrent", () => {
  describe("list of media torrents", () => {
    test("Get all", async () => {
      const allMediaTorrents = (await MediaTorrents.from(fakeTorrents)).all();
      expect(allMediaTorrents.length).toBe(10);
    });
  });
  describe("Filter torrents", () => {
    test("By categories including 'Movies' and 'Series'", async () => {
      const filter: TorrentFilterCriteria = {
        categories: ["Movies", "Series"],
      };
      const filteredMediaTorrents = (
        await MediaTorrents.from(fakeTorrents)
      ).findMatching(filter);
      expect(filteredMediaTorrents.length).toBe(8);
    });

    test("By tags excluding 'orphanarr.protected'", async () => {
      const filter = { excludedTags: ["orphanarr.protected"] };
      const filteredMediaTorrents = (
        await MediaTorrents.from(fakeTorrents)
      ).findMatching(filter);
      expect(filteredMediaTorrents.length).toBe(8);
    });

    test("By tags including 'Movies' and 'Series' and excluding 'orphanarr.protected'", async () => {
      const filter: TorrentFilterCriteria = {
        categories: ["Movies", "Series"],
        excludedTags: ["orphanarr.protected"],
      };
      const filteredMediaTorrents = (
        await MediaTorrents.from(fakeTorrents)
      ).findMatching(filter);
      expect(filteredMediaTorrents.length).toBe(6);
    });
  });
});

describe("Get media files from torrents", () => {
  test("Get thew only media file from a single torrent", async () => {
    const singleTorrentWithMediaFile = await MediaTorrent.from(
      fakeTorrents.at(3)!
    );
    const mediaFileName = basename(
      singleTorrentWithMediaFile.mediaFiles!.at(0)!.file.name!
    );
    expect(mediaFileName).toBe("MovieWithLinks.mkv");
  });
  test("Get multiple media file from a torrent with nested directory", async () => {
    const singleTorrentWithMediaFile = await MediaTorrent.from(
      fakeTorrents.at(0)!
    );
    expect(singleTorrentWithMediaFile.mediaFiles).toBeArrayOfSize(6);
  });
  test("Get no media file from a torrent with no media file", async () => {
    const singleTorrentWithMediaFile = await MediaTorrent.from(
      fakeTorrents.at(7)!
    );
    expect(singleTorrentWithMediaFile.mediaFiles).toBeArrayOfSize(0);
  });
});

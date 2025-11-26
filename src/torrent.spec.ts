import { describe, test, expect, beforeAll } from "bun:test";
import {
  getMediaTorrentsToWatch,
  Torrent,
  MediaTorrent,
  TorrentClient,
  type TorrentFilterCriteria,
} from "./torrent";
import { fakeTorrents } from "../test/preload/torrents";
import { basename } from "node:path";

let fakeInfoTorrents: Torrent[];

beforeAll(() => {
  fakeInfoTorrents = fakeTorrents.map((torrent) => new Torrent(torrent));
});

describe("Torrents from qbittorrent", () => {
  const fakeConfig = {
    baseUrl: "http://localhost:8080",
    username: "johndoe",
    password: "fake-password",
  };

  describe("Get torrents from qbittorrent", () => {
    test("Empty torrent client should return empty array", async () => {
      const client = new TorrentClient(fakeConfig, []);
      const torrents = await client.getTorrents();
      expect(torrents).toBeArrayOfSize(0);
    });
    test("Return faked torrents", async () => {
      const client = new TorrentClient(fakeConfig, fakeTorrents);
      const torrents = await client.getTorrents();
      expect(torrents).toBeArrayOfSize(fakeTorrents.length);
    });
  });

  describe("list of media torrents", () => {
    test("Get all", async () => {
      const allMediaTorrents = await getMediaTorrentsToWatch(fakeInfoTorrents);
      expect(allMediaTorrents).toBeArrayOfSize(fakeInfoTorrents.length);
    });
  });

  describe("Filter torrents", () => {
    test("By categories including 'Movies' and 'Series'", async () => {
      const filter: TorrentFilterCriteria = {
        categories: ["Movies", "Series"],
      };
      const filteredMediaTorrents = await getMediaTorrentsToWatch(
        fakeInfoTorrents,
        filter
      );
      expect(filteredMediaTorrents).toBeArrayOfSize(10);
    });
    test("By tags excluding 'orphanarr.protected'", async () => {
      const filter = { excludedTags: ["orphanarr.protected"] };
      const filteredMediaTorrents = await getMediaTorrentsToWatch(
        fakeInfoTorrents,
        filter
      );
      expect(filteredMediaTorrents).toBeArrayOfSize(15);
    });
    test("By tags including 'Movies' and 'Series' and excluding 'orphanarr.protected'", async () => {
      const filter: TorrentFilterCriteria = {
        categories: ["Movies", "Series"],
        excludedTags: ["orphanarr.protected"],
      };
      const filteredMediaTorrents = await getMediaTorrentsToWatch(
        fakeInfoTorrents,
        filter
      );
      expect(filteredMediaTorrents).toBeArrayOfSize(8);
    });
  });
});

describe("Get media files from torrents", () => {
  test("Get the only media file from a single torrent", async () => {
    const singleTorrentWithMediaFile = await MediaTorrent.from(
      fakeInfoTorrents.find((torrent) => torrent.name === "MovieWithLinks.mkv")!
    );
    const mediaFileName = basename(
      singleTorrentWithMediaFile.mediaFiles!.at(0)!.file.name!
    );
    expect(singleTorrentWithMediaFile.mediaFiles).toBeArrayOfSize(1);
    expect(mediaFileName).toBe("MovieWithLinks.mkv");
  });
  test("Get multiple media file from a torrent with nested directory", async () => {
    const singleTorrentWithMediaFile = await MediaTorrent.from(
      fakeInfoTorrents.find(
        (torrent) => torrent.name === "SeriesWithLinks.S01"
      )!
    );
    expect(singleTorrentWithMediaFile.mediaFiles).toBeArrayOfSize(3);
  });
  test("Get no media file from a torrent with no media file", async () => {
    const singleTorrentWithMediaFile = await MediaTorrent.from(
      fakeInfoTorrents.find(
        (torrent) => torrent.name === "MovieWithoutLinksButUnwatchExtension.iso"
      )!
    );
    expect(singleTorrentWithMediaFile.mediaFiles).toBeArrayOfSize(0);
  });
});

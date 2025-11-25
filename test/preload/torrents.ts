import { beforeAll } from "bun:test";
import type { Torrent as QBittorrentTorrent } from "@ctrl/qbittorrent";
import { readFileSync } from "fs";
import { join } from "path";
import { testTempDir } from "./files-and-hardlinks";

export let fakeTorrents: QBittorrentTorrent[];

beforeAll(() => {
  fakeTorrents = JSON.parse(
    readFileSync("./test/fake-api-response/torrent-list.json", "utf-8")
  );

  fakeTorrents.forEach((torrent) => {
    torrent.content_path = join(testTempDir, torrent.content_path);
  });
});

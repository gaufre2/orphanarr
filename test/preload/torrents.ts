import { beforeAll } from "bun:test";
import type { Torrent } from "@ctrl/qbittorrent";
import { readFileSync } from "fs";
import { join } from "path";
import { testTempDir } from "./files-and-hardlinks";

export let fakeTorrents: Torrent[];

beforeAll(() => {
  fakeTorrents = JSON.parse(
    readFileSync("./test/mock/torrent-list.fake.json", "utf-8")
  );

  fakeTorrents.forEach((torrent) => {
    torrent.content_path = join(testTempDir, torrent.content_path);
  });
});

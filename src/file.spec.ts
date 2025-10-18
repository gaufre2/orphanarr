import { describe, expect, test } from "bun:test";
import {
  fakeRadarrDir,
  fakeTorrentMovieDir,
} from "../test/preload/files-and-hardlinks";
import { FileMedia } from "./file";
import { join } from "node:path";

describe("Hard linking check", () => {
  test("2 files are hard linked (from path)", async () => {
    const torrentFile = await FileMedia.from(
      join(fakeTorrentMovieDir, "MovieWithLinks.mkv")
    );
    expect(
      await torrentFile.isHardLinkedWith(
        join(fakeRadarrDir, "MovieWithLinks/Movie.Link1.mkv")
      )
    ).toBe(true);
  });

  test("2 files are not hard linked", async () => {
    const torrentFile = await FileMedia.from(
      join(fakeTorrentMovieDir, "MovieWithLinks.mkv")
    );
    expect(
      await torrentFile.isHardLinkedWith(
        join(fakeRadarrDir, "MovieWithoutHardLink.mkv")
      )
    ).toBe(false);
  });

  test("1 file is invalid", async () => {
    const torrentFile = await FileMedia.from(
      join(fakeTorrentMovieDir, "MovieWithLinks.mkv")
    );
    expect.assertions(1);
    try {
      await torrentFile.isHardLinkedWith(join(fakeRadarrDir, "invalid"));
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });
});

describe("List media files from torrent content path", () => {
  test("Get single media file from dirrect path", async () => {
    const mediaPath = join(fakeTorrentMovieDir, "MovieWithLinks.mkv");
    const torrentMedia = await FileMedia.collectMediaFiles(mediaPath);
    expect(torrentMedia).toContainAllValues([await FileMedia.from(mediaPath)]);
  });
  test("Get single media file from directory path", async () => {
    const dirPath = join(fakeTorrentMovieDir, "MovieWithLinksInAFolder");
    const torrentMedia = await FileMedia.collectMediaFiles(dirPath);
    expect(torrentMedia).toContainAllValues([
      await FileMedia.from(join(dirPath, "Movie.mkv")),
    ]);
  });
  test("Get multiple media file from directory path", async () => {
    const dirPath = join(fakeRadarrDir, "MovieWithLinks");
    const torrentMedia = await FileMedia.collectMediaFiles(dirPath);
    expect(torrentMedia).toContainAllValues([
      await FileMedia.from(join(dirPath, "Movie.Link1.mkv")),
      await FileMedia.from(join(dirPath, "Movie.Link2.mkv")),
    ]);
  });
  test("Throw error if path is invalid", async () => {
    const path = join(fakeTorrentMovieDir, "InvalidPath");
    expect(FileMedia.collectMediaFiles(path)).rejects.toThrow();
  });
  test("Get multiple media file from different level of nested directory", async () => {
    const dirPath = join(fakeTorrentMovieDir, "MoviesNestedInFolders");
    const torrentMedia = await FileMedia.collectMediaFiles(dirPath);
    expect(torrentMedia).toContainAllValues([
      await FileMedia.from(join(dirPath, "MovieAtRoot1.mkv")),
      await FileMedia.from(join(dirPath, "MovieAtRoot2.mkv")),
      await FileMedia.from(join(dirPath, "Nested/MovieInNestedFolder.mkv")),
    ]);
  });
});

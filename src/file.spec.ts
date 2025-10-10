import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { FileExtended } from "./file";
import { execSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

let tempDir: string;
let fakeTorrentMovieDir: string;
let fakeTorrentSeriesDir: string;
let fakeRadarrDir: string;
let fakeSonarrDir: string;

beforeAll(() => {
  // Create unique test directory for each test
  tempDir = join(
    tmpdir(),
    `test-${Date.now()}-${Math.random().toString(36).substring(7)}`
  );

  fakeTorrentMovieDir = join(tempDir, "completed/movies");
  fakeTorrentSeriesDir = join(tempDir, "completed/series");
  fakeRadarrDir = join(tempDir, "media/movies");
  fakeSonarrDir = join(tempDir, "media/series");

  mkdirsSyncRecursively([
    fakeTorrentMovieDir,
    fakeTorrentMovieDir,
    fakeRadarrDir,
    fakeSonarrDir,
  ]);

  // Create torrent movie file
  mkdirsSyncRecursively([
    join(fakeTorrentMovieDir, "MovieWithLinksInAFolder"),
    join(fakeTorrentMovieDir, "MoviesNestedInFolders/Nested"),
  ]);
  writeFilesSyncWithRandomData([
    join(fakeTorrentMovieDir, "MovieWithLinks.mkv"),
    join(fakeTorrentMovieDir, "MovieWithLinksInAFolder/Movie.mkv"),
    join(fakeTorrentMovieDir, "MovieWithoutLinksButUnwatchExtension.iso"),
    join(fakeTorrentMovieDir, "MoviesNestedInFolders/MovieAtRoot1.mkv"),
    join(fakeTorrentMovieDir, "MoviesNestedInFolders/MovieAtRoot2.mkv"),
    join(
      fakeTorrentMovieDir,
      "MoviesNestedInFolders/Nested/MovieInNestedFolder.mkv"
    ),
  ]);

  // Create torrent series file
  mkdirsSyncRecursively([
    join(fakeTorrentSeriesDir, "SeriesWithLinks/Season 01"),
    join(fakeTorrentSeriesDir, "SeriesWithLinks/Season 02"),
    join(fakeTorrentSeriesDir, "SeriesWithoutLinksToDelete/Season 01"),
  ]);
  writeFilesSyncWithRandomData([
    join(fakeTorrentSeriesDir, "SeriesWithLinks/Season 01/Episode 01.mkv"),
    join(fakeTorrentSeriesDir, "SeriesWithLinks/Season 01/Episode 02.mkv"),
    join(fakeTorrentSeriesDir, "SeriesWithLinks/Season 01/Episode 03.mkv"),
    join(fakeTorrentSeriesDir, "SeriesWithLinks/Season 02/Episode 01.mkv"),
    join(fakeTorrentSeriesDir, "SeriesWithLinks/Season 02/Episode 02.mkv"),
    join(fakeTorrentSeriesDir, "SeriesWithLinks/Season 02/Episode 03.mkv"),
    join(
      fakeTorrentSeriesDir,
      "SeriesWithoutLinksToDelete/Season 01/Episode 01.mkv"
    ),
    join(
      fakeTorrentSeriesDir,
      "SeriesWithoutLinksToDelete/Season 01/Episode 02.mkv"
    ),
  ]);

  // Create radarr dirs
  mkdirsSyncRecursively([
    join(fakeRadarrDir, "MovieWithLinks"),
    join(fakeRadarrDir, "MovieWithLinksInAFolder"),
    join(fakeRadarrDir, "MovieWithoutLinksButUnwatchExtension"),
  ]);

  // Create radarr hard linked copy
  generateHardLinkCopies([
    {
      target: join(fakeTorrentMovieDir, "MovieWithLinks.mkv"),
      link: join(fakeRadarrDir, "MovieWithLinks/Movie.Link1.mkv"),
    },
    {
      target: join(fakeTorrentMovieDir, "MovieWithLinks.mkv"),
      link: join(fakeRadarrDir, "MovieWithLinks/Movie.Link2.mkv"),
    },
    {
      target: join(fakeTorrentMovieDir, "MovieWithLinksInAFolder/Movie.mkv"),
      link: join(fakeRadarrDir, "MovieWithLinksInAFolder/Movie.Link1.mkv"),
    },
    {
      target: join(
        fakeTorrentMovieDir,
        "MovieWithoutLinksButUnwatchExtension.iso"
      ),
      link: join(
        fakeRadarrDir,
        "MovieWithoutLinksButUnwatchExtension/Movie.Link1.iso"
      ),
    },
  ]);

  // Create a radarr file witout hard link
  writeFilesSyncWithRandomData([
    join(fakeRadarrDir, "MovieWithoutHardLink.mkv"),
  ]);

  // create sonarr dirs
  mkdirsSyncRecursively([
    join(fakeSonarrDir, "SeriesWithLinks/Season 01"),
    join(fakeSonarrDir, "SeriesWithLinks/Season 02"),
  ]);

  // create sonarr hard linked copy
  generateHardLinkCopies([
    {
      target: join(
        fakeTorrentSeriesDir,
        "SeriesWithLinks/Season 01/Episode 01.mkv"
      ),
      link: join(
        fakeSonarrDir,
        "SeriesWithLinks/Season 01/Episode 01.Link1.mkv"
      ),
    },
    {
      target: join(
        fakeTorrentSeriesDir,
        "SeriesWithLinks/Season 01/Episode 02.mkv"
      ),
      link: join(
        fakeSonarrDir,
        "SeriesWithLinks/Season 01/Episode 02.Link1.mkv"
      ),
    },
    {
      target: join(
        fakeTorrentSeriesDir,
        "SeriesWithLinks/Season 01/Episode 03.mkv"
      ),
      link: join(
        fakeSonarrDir,
        "SeriesWithLinks/Season 01/Episode 03.Link1.mkv"
      ),
    },
    {
      target: join(
        fakeTorrentSeriesDir,
        "SeriesWithLinks/Season 02/Episode 01.mkv"
      ),
      link: join(
        fakeSonarrDir,
        "SeriesWithLinks/Season 02/Episode 01.Link1.mkv"
      ),
    },
    {
      target: join(
        fakeTorrentSeriesDir,
        "SeriesWithLinks/Season 02/Episode 02.mkv"
      ),
      link: join(
        fakeSonarrDir,
        "SeriesWithLinks/Season 02/Episode 02.Link1.mkv"
      ),
    },
    {
      target: join(
        fakeTorrentSeriesDir,
        "SeriesWithLinks/Season 02/Episode 03.mkv"
      ),
      link: join(
        fakeSonarrDir,
        "SeriesWithLinks/Season 02/Episode 03.Link1.mkv"
      ),
    },
  ]);

  function writeFilesSyncWithRandomData(filePaths: string[]): void {
    filePaths.forEach((filePath) =>
      writeFileSync(filePath, generateRandomData(10))
    );
  }

  function generateRandomData(sizeBytes: number): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(sizeBytes));
  }

  function mkdirsSyncRecursively(dirPaths: string[]): void {
    dirPaths.forEach((dirPath) => mkdirSync(dirPath, { recursive: true }));
  }

  interface HardLinkCopies {
    target: string;
    link: string;
  }

  function generateHardLinkCopies(hardLinks: HardLinkCopies[]): void {
    hardLinks.forEach((hardLink) => generateHardLinkCopy(hardLink));
  }

  function generateHardLinkCopy(hardLink: HardLinkCopies): void {
    execSync(`ln "${hardLink.target}" "${hardLink.link}"`);
  }
});

afterAll(() => {
  rmSync(tempDir, { recursive: true, force: true });
});

describe("Hard linking check", () => {
  test("2 files are hard linked (from path)", async () => {
    const torrentFile = await FileExtended.fromPath(
      join(fakeTorrentMovieDir, "MovieWithLinks.mkv")
    );
    expect(
      await torrentFile.isHardLinkedWith(
        join(fakeRadarrDir, "MovieWithLinks/Movie.Link1.mkv")
      )
    ).toBe(true);
  });

  test("2 files are not hard linked", async () => {
    const torrentFile = await FileExtended.fromPath(
      join(fakeTorrentMovieDir, "MovieWithLinks.mkv")
    );
    expect(
      await torrentFile.isHardLinkedWith(
        join(fakeRadarrDir, "MovieWithoutHardLink.mkv")
      )
    ).toBe(false);
  });

  test("1 file is invalid", async () => {
    const torrentFile = await FileExtended.fromPath(
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
    const torrentMedia = await FileExtended.searchMediasFromRootPath(mediaPath);
    expect(torrentMedia).toBeArrayOfSize(1);
    expect(torrentMedia[0]?.name).toBe(Bun.file(mediaPath).name);
  });
  test("Get single media file from directory path", async () => {
    const dirPath = join(fakeTorrentMovieDir, "MovieWithLinksInAFolder");
    const torrentMedia = await FileExtended.searchMediasFromRootPath(dirPath);
    expect(torrentMedia).toBeArrayOfSize(1);
    expect(torrentMedia[0]?.name).toBe(
      Bun.file(join(dirPath, "/Movie.mkv")).name
    );
  });
  test("Get multiple media file from directory path", async () => {
    const dirPath = join(fakeRadarrDir, "MovieWithLinks");
    const torrentMedia = await FileExtended.searchMediasFromRootPath(dirPath);
    expect(torrentMedia).toBeArrayOfSize(2);
    expect(torrentMedia[0]?.name).toBe(
      Bun.file(join(dirPath, "Movie.Link1.mkv")).name
    );
    expect(torrentMedia[1]?.name).toBe(
      Bun.file(join(dirPath, "Movie.Link2.mkv")).name
    );
  });
  test("Throw error if path is invalid", async () => {
    const path = join(fakeTorrentMovieDir, "InvalidPath");
    expect(FileExtended.searchMediasFromRootPath(path)).rejects.toThrow();
  });
  test("Get multiple media file from directory path", async () => {
    const dirPath = join(fakeTorrentMovieDir, "MoviesNestedInFolders");
    const torrentMedia = await FileExtended.searchMediasFromRootPath(dirPath);
    expect(torrentMedia).toBeArrayOfSize(3);
    expect(torrentMedia[0]?.name).toBe(
      Bun.file(join(dirPath, "MovieAtRoot1.mkv")).name
    );
    expect(torrentMedia[1]?.name).toBe(
      Bun.file(join(dirPath, "MovieAtRoot2.mkv")).name
    );
    expect(torrentMedia[2]?.name).toBe(
      Bun.file(join(dirPath, "Nested/MovieInNestedFolder.mkv")).name
    );
  });
});

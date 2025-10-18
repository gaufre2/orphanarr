import { afterAll, beforeAll } from "bun:test";
import { execSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export let testTempDir: string;
export let fakeTorrentMovieDir: string;
export let fakeTorrentSeriesDir: string;
export let fakeRadarrDir: string;
export let fakeSonarrDir: string;

beforeAll(() => {
  // Create unique test directory for each test
  testTempDir = join(
    tmpdir(),
    `test-${Date.now()}-${Math.random().toString(36).substring(7)}`
  );

  fakeTorrentMovieDir = join(testTempDir, "completed/movies");
  fakeTorrentSeriesDir = join(testTempDir, "completed/series");
  fakeRadarrDir = join(testTempDir, "media/movies");
  fakeSonarrDir = join(testTempDir, "media/series");

  mkdirsSyncRecursively([
    fakeTorrentMovieDir,
    fakeTorrentMovieDir,
    fakeRadarrDir,
    fakeSonarrDir,
    join(testTempDir, "completed/other"),
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
    join(fakeTorrentMovieDir, "MovieWithoutLinksButProtected.mkv"),
    join(fakeTorrentMovieDir, "MovieWithLinksButPreviouslyTaggedToDelete.mkv"),
    join(testTempDir, "completed", "Uncategorized.mkv"),
    join(testTempDir, "completed/other", "MovieFromUnwatchedCategory.mkv"),
  ]);

  // Create torrent series file
  mkdirsSyncRecursively([
    join(fakeTorrentSeriesDir, "SeriesWithLinks/Season 01"),
    join(fakeTorrentSeriesDir, "SeriesWithLinks/Season 02"),
    join(fakeTorrentSeriesDir, "SeriesWithoutLinksToDelete/Season 01"),
    join(fakeTorrentSeriesDir, "SeriesWithoutLinksButProtected"),
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

  // Prompt generated files tree
  console.log(
    "Before All Tests: Generated files tree in testTempDir:\n",
    execSync(`tree -a "${testTempDir}"`).toString()
  );
});

afterAll(() => {
  rmSync(testTempDir, { recursive: true, force: true });

  console.log(`After All Tests: Cleanup "${testTempDir}"`);
});

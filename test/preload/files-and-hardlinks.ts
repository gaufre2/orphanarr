import { afterAll, beforeAll } from "bun:test";
import { execSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export let testTempDir: string;
export let fakeTorrentMovieDir: string;
export let fakeTorrentSeriesDir: string;
export let fakeTorrentCrossSeedDir: string;
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
  fakeTorrentCrossSeedDir = join(testTempDir, "completed/cross-seed");
  fakeRadarrDir = join(testTempDir, "media/movies");
  fakeSonarrDir = join(testTempDir, "media/series");

  mkdirsSyncRecursively([
    fakeTorrentMovieDir,
    fakeTorrentSeriesDir,
    fakeTorrentCrossSeedDir,
    fakeRadarrDir,
    fakeSonarrDir,
    join(testTempDir, "completed/other"),
  ]);

  // Create torrent movie file
  mkdirsSyncRecursively([
    join(fakeTorrentMovieDir, "MovieWithLinksInAFolder"),
    join(fakeTorrentMovieDir, "MoviesNestedInFolders/Bonus"),
  ]);
  writeFilesSyncWithRandomData([
    join(fakeTorrentMovieDir, "MovieWithLinks.mkv"),
    join(fakeTorrentMovieDir, "MovieWithLinksInAFolder/Movie.mkv"),
    join(fakeTorrentMovieDir, "MovieWithoutLinksButUnwatchExtension.iso"),
    join(fakeTorrentMovieDir, "MoviesNestedInFolders/MovieAtRoot.Part1.mkv"),
    join(fakeTorrentMovieDir, "MoviesNestedInFolders/MovieAtRoot.Part2.mkv"),
    join(
      fakeTorrentMovieDir,
      "MoviesNestedInFolders/Bonus/MovieInNestedFolder.Bonus.mkv"
    ),
    join(fakeTorrentMovieDir, "MovieWithoutLinksButProtected.mkv"),
    join(fakeTorrentMovieDir, "MovieWithLinksButPreviouslyTaggedToDelete.mkv"),
    join(testTempDir, "completed", "Uncategorized.mkv"),
    join(testTempDir, "completed/other", "MovieFromUnwatchedCategory.mkv"),
  ]);

  // Create torrent series file
  mkdirsSyncRecursively([
    join(fakeTorrentSeriesDir, "SeriesWithLinks.S01"),
    join(fakeTorrentSeriesDir, "SeriesWithLinks.S02"),
    join(fakeTorrentSeriesDir, "SeriesWithoutLinksToDelete.S01"),
    join(fakeTorrentSeriesDir, "SeriesWithoutLinksButProtected.S04"),
  ]);
  writeFilesSyncWithRandomData([
    join(fakeTorrentSeriesDir, "SeriesWithLinks.S01/Episode 01.mkv"),
    join(fakeTorrentSeriesDir, "SeriesWithLinks.S01/Episode 02.mkv"),
    join(fakeTorrentSeriesDir, "SeriesWithLinks.S01/Episode 03.mkv"),
    join(fakeTorrentSeriesDir, "SeriesWithLinks.S02/Episode 01.mkv"),
    join(fakeTorrentSeriesDir, "SeriesWithLinks.S02/Episode 02.mkv"),
    join(fakeTorrentSeriesDir, "SeriesWithLinks.S02/Episode 03.mkv"),
    join(
      fakeTorrentSeriesDir,
      "SeriesWithoutLinksButProtected.S04/Episode 01.mkv"
    ),
    join(
      fakeTorrentSeriesDir,
      "SeriesWithoutLinksButProtected.S04/Episode 02.mkv"
    ),
    join(
      fakeTorrentSeriesDir,
      "SeriesWithoutLinksButProtected.S04/Episode 01.mkv"
    ),
    join(
      fakeTorrentSeriesDir,
      "SeriesWithoutLinksButProtected.S04/Episode 02.mkv"
    ),
    join(fakeTorrentSeriesDir, "SeriesWithoutLinksToDelete.S01/Episode 01.mkv"),
    join(fakeTorrentSeriesDir, "SeriesWithoutLinksToDelete.S01/Episode 02.mkv"),
  ]);

  // Create torrent cross-seed file
  mkdirsSyncRecursively([
    join(fakeTorrentCrossSeedDir, "SeriesWithLinks.S01.HardCopy1"),
  ]);
  writeFilesSyncWithRandomData([
    join(fakeTorrentCrossSeedDir, "MovieNoMoreLinked.HardCopy1.mkv"),
  ]);

  // Create radarr dirs
  mkdirsSyncRecursively([
    join(fakeRadarrDir, "MovieWithLinks"),
    join(fakeRadarrDir, "MovieWithLinksInAFolder"),
    join(fakeRadarrDir, "MovieWithoutLinksButUnwatchExtension"),
    join(fakeRadarrDir, "MovieWithoutHardLink"),
  ]);

  // Create cross-seed hard linked copy
  generateHardLinkCopies([
    {
      target: join(fakeTorrentMovieDir, "MovieWithLinks.mkv"),
      link: join(fakeTorrentCrossSeedDir, "MovieWithLinks.HardCopy1.mkv"),
    },
    {
      target: join(fakeTorrentMovieDir, "MovieWithLinks.mkv"),
      link: join(fakeTorrentCrossSeedDir, "MovieWithLinks.HardCopy2.mkv"),
    },
    {
      target: join(fakeTorrentMovieDir, "MovieWithLinks.mkv"),
      link: join(fakeTorrentCrossSeedDir, "MovieWithLinks.HardCopy3.mkv"),
    },
    {
      target: join(fakeTorrentSeriesDir, "SeriesWithLinks.S01/Episode 01.mkv"),
      link: join(
        fakeTorrentCrossSeedDir,
        "SeriesWithLinks.S01.HardCopy1/Episode 01.mkv"
      ),
    },
    {
      target: join(fakeTorrentSeriesDir, "SeriesWithLinks.S01/Episode 02.mkv"),
      link: join(
        fakeTorrentCrossSeedDir,
        "SeriesWithLinks.S01.HardCopy1/Episode 02.mkv"
      ),
    },
    {
      target: join(fakeTorrentSeriesDir, "SeriesWithLinks.S01/Episode 03.mkv"),
      link: join(
        fakeTorrentCrossSeedDir,
        "SeriesWithLinks.S01.HardCopy1/Episode 03.mkv"
      ),
    },
  ]);

  // Create radarr hard linked copy
  generateHardLinkCopies([
    {
      target: join(fakeTorrentMovieDir, "MovieWithLinks.mkv"),
      link: join(fakeRadarrDir, "MovieWithLinks/Movie.Link1.mkv"),
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
    join(fakeRadarrDir, "MovieWithoutHardLink/Movie.NoLink.mkv"),
  ]);

  // create sonarr dirs
  mkdirsSyncRecursively([
    join(fakeSonarrDir, "SeriesWithLinks/Season 01"),
    join(fakeSonarrDir, "SeriesWithLinks/Season 02"),
  ]);

  // create sonarr hard linked copy
  generateHardLinkCopies([
    {
      target: join(fakeTorrentSeriesDir, "SeriesWithLinks.S01/Episode 01.mkv"),
      link: join(
        fakeSonarrDir,
        "SeriesWithLinks/Season 01/Episode 01.Link1.mkv"
      ),
    },
    {
      target: join(fakeTorrentSeriesDir, "SeriesWithLinks.S01/Episode 02.mkv"),
      link: join(
        fakeSonarrDir,
        "SeriesWithLinks/Season 01/Episode 02.Link1.mkv"
      ),
    },
    {
      target: join(fakeTorrentSeriesDir, "SeriesWithLinks.S01/Episode 03.mkv"),
      link: join(
        fakeSonarrDir,
        "SeriesWithLinks/Season 01/Episode 03.Link1.mkv"
      ),
    },
    {
      target: join(fakeTorrentSeriesDir, "SeriesWithLinks.S02/Episode 01.mkv"),
      link: join(
        fakeSonarrDir,
        "SeriesWithLinks/Season 02/Episode 01.Link1.mkv"
      ),
    },
    {
      target: join(fakeTorrentSeriesDir, "SeriesWithLinks.S02/Episode 02.mkv"),
      link: join(
        fakeSonarrDir,
        "SeriesWithLinks/Season 02/Episode 02.Link1.mkv"
      ),
    },
    {
      target: join(fakeTorrentSeriesDir, "SeriesWithLinks.S02/Episode 03.mkv"),
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

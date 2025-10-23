import dotenv from "dotenv";
import {
  getAllTorrents,
  getMediaTorrentsToWatch,
  type TorrentFilterCriteria,
} from "./torrent";

main();

async function main() {
  dotenv.config();
  checkEnvironments();

  const clientOptions = {
    baseUrl: process.env.QBITTORRENT_BASE_URL,
    username: process.env.QBITTORRENT_USERNAME,
    password: process.env.QBITTORRENT_PASSWORD,
  };

  const allTorrents = await getAllTorrents(clientOptions);

  const watchedTorrents = await getMediaTorrentsToWatch(
    allTorrents,
    getTorrentsFilter()
  );

  //TODO Get files stats from Sonarr and Radarr
  //TODO Get orphan files by comparing files stats from Sonarr, Radarr and Torrents
  //TODO Set orphan tag to torrents
  //TODO Close connection
  //TODO Print a report
}

function checkEnvironments() {
  if (!process.env.QBITTORRENT_BASE_URL)
    throw new Error("QBITTORRENT_BASE_URL is not set in environment variables");

  if (!process.env.QBITTORRENT_USERNAME)
    throw new Error("QBITTORRENT_USERNAME is not set in environment variables");

  if (!process.env.QBITTORRENT_PASSWORD)
    throw new Error("QBITTORRENT_PASSWORD is not set in environment variables");

  if (!process.env.TORRENT_CATEGORIES)
    throw new Error("TORRENT_CATEGORIES is not set in environment variables");
}

function getTorrentsFilter(): TorrentFilterCriteria {
  const protectedTag =
    process.env.TORRENT_TAG_PROTECTED || "orphanarr.protected";
  const includeCategories = process.env.TORRENT_CATEGORIES?.split(",");
  return {
    categories: includeCategories,
    excludedTags: [protectedTag],
  };
}

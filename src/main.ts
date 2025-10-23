import { QBittorrent } from "@ctrl/qbittorrent";
import dotenv from "dotenv";
import { getMediaTorrentsToWatch } from "./torrent";

main();

async function main() {
  dotenv.config();
  checkEnvironments();

  const client = new QBittorrent({
    baseUrl: process.env.QBITTORRENT_BASE_URL,
    username: process.env.QBITTORRENT_USERNAME,
    password: process.env.QBITTORRENT_PASSWORD,
  });

  const protectedTag =
    process.env.TORRENT_TAG_PROTECTED || "orphanarr.protected";
  const includeCategories = process.env.TORRENT_CATEGORIES?.split(",");
  const torrentsFilter = {
    categories: includeCategories,
    excludedTags: [protectedTag],
  };

  const torrents = await client.listTorrents();

  const watchedMediaTorrents = await getMediaTorrentsToWatch(
    torrents,
    torrentsFilter
  );

  //TODO Get path from Sonarr and Radarr
  //TODO Get files stats from Sonarr and Radarr
  //TODO Add linked files to watched
  //TODO Get orphan files from watched
  //TODO Set orphan tag to torrents
  //TODO Print a report

  client.logout();
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

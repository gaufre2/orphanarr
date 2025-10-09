import { QBittorrent } from "@ctrl/qbittorrent";
import dotenv from "dotenv";
import { Torrents } from "./torrent";
import { WatchedMedias } from "./media";

main();

async function main() {
  dotenv.config();
  checkEnvironments();

  const client = new QBittorrent({
    baseUrl: process.env.QBITTORRENT_BASE_URL,
    username: process.env.QBITTORRENT_USERNAME,
    password: process.env.QBITTORRENT_PASSWORD,
  });

  const torrents = new Torrents(await client.listTorrents());

  const protectedTag =
    process.env.TORRENT_TAG_PROTECTED || "orphanarr.protected";
  const filter = {
    categories: process.env.TORRENT_CATEGORIES?.split(","),
    excludedTags: [protectedTag],
  };
  const watched = new WatchedMedias();
  watched.addMediaFromInfoTorrents(torrents.findMatchingTorrents(filter));

  //TODO Get files stats from torrents local filesystem
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

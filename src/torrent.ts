import { QBittorrent } from "@ctrl/qbittorrent";
import { FileMedia } from "./file";

export class TorrentClient {
  private client: QBittorrent;
  private fakeTorrents?: TorrentResponse[];

  constructor(options: ClientConfig, fakeTorrents?: TorrentResponse[]) {
    this.client = new QBittorrent(options);
    this.fakeTorrents = fakeTorrents;
  }

  async getTorrents(): Promise<Torrent[]> {
    let allTorrents: TorrentResponse[];
    if (this.fakeTorrents) {
      allTorrents = this.fakeTorrents;
    } else {
      allTorrents = await this.client.listTorrents();
    }

    return allTorrents.map((torrent) => new Torrent(torrent));
  }
}

export interface TorrentResponse {
  name: string;
  category: string;
  tags: string;
  content_path: string;
  hash: string;
}

export interface ClientConfig {
  baseUrl: string;
  username: string;
  password: string;
}

export class Torrent {
  readonly name: string;
  readonly category: string;
  readonly tags: string[];
  readonly contentPath: string;
  readonly hash: string;

  constructor(torrent: TorrentResponse) {
    this.name = torrent.name;
    this.category = torrent.category;
    this.tags = torrent.tags.split(",").map((item) => item.trim());
    this.contentPath = torrent.content_path;
    this.hash = torrent.hash;
  }
}

export async function getMediaTorrentsToWatch(
  torrents: Torrent[],
  criteria?: TorrentFilterCriteria
): Promise<MediaTorrent[]> {
  const mediaTorrents = await Promise.all(
    torrents
      .filter((torrent) => meetsAllCriteria(torrent, criteria))
      .map(async (filteredTorrent) => MediaTorrent.from(filteredTorrent))
  );
  return mediaTorrents;

  function meetsAllCriteria(
    torrent: Torrent,
    criteria?: TorrentFilterCriteria
  ): boolean {
    return (
      meetsCategoryRequirement(torrent, criteria) &&
      meetsTagExclusionRequirement(torrent, criteria)
    );
  }

  function meetsCategoryRequirement(
    torrent: Torrent,
    criteria?: TorrentFilterCriteria
  ): boolean {
    if (!criteria) return true;
    return (
      !criteria.categories || criteria.categories.includes(torrent.category)
    );
  }

  function meetsTagExclusionRequirement(
    torrent: Torrent,
    criteria?: TorrentFilterCriteria
  ): boolean {
    if (!criteria) return true;
    return (
      !criteria.excludedTags ||
      !criteria.excludedTags.some((tag) => {
        return torrent.tags.includes(tag);
      })
    );
  }
}

export class MediaTorrent {
  readonly torrent: Torrent;
  readonly mediaFiles: FileMedia[] | undefined;

  private constructor(torrent: Torrent, mediaFiles?: FileMedia[]) {
    this.torrent = torrent;
    this.mediaFiles = mediaFiles;
  }

  static async from(torrent: Torrent): Promise<MediaTorrent> {
    const mediaFiles = await FileMedia.collectMediaFiles(torrent.contentPath);
    return new MediaTorrent(torrent, mediaFiles);
  }
}

export type TorrentFilterCriteria = {
  categories?: string[];
  excludedTags?: string[];
};

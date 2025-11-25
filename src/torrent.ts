import {
  QBittorrent as QBittorrentClient,
  type Torrent as QBittorrentTorrent,
} from "@ctrl/qbittorrent";
import type { TorrentClientConfig } from "@ctrl/shared-torrent";
import { FileMedia } from "./file";

export class TorrentClient extends QBittorrentClient {
  fakeTorrents: QBittorrentTorrent[] | undefined;

  constructor(
    options?: Partial<TorrentClientConfig>,
    fakeTorrents?: QBittorrentTorrent[]
  ) {
    super(options);
    this.fakeTorrents = fakeTorrents;
  }

  async getTorrents(): Promise<Torrent[]> {
    let allTorrents: QBittorrentTorrent[];
    if (this.fakeTorrents) {
      allTorrents = this.fakeTorrents;
    } else {
      allTorrents = await this.listTorrents();
    }

    return allTorrents.map((torrent) => new Torrent(torrent));
  }
}

export class Torrent {
  readonly name: string;
  readonly category: string;
  readonly tags: string[];
  readonly contentPath: string;
  readonly hash: string;

  constructor(torrent: QBittorrentTorrent) {
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

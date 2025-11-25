import { QBittorrent, type Torrent } from "@ctrl/qbittorrent";
import type { TorrentClientConfig } from "@ctrl/shared-torrent";
import { FileMedia } from "./file";

export class TorrentClient extends QBittorrent {
  fakeTorrents: Torrent[] | undefined;

  constructor(
    options?: Partial<TorrentClientConfig>,
    fakeTorrents?: Torrent[]
  ) {
    super(options);
    this.fakeTorrents = fakeTorrents;
  }

  async listInfoTorrents(): Promise<InfoTorrent[]> {
    let allTorrents: Torrent[];
    if (this.fakeTorrents) {
      allTorrents = this.fakeTorrents;
    } else {
      allTorrents = await this.listTorrents();
    }

    return allTorrents.map((torrent) => new InfoTorrent(torrent));
  }
}

export class InfoTorrent {
  readonly name: string;
  readonly category: string;
  readonly tags: string[];
  readonly contentPath: string;
  readonly hash: string;

  constructor(torrent: Torrent) {
    this.name = torrent.name;
    this.category = torrent.category;
    this.tags = torrent.tags.split(",").map((item) => item.trim());
    this.contentPath = torrent.content_path;
    this.hash = torrent.hash;
  }
}

export async function getMediaTorrentsToWatch(
  torrents: InfoTorrent[],
  criteria?: TorrentFilterCriteria
): Promise<MediaTorrent[]> {
  const mediaTorrents = await Promise.all(
    torrents
      .filter((torrent) => meetsAllCriteria(torrent, criteria))
      .map(async (torrent) => MediaTorrent.from(torrent))
  );
  return mediaTorrents;

  function meetsAllCriteria(
    torrent: InfoTorrent,
    criteria?: TorrentFilterCriteria
  ): boolean {
    return (
      meetsCategoryRequirement(torrent, criteria) &&
      meetsTagExclusionRequirement(torrent, criteria)
    );
  }

  function meetsCategoryRequirement(
    torrent: InfoTorrent,
    criteria?: TorrentFilterCriteria
  ): boolean {
    if (!criteria) return true;
    return (
      !criteria.categories || criteria.categories.includes(torrent.category)
    );
  }

  function meetsTagExclusionRequirement(
    torrent: InfoTorrent,
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
  readonly info: InfoTorrent;
  readonly mediaFiles: FileMedia[] | undefined;

  private constructor(info: InfoTorrent, mediaFiles?: FileMedia[]) {
    this.info = info;
    this.mediaFiles = mediaFiles;
  }

  static async from(torrent: InfoTorrent): Promise<MediaTorrent> {
    const mediaFiles = await FileMedia.collectMediaFiles(torrent.contentPath);
    return new MediaTorrent(torrent, mediaFiles);
  }
}

export type TorrentFilterCriteria = {
  categories?: string[];
  excludedTags?: string[];
};

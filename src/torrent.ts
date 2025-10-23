import type { Torrent } from "@ctrl/qbittorrent";
import { FileMedia } from "./file";

export async function getMediaTorrentsToWatch(
  torrents: Torrent[],
  criteria?: TorrentFilterCriteria
): Promise<MediaTorrent[]> {
  const mediaTorrents = await Promise.all(
    torrents
      .filter((torrent) => meetsAllCriteria(new InfoTorrent(torrent), criteria))
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

  private constructor(torrent: Torrent, mediaFiles?: FileMedia[]) {
    this.info = new InfoTorrent(torrent);
    this.mediaFiles = mediaFiles;
  }

  static async from(torrent: Torrent): Promise<MediaTorrent> {
    const mediaFiles = await FileMedia.collectMediaFiles(torrent.content_path);
    return new MediaTorrent(torrent, mediaFiles);
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

export type TorrentFilterCriteria = {
  categories?: string[];
  excludedTags?: string[];
};

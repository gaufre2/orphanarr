import type { Torrent } from "@ctrl/qbittorrent";
import { FileMedia } from "./file";

export class Torrents {
  public readonly info: InfoTorrent[];

  constructor(torrents: Torrent[]) {
    this.info = torrents.map((torrent) => new InfoTorrent(torrent));
  }

  findMatching(criteria: TorrentFilterCriteria): InfoTorrent[] {
    return this.info.filter((torrent) =>
      this.meetsAllCriteria(torrent, criteria)
    );
  }

  private meetsAllCriteria(
    torrent: InfoTorrent,
    criteria: TorrentFilterCriteria
  ): boolean {
    return (
      this.meetsCategoryRequirement(torrent, criteria) &&
      this.meetsTagExclusionRequirement(torrent, criteria)
    );
  }

  private meetsCategoryRequirement(
    torrent: InfoTorrent,
    criteria: TorrentFilterCriteria
  ): boolean {
    return (
      !criteria.categories || criteria.categories.includes(torrent.category)
    );
  }

  private meetsTagExclusionRequirement(
    torrent: InfoTorrent,
    criteria: TorrentFilterCriteria
  ): boolean {
    return (
      !criteria.excludedTags ||
      !criteria.excludedTags.some((tag) => {
        return torrent.tags.includes(tag);
      })
    );
  }
}

export class MediaTorrent {
  public readonly info: InfoTorrent;
  public mediaFiles: FileMedia[] | undefined;
  torrent: Torrent;

  private constructor(torrent: Torrent, mediaFiles?: FileMedia[]) {
    this.info = new InfoTorrent(torrent);
    this.mediaFiles = mediaFiles;
    this.torrent = torrent;
  }

  static from(torrent: Torrent): MediaTorrent {
    return new MediaTorrent(torrent);
  }

  async collectMediaFiles(): Promise<MediaTorrent> {
    const mediaFiles = await FileMedia.collectMediaFiles(this.info.contentPath);
    return new MediaTorrent(this.torrent, mediaFiles);
  }
}

export class InfoTorrent {
  public readonly name: string;
  public readonly category: string;
  public readonly tags: string[];
  public readonly contentPath: string;
  public readonly hash: string;

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

import type { Torrent } from "@ctrl/qbittorrent";
import { FileMedia } from "./file";

export class MediaTorrents {
  readonly torrents: MediaTorrent[];

  constructor(torrents: Torrent[]) {
    this.torrents = torrents.map((torrent) => {
      return MediaTorrent.from(torrent);
    });
  }

  findMatching(criteria: TorrentFilterCriteria): MediaTorrent[] {
    return this.torrents.filter((torrent) =>
      this._meetsAllCriteria(torrent, criteria)
    );
  }

  private _meetsAllCriteria(
    torrent: MediaTorrent,
    criteria: TorrentFilterCriteria
  ): boolean {
    return (
      this._meetsCategoryRequirement(torrent, criteria) &&
      this._meetsTagExclusionRequirement(torrent, criteria)
    );
  }

  private _meetsCategoryRequirement(
    torrent: MediaTorrent,
    criteria: TorrentFilterCriteria
  ): boolean {
    return (
      !criteria.categories ||
      criteria.categories.includes(torrent.info.category)
    );
  }

  private _meetsTagExclusionRequirement(
    torrent: MediaTorrent,
    criteria: TorrentFilterCriteria
  ): boolean {
    return (
      !criteria.excludedTags ||
      !criteria.excludedTags.some((tag) => {
        return torrent.info.tags.includes(tag);
      })
    );
  }
}

export class MediaTorrent {
  readonly info: InfoTorrent;
  readonly mediaFiles: FileMedia[] | undefined;
  private readonly _torrent: Torrent;

  private constructor(torrent: Torrent, mediaFiles?: FileMedia[]) {
    this.info = new InfoTorrent(torrent);
    this.mediaFiles = mediaFiles;
    this._torrent = torrent;
  }

  static from(torrent: Torrent): MediaTorrent {
    return new MediaTorrent(torrent);
  }

  async collectMediaFiles(): Promise<MediaTorrent> {
    const mediaFiles = await FileMedia.collectMediaFiles(this.info.contentPath);
    return new MediaTorrent(this._torrent, mediaFiles);
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

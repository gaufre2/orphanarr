import type { Torrent } from "@ctrl/qbittorrent";
import { FileMedia } from "./file";

export class MediaTorrents {
  private _mediaTorrents: MediaTorrent[] = [];

  private constructor(torrents: MediaTorrent[]) {
    this._mediaTorrents = torrents;
  }

  static async from(torrents: Torrent[]): Promise<MediaTorrents> {
    const mediaTorrents = await Promise.all(
      torrents.map(async (torrent) => {
        return MediaTorrent.from(torrent);
      })
    );
    return new MediaTorrents(mediaTorrents);
  }

  all() {
    return this._mediaTorrents;
  }

  findMatching(criteria: TorrentFilterCriteria): MediaTorrent[] {
    return this._mediaTorrents.filter((torrent) =>
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

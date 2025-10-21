import type { MediaTorrent } from "./torrent";

export class WatchedMedia {
  public readonly medias: Media[];

  private constructor(medias: Media[]) {
    this.medias = medias;
  }

  static addMediaTorrents(torrents: MediaTorrent[]): WatchedMedia {
    return new WatchedMedia(torrents.map((torrent) => ({ torrent })));
  }
}

interface Media {
  readonly torrent: MediaTorrent;
}

import type { MediaTorrent } from "./torrent";

export class WatchedMedia {
  readonly medias: Media[];

  private constructor(medias: Media[]) {
    this.medias = medias;
  }

  static addMediaTorrents(mediaTorrents: MediaTorrent[]): WatchedMedia {
    return new WatchedMedia(mediaTorrents.map((torrent) => ({ torrent })));
  }
}

interface Media {
  readonly torrent: MediaTorrent;
}

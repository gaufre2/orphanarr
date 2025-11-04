# orphanarr

> [!IMPORTANT]
> 🚧 WIP 🚧

Detection of orphaned files caused by hard linking between qBittorrent and Radarr/Sonarr. Build using TDD methodology.

## Stack

- [Bun][bun]: TS Runtime
- [@ctrl/qbittorrent][@ctrl/qbittorrent]: qBittorrent API wrapper
- [tsarr][tsarr]: *arr API wrapper
- [ESLint][eslint]/[typescript-eslint][typescript-eslint]: Linter.
- [Prettier][prettier]: Code formatter.
- [Docker][docker]: Container engine.
- [Development Containers][devcontainer]: Container development.

[bun]: https://bun.sh/
[@ctrl/qbittorrent]: https://www.npmjs.com/package/@ctrl/qbittorrent
[tsarr]: https://www.npmjs.com/package/tsarr
[eslint]: https://eslint.org/
[typescript-eslint]: https://typescript-eslint.io/
[prettier]: https://prettier.io/
[docker]: https://www.docker.com/
[devcontainer]: https://containers.dev/

I chose external wrappers to keep maintenance to a minimum. Hoping the wrappers will stay under development 🤞.

## Credits

Highly inspired by this projects:
- [Cleanuparr](https://github.com/Cleanuparr/Cleanuparr)
- [decluttarr](https://github.com/ManiMatter/decluttarr)

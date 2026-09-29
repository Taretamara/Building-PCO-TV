# PCO TV media drop-in folder (real files replace generated stand-ins)

The app works with zero files here — artwork is generated and previews are
synthesized. Drop real media in and list it in `manifest.json`:

```json
{
  "artwork": { "m-001": "media/artwork/m-001.jpg" },
  "trailers": { "m-001": "media/trailers/m-001.mp4" },
  "previews": { "s-001": "media/previews/s-001.mp3" }
}
```

- `artwork/<id>.jpg` — card pictures (16:9 for messages/live, 1:1 for music).
  Ids: message `m-001`, program `p-…`, artist `a-…`, album `al-…`, playlist `pl-…`, live `l-…`.
- `trailers/<message-id>.mp4` — ~60s message trailers, played on hover.
- `previews/<song-id>.mp3` — ~8s music previews, played on hover.

Paths are relative to `apps/web/`. Test data only — licensed LoveWorld media required before any public release.

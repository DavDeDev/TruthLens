# TruthLens

<img src="https://truthlens.com/og.png" style="aspect-ratio:1.985"></img>

I built TruthLens for the Vercel + Nvidia 2-hour hackathon. It turns any YouTube video into a transcribed `.txt` file.

[**This project won first place in the hackathon 🏆**](https://x.com/FernandoTheRojo/status/1859848547316924465)

It's hosted at [truthlens.com](https://truthlens.com). However, YouTube has been rate limiting requests coming from the lambda, so if you want to use it, you'll have more luck running it locally.

If there's interest, maybe I can set up a self-hosted proxy or raspberry pi for the requests (until that inevitably gets rate limited).

## Local development

This project was made with Next.js, Tailwind (shadcn), v0, and Claude (through Cursor's composer).

```sh
yarn
```

```sh
yarn dev
```

### Builds

```sh
yarn build
```

Then open [http://localhost:3000](http://localhost:3000)

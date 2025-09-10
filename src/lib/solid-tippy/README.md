# solid-tippy

This was mostly forked from: https://github.com/lxsmnsyc/solid-tippy
It's not a library because I'm actively trying to make it better.
I already added some quality-of-life improvements to make this more usable with different usecases,
hopefully with the same and improved ergonomics as the React counterpart.

Improvements made:

- SSR-safe
- QoLs for easy usage. Just wrap your element with `<Tippy content="">My Element</Tippy>` and you're good to go.
- Improved props i.e. pass content as JSX, not just a string, etc.
- Made sure the important stuff is reactive as well, i.e. hide/show or make it interactive based on your usecases. As long as tippy has it covered.

**Why Tippy.js?**

Yes it's old, outdated, and unmaintained. But it's never failed me, and literally the only thing wanting me
to stop using it is either oversighted accessibility issues (because I'm not competent enough to be compliant for all, but I try) and the fact that it's unmaintained.
But I realized that's not enough reason to stop using it, so I will.

I did explore a lot of other 'up-to-date' options...

- Kobalte's Tooltip is way too limited, I could not customize beyond the basics (i.e. follow cursor, animations, interactive content vs non-interactive content, granularly specifying triggers, etc.). Also component composition for a single Tooltip is crazy work--but always remedied that with the <\*Comp /> component patterns I implemented in solid-launch which imitate AntD's ergonomic and reusable usage but with the flexibility of Shadcn.

- Ark UI is actually perfect for the tooltip (it has follow cursor, flipping, etc.), but didn't explore it enough. The only thing that held me back was the lack of shadcn-like component libraries for it. I felt like installing it would just make me want to rebuild everything Kobalte has. I just want a tooltip.

- Floating UI - too low-level, lack out-of-the-box solid.js support/resources.

## Usage

1. Make sure to install tippy.js, that's it.
2. Make sure to import the tippy.css in the root of your app (`+Layout.tsx`)

## Customizations

1. Animations - Edit the `tippy.css`. I already added scale-subtle as a default, feel free to customize based on the resources there.
2. Themes - i.e. making stuff transparent or using the presets. Edit `tippy.css` and read the docs: https://atomiks.github.io/tippyjs/v6/themes/.

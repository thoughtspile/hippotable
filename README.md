# [🦛 Hippotable](https://blog.thoughtspile.tech/hippotable/)

Hippotable is a simple tool to work with data in the browser. Your data is never sent to a third-party server, protecting your privacy and saving bandwidth. All processing happens in-memory to ensure great performance and real-time feedback. Try it now at [blog.thoughtspile.tech/hippotable](https://blog.thoughtspile.tech/hippotable/)

![](./docs/hippotable.png)

Features:

- 📦 Open CSV files — tested with datasets up to 100 Mb.
- 🚀 Clean and efficient UI lets you scroll though thousands of rows.
- 🔎 Filter and sort your data without delay.
- 👩‍🔬 Aggregate / groupby data to gain deeper insights.
- 🏗️ Build powerful data pipelines with multiple filter / aggrefate steps.
- 💾 Share results with CSV export.
- 💯 Free and open-source.

## Running locally

Clone this repository, then:

```sh
npm ci
npm run dev
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md)

## Acknowledgements

[Arquero](https://github.com/uwdata/arquero) provides the solid dataframe foundation — thanks to [Jeffrey Heer](https://twitter.com/jeffrey_heer) and all the contributors!

[SolidJS](https://github.com/solidjs/solid/) gives us the good developer experience with the performance of vanilla DOM — great work by [Ryan Carniato](https://twitter.com/RyanCarniato) and the team.

Last but not least, [TanStack virtual](https://github.com/TanStack/virtual) by [Tanner Linsley](https://twitter.com/tannerlinsley) gives us powerful table virtualization — and is one of the few projects that support SolidJS.

[Finos perspective,](https://github.com/finos/perspective) especially its [datagrid component](https://perspective.finos.org/block/?example=editable) was a big influence on hippotable. Perspective has a more integrated design, while hippotable goes with a more modular setup, leveraging other open-source projects under the hood. Hippotable is also designed with multi-layer analysis (aggregate-filter-aggregate) in mind, and should eventually support operations spanning multiple tables.

## License

[GPLv3 License](./LICENSE)

Built in 2023 by [Vladimir Klepov](https://blog.thoughtspile.tech/)

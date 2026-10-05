# Alessio Adamini

Sito personale di presentazione — **<https://adamini-a.github.io>**

Senior Software Developer a Torino. Back-end PHP e Symfony, front-end React e
Flutter, automazione in Python, gestione di server Linux.

Sito statico: nessuna dipendenza esterna, nessun tracciamento, nessuna chiamata
a servizi di terze parti. I font sono inclusi nel repository.

## Com'è fatto

Una pagina sola, scritta a mano. Niente build step, niente npm, niente CDN.

```
docs/
├── index.html              la pagina
├── portfolio/index.html    il portfolio per tema
├── assets/
│   ├── css/main.css        foglio di stile principale, token in :root
│   ├── css/portfolio.css   solo i componenti in più del portfolio
│   ├── js/main.js          vanilla, nessuna dipendenza
│   ├── fonts/              Inter + Space Grotesk, subset latin, woff2
│   └── img/og-image.png
├── media/                  il CV in PDF
├── robots.txt sitemap.xml
└── .nojekyll
```

I font sono serviti dal dominio: il sito non chiama Google, che è quel che
serve lato GDPR.

Il tema chiaro/scuro segue le preferenze di sistema e si può forzare dal
pulsante nell'header; la scelta resta in `localStorage`.

## Lavorarci

```sh
python3 -m http.server -d docs 8412     # anteprima su http://localhost:8412
```

Si modificano direttamente i file in `docs/`. Quando cambiano i contenuti,
aggiornare a mano il `<lastmod>` in `docs/sitemap.xml`.

```sh
git add -A && git commit -m "…" && git push
```

GitHub Pages ripubblica da solo a ogni push, da `main` + `/docs`.

> Fino a settembre 2026 i contenuti si scrivevano con un WordPress locale e un
> esportatore statico. Quell'impalcatura è stata rimossa: per una pagina sola di
> contenuti fissi costava più di quanto rendesse.

## Portfolio

`docs/portfolio/` rilegge le repository private della home per tema (linguaggi,
database, ecosistema web, sicurezza, API, server, automazioni). Usa gli stessi
token, font e `main.js` della home; `portfolio.css` aggiunge solo indice,
schede e matrice.

Regole per aggiungere una scheda:

- il cliente resta una **sigla**, con settore e periodo; mai nomi, domini,
  screenshot o dettagli che permettano di risalirci;
- si scrive solo ciò che è stato fatto davvero: niente esempi di comodo;
- la stessa sigla della home, se il progetto c'è già;
- aggiornare il conteggio nell'indice (`area-link__count`) e il pallino nella
  matrice.

I temi senza ancora un caso documentato sono segnati da commenti
`DA COMPLETARE` nell'HTML.

## Privacy

La pagina espone **email, LinkedIn e città**. Sono volutamente esclusi il
numero di telefono e l'indirizzo di casa. Il PDF del CV pubblicato in
`docs/media/` è la versione senza recapiti privati.

## Contatti

- **Email** — aadamini2@gmail.com
- **LinkedIn** — <https://www.linkedin.com/in/alessio-adamini-a20788132>

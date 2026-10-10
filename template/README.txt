HOW MUCH?! — TEMPLATE VIDÉO DE PRIX (9:16, 10 s, 30 i/s)
=========================================================

Ce dossier contient tout ce qu'il faut pour refaire les vidéos « Döner à Vienne » et
« Krügerl à Vienne » (créées le 8 octobre 2026), et en faire de nouvelles pour n'importe
quel produit ou ville de l'app.


1. COMMENT S'EN SERVIR AVEC CLAUDE
----------------------------------
Dans un nouveau chat (dans le projet HOWMUCH ou ailleurs) :
  1. Joins ce fichier .zip au message.
  2. Demande par exemple : « Avec ce template, fais la vidéo Spritzer à Vienne ».
Claude dézippe, récupère les prix dans la base HOW MUCH (connecteur Lovable),
écrit les données et les textes, fait le rendu et te renvoie le MP4.


2. CE QU'IL Y A DEDANS
----------------------
src/howmuch/PriceVideo.tsx   La vidéo (4 scènes) — un seul composant pour tous les produits
src/howmuch/copy.ts          Les textes de chaque vidéo (bière, Döner)
src/howmuch/data.ts          Données Döner im Brot, Vienne (21 prix) + calcul des stats
src/howmuch/data-beer.ts     Données Krügerl 0,5 l, Vienne (70 lieux)
src/howmuch/brand.ts         Couleurs et polices reprises du code de l'app
src/howmuch/index.tsx        Liste des vidéos (une « composition » par vidéo)
public/howmuch/fonts/        Space Grotesk + JetBrains Mono (licence OFL, via Fontsource)
public/howmuch/sfx/          Bruitages (Kenney, licence CC0 = libres de droits)
data/                        Exports bruts de la base utilisés pour les vidéos


3. LES 4 SCÈNES
---------------
1. Accroche (0–2,5 s) : la question + un compteur de prix qui défile et s'arrête sur « ?,?? € »
2. Les données (2,5–6 s) : chaque prix réel tombe en point sur un graphique, médiane,
   moins cher / plus cher avec leur code postal
3. Le rebondissement (6–8 s) : phrases choc + pourcentage d'écart + tampon « WERDEN WIR VERARSCHT? »
4. Fin (8–10 s) : logo, howmuch.live, « Was zahlst DU? » pour faire commenter, source des données


4. FAIRE UNE NOUVELLE VIDÉO
---------------------------
a) Les données : une liste { name, plz, price } — un seul prix par lieu (le plus récent),
   une seule taille comparable. Définitions utilisées (les mêmes que le Video Studio de l'admin) :
     bière      = product 'beer',  variant 'draft_large' (0,5 l pression)
     Döner      = product 'kebab', variant 'sandwich'
     pizza      = pizza entière
b) Les textes dans copy.ts. Raccourcis remplis automatiquement :
     {n} nombre de prix · {min} {max} {median} en € · {pct} écart · {minPlz} {maxPlz}
     *mot* = mot en couleur (vert dans l'accroche, jaune dans la question de fin)
   Si « punchLines » est vide, la scène 3 met le pourcentage en vedette (version Döner).
c) Ajouter une ligne <Composition> dans index.tsx, puis lancer le rendu.

Règles à garder :
- Jamais de prix inventé : tous les chiffres viennent de la base.
- Le plus cher n'est jamais nommé dans la vidéo, seulement son code postal.
- Vérifier le prix le plus bas et le plus haut avant de poster (un 0,3 l saisi comme 0,5 l
  suffit à fausser le rebondissement).


5. RÈGLES DE MOTION (tirées des skills Remotion et HyperFrames)
---------------------------------------------------------------
- Tempo 120 BPM : chaque frappe tombe sur une demi-seconde (15 images), pour caler la vidéo
  sur un son tendance du même tempo.
- Vraies transitions entre scènes (glissement, balayage, fondu).
- Une entrée différente par phrase (impact, glissement latéral, montée), avec flou de mouvement.
- Compteurs : ralentissement marqué à la fin, le chiffre grossit en comptant,
  chiffres à largeur fixe pour qu'ils ne tremblent pas.
- Halo lumineux discret derrière les éléments forts.
- Zones sûres TikTok/Reels respectées : rien d'important sous 1 500 px ni à droite de 930 px.


6. NOTES TECHNIQUES (pour Claude ou un dev)
-------------------------------------------
Installation :  npm install
Aperçu :        npm run studio
Rendu :         npx remotion render src/howmuch/index.tsx HowMuchBierWien out/bier.mp4 --codec=h264 --crf=18

Dans l'espace de travail cloud de Claude, le navigateur que Remotion télécharge d'habitude
est bloqué. Contournement testé :
  npm install @sparticuz/chromium  →  node -e "require('@sparticuz/chromium').default.executablePath().then(console.log)"
  puis ajouter  --browser-executable=/tmp/chromium  aux commandes de rendu.
Les polices sont chargées en local (pas de Google Fonts), donc aucun accès réseau n'est
nécessaire pendant le rendu.

Versions : remotion 4.0.484, @remotion/transitions 4.0.484, React 18.

Licences :
- Polices Space Grotesk et JetBrains Mono : SIL Open Font License (fichiers LICENSE inclus).
- Bruitages : packs Kenney (kenney.nl), Creative Commons Zero — usage commercial autorisé.

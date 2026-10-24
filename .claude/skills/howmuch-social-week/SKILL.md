---
name: howmuch-social-week
description: Prépare et programme les posts HOW MUCH?! sur Instagram et TikTok (Reels de prix, carte à trous, défi du mois, bilan mensuel, réclamation de fiche) avec les vrais prix de la base, le template vidéo et Metricool. À utiliser pour « prépare la semaine », « nouveaux posts », « mets à jour les posts », « bilan du mois », « défi du mois ».
---

# HOW MUCH?! · posts Instagram et TikTok

Objectif du compte @howmuch.live : faire venir des **contributeurs** (des gens qui ajoutent des prix sur howmuch.live), pas seulement des abonnés. Chaque post finit par une action : trouver le lieu sur la carte, ajouter un prix, commenter son Bezirk.

Réponds à Hugues en français, direct et honnête.

## Outils et accès

- **Base de données** : connecteur Lovable, `query_database`, projet `17cb4adf-2999-46ad-a0b9-a9cf74e4894a` (tables `places`, `place_prices`). Lecture seule, jamais d'écriture.
- **Template vidéo** : dépôt GitHub `Hugues000-bit/h.m.09.10.26`, dossier `template/` (Remotion 4.0.484, React 18). Ajouter le dépôt avec `add_repo` (accès push), cloner, `npm install` dans `template/`.
- **Hébergement des médias** : même dépôt, dossier `AAAA-MM/`. Les liens publics sont `https://raw.githubusercontent.com/Hugues000-bit/h.m.09.10.26/main/<chemin>`. Toujours donner un **nouveau nom de fichier** à une version refaite (suffixe `-vMMDD`), sinon le cache renvoie l'ancienne.
- **Programmation** : connecteur Metricool, marque `blogId 7319232` (Instagram howmuch.live), fuseau `Europe/Vienna`. Metricool copie les médias chez lui au moment de la programmation.
- **Rendu** : `npx remotion render src/howmuch/index.tsx <Id> out.mp4 --codec=h264 --crf=18 --browser-executable=<chromium headless_shell>`. Dans l'espace cloud : `/opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell`. Couvertures : `npx remotion still ... --frame=N` avec N = 10 pour `PriceVideo`, 0 pour `GapMap` / `GapKruegerl`, 55 pour `CheapestKruegerl` / `CheapestCappuccino` / `ChallengeKruegerl`, 0 pour `QuizCappuccino`, 120 pour `Monthly`, 210 pour `ClaimBar`/`ClaimCafe`.

## Données : les règles

- Un seul prix par lieu : le plus récent (`distinct on (place_id, product, variant) order by created_at desc`), `status='active'` sur le prix et le lieu, ville Vienne.
- Une seule taille comparable par vidéo : Krügerl = `beer/draft_large`, Seidl = `beer/draft_small`, Döner = `kebab/sandwich`, Weißer Spritzer = `spritzer/weisser`, Aperol = `spritzer/aperol`, Cappuccino = `coffee/cappuccino`, Burger = `burger/craft`, Pizza = `pizza/whole`.
- Bezirk : code postal de l'adresse (`\m1(0[1-9]|1\d|2[0-3])0\M`), sinon position GPS dans les contours officiels (`template/data/vienna-districts.geo.json`, data.wien.gv.at, CC BY 4.0 : toujours citer la source).
- **Au moins 12 lieux** par Reel. En dessous, choisir un autre produit ou une zone plus large.
- **Pas de moyenne ni de médiane** dans les posts (choix de Hugues). Seulement des prix réels : le moins cher, le plus cher, l'écart en %, le nombre de lieux. Le template a `showMedian: false`.
- **Le lieu le plus cher n'est jamais nommé**, seulement son code postal. Le moins cher n'est pas nommé non plus dans la vidéo : la réponse est sur howmuch.live (« Where's the 4,50 € one? »).
- **Éviter un produit dont le prix le plus cher est celui de Limon** (le lieu de travail de Hugues).
- **Signaler avant de programmer** : un prix minimum ou maximum isolé (très loin des suivants), plus vieux que 6 mois, ou probablement d'une autre taille. Un Reel dont l'accroche repose sur un prix douteux part en **brouillon** (`draft: true`) tant que Hugues ne l'a pas vérifié.

## Format et calendrier

- **3 Reels par semaine** : lundi 12 h 00, mercredi 12 h 30, vendredi 12 h 30.
- **Pas de stories** (choix de Hugues, 22/10 : trop de travail à la main). Ne pas en programmer, ne pas en proposer.
- **Thème** : séries de 4 Reels sombres puis 4 clairs (`theme: "light"` dans la copie, couleurs du mode jour de l'app). Garder le compte d'un mois sur l'autre en regardant les posts déjà programmés.
- **Langue** : anglais en grand, allemand en petit dessous (`hookDe`, `dataDe`, `pctDe`, `stampDe`, `ctaDe`). Les mots viennois (Krügerl, Bezirk, G'spritzter) ne se traduisent pas.
- **Varier les produits** : pas deux Reels du même produit dans la même semaine si on peut l'éviter.
- Formats disponibles dans le template :
  - `PriceVideo` (8 s, version du 19/10) : image 0 = le prix **le plus cher** en rose + « ?,?? € » jaune « CHEAPEST? GUESS ↓ » + la ligne `clash` (« for a Krügerl in the 15th. ») ; à 1 s le moins cher tombe en vert ; puis les points, le %, le tampon, « Where's the {min} one? » avec une ligne d'envoi (`ctaSub` « 📩 Send this to your … » + `ctaDe`) ; les 9 dernières images reviennent à l'image 0 (boucle parfaite). Couverture = image 0. Copies dans `copy-week.ts` (chaque copie : `clash`, `clashDe`, `ctaSub`, `ctaDe`), données dans `data-week.ts`, compositions dans `index.tsx`.
  - Règles tirées des stats et des études virales : la décision se fait en ~1,7 s, viser plus de 60 % de gens après 3 s ; temps de visionnage et envois en message privé pèsent le plus (un envoi vaut 3 à 5 likes) ; les revisionnages comptent (d'où la boucle) ; son original (nos effets sonores). Légende : ne jamais donner le prix le moins cher dans la première ligne (« X € at the priciest. Guess the cheapest before it drops 👇 »).
  - `GapMap` (9 s, clair, version du 22/10) : carte complète dès l'image 0 (vert = 6 lieux et plus, jaune = 1 à 5 avec le nombre, rose = 0) + « Is your Bezirk on the map? » ; puis les Bezirke à 0, puis ceux à moins de 6, « Be the first in your Bezirk », fin « Add one price · Comment your Bezirk ». Couverture = image 0. Recalculer les comptes dans `gapmap-data.ts`.
  - `CheapestKruegerl` / `CheapestCappuccino` (`CheapestMap.tsx`, 9 s) : grille des 23 Bezirke (placée à peu près comme la ville), le prix le plus bas par Bezirk, « ? » rose sans données ; #1 mis en avant (Bezirk nommé, jamais le lieu) ; fin « Save this 📌 · howmuch.live · Your Bezirk is a ? Add one price ». Fait pour être enregistré et envoyé (la carte à trous a eu des enregistrements sur TikTok). Données : requête dernier prix par lieu pour un produit+variante, groupée par code postal ou GPS, dans `data/cheapest/AAAA-MM-JJ.json`, puis `python3 -I scripts/cheapest_data.py <json>`. Couverture image 55. Version café pour TikTok (pas d'alcool).
  - `Monthly` : le bilan du mois (voir plus bas).
  - `ClaimBar` / `ClaimCafe` : la réclamation de fiche pour les commerçants (voir plus bas).
  - `GapKruegerl` (`GapMap` avec `mode: "kruegerl"`, 9 s, sombre) : carte des Bezirke selon le nombre de lieux avec un prix de Krügerl (rose = 0, jaune = 1 ou 2, vert = 3 et plus, l'objectif bonus du défi). Accroche « N Bezirke. No Krügerl price. » / « Kein einziger Krügerl-Preis. », puis « Is yours one of them? », les Bezirke à un seul lieu, « Let's fill it by 30 Nov. », fin « Snap the menu · howmuch.live · Comment BEER ». Données : set `KRUEGERL` de `cheapest-data.ts`.
  - `ChallengeKruegerl` (`CheapestMap` avec `challenge: true`) : la grille du défi, « X/23 Bezirke have a Krügerl price », #1, « Who takes Simmering? » (le Bezirk manquant mis en avant : Simmering s'il manque, sinon le premier), fin « Snap the menu. Comment BEER ». Quand les 23 sont remplis, le 3e bloc devient « The map is full. Danke! ».
  - `QuizCappuccino` (`PriceQuiz.tsx`, 9 s) : question + 3 réponses dès l'image 0, compte à rebours 3-2-1, réponse en vert, puis « Cheapest? X € » et « Where's the X € one? ». Fait pour les commentaires (A, B ou C). Props : `question`, `options`, `answer`, `cheapest`, `n`. Aucun lieu nommé.
  - **Carrousel « comment marche l'app »** (`template/carousel/make_app_carousel.py`, 6 diapos, Instagram 1080x1350 et TikTok photo 1080x1920) : vraies découpes d'une capture de howmuch.live (carte, filtres de catégorie, « Latest additions », bouton « Add a price »), jamais d'interface inventée. Capture : `get_project` du connecteur Lovable renvoie une capture ordinateur 1920x1080 (le site et l'aperçu sont bloqués depuis l'espace cloud). Ne pas utiliser la liste de gauche (points rouges « cher » à côté de noms de lieux) ni la barre « Typical prices » (= une moyenne). Version TikTok sans les filtres alcool. Publié le 25/10 : à épingler en haut du profil.
- Idées de formats suivants pour faire contribuer : « Know a cheaper one? Add it and take #1 », « Still true? » (un prix daté, à confirmer ou corriger), un tuto de 10 s pour ajouter un prix (à épingler), et plus tard le merci aux contributeurs.

## Légende (modèle)

```
<Produit> in <lieu>: <min> or <max>? <phrase courte> <emoji>

<n> places compared. Want the 3 cheapest? 💬 Comment <MOTCLÉ> and we DM you the list.
📩 Send this to <la personne précise à qui l'envoyer>.

🇦🇹 <Le même message, court, en allemand>. Kommentier <MOTCLÉ>, wir schicken dir den Link per DM <emoji>

#wien #<bezirk ou produit> #<produit> #vienna #howmuch
```

5 hashtags au maximum. Premier commentaire : `💬 Comment <MOTCLÉ> → we DM you the list / Kommentier <MOTCLÉ> → Link per DM`.

## Commentaire → message privé (ManyChat, réglé par Hugues)

Chaque Reel Instagram demande de commenter un mot-clé ; ManyChat répond en public (« Sent you a DM 📩 », 3 variantes) et envoie le lien en message privé avec un bouton. Je ne peux pas me connecter à ManyChat : pour un nouveau mot-clé, donner à Hugues le mot-clé, le texte du message et le lien.

| Mot-clé | Lien (bouton du message) |
|---|---|
| COFFEE | `https://www.howmuch.live/coffee/vienna?v=cappuccino&utm_source=instagram&utm_medium=dm` |
| BEER | `https://www.howmuch.live/beer/vienna?v=draft_large&utm_source=instagram&utm_medium=dm` |
| BURGER | `https://www.howmuch.live/burger/vienna?v=craft&utm_source=instagram&utm_medium=dm` |
| SPRITZER | `https://www.howmuch.live/spritzer/vienna?v=weisser&utm_source=instagram&utm_medium=dm` |
| DONER | `https://www.howmuch.live/kebab/vienna?v=sandwich&utm_source=instagram&utm_medium=dm` |
| carte à trous, bilan | n'importe quel commentaire sur ce Reel précis (à régler après la publication) → `https://www.howmuch.live/?utm_source=instagram&utm_medium=dm` |

Page d'un produit : `https://www.howmuch.live/<item>/vienna?v=<variante>` (top 3 des moins chers, par Bezirk, bouton « ajouter un prix »). Ne pas utiliser un mot-clé qui n'existe pas encore dans ManyChat sans prévenir Hugues : sinon les commentaires restent sans réponse.

## Déroulé

1. Lire les posts déjà programmés dans Metricool (`getScheduledPosts`) pour connaître les créneaux libres et le thème (sombre ou clair) en cours.
2. Interroger la base, choisir les produits et les zones selon les règles ci-dessus, et lister les prix à vérifier.
3. Écrire les données et les copies, rendre les vidéos, puis **regarder des images clés** (accroche, points, %, fin) pour vérifier les débordements de texte et les chevauchements.
4. Envoyer sur GitHub (nouveaux noms de fichiers), vérifier que chaque lien répond 200.
5. Programmer dans Metricool (`instagramData.type = "REEL"`, `videoThumbnailUrl` = la couverture), ou mettre à jour les posts existants (`updateScheduledPost` avec le contenu complet).
6. Répondre à Hugues avec un tableau date / post / statut, puis les prix à vérifier et les mots-clés ManyChat à créer, en une ou deux lignes.

Quand Hugues dit qu'il a modifié la base : refaire l'étape 2 pour tous les posts à venir, ne refaire que les vidéos dont les chiffres ont changé, et les remplacer dans Metricool sans changer les dates.

## Défi du mois : Krügerl, novembre 2026

Plan complet dans le document du projet `claude/howmuch-defi-krugerl-novembre.md` : le lire avant de préparer une semaine de novembre.

**Le principe.** Remplir les 23 Bezirke avec au moins un prix de Krügerl (`beer/draft_large`) entre le lundi 2 et le dimanche 29 novembre 2026. Au 23 octobre, 11 Bezirke ont un prix. Il manque les 5, 10, 11, 12, 13, 14, 18, 19, 20, 21, 22 et 23. Le but est de faire **contribuer** les gens.

**Accroche du défi :** « In 12 Wiener Bezirken weiß niemand, was ein Krügerl kostet. » La partie « 12 » est à recalculer chaque semaine.

**Argument pour participer :** « Du sitzt eh im Lokal? Foto von der Karte, die App liest die Preise. 20 Sekunden. »

**Calendrier Instagram, sur les créneaux habituels** (programmé le 23/10)

| Date | Post | Format | État |
|---|---|---|---|
| Lun. 2 nov. 12 h | Bilan d'octobre + ligne « November: Krügerl-Challenge – 12 Bezirke fehlen. Kommentier BEER. » | `Monthly` | brouillon, à refaire le 1er |
| **Mer. 4 nov. 12 h 30** | **Lancement du défi.** Hugues met de la pub sur ce Reel (environ 4 €/jour pendant 7 jours, Vienne, 18-35 ans, objectif visites du site). | `GapKruegerl` | programmé ; recompter le 2 ou 3 nov. et refaire la vidéo si un Bezirk a changé |
| Ven. 6 nov. 12 h 30 | Réclamation de fiche (déplacé du 4 nov.) | `ClaimBar` | programmé |
| Lun. 9, 16 et 23 nov. 12 h | Avancement : « X/23 Bezirke », nouveaux, manquants, « Who takes <Bezirk>? » | `ChallengeKruegerl` | brouillons avec la vidéo du 23/10 : recalculer et refaire chaque lundi matin |
| Lun. 30 nov. 12 h | Résultat final : le Krügerl le moins cher par Bezirk | `CheapestKruegerl` (ou carrousel nommé si Hugues valide l'exception) | brouillon |

- Les autres créneaux (mercredi et vendredi) gardent les Reels habituels.
- Ajouter une dernière ligne à leur légende : « 🍺 Krügerl-Challenge: X/23 Bezirke · Kommentier BEER ».
- Ne pas faire deux Reels Krügerl la même semaine, en plus du post d'avancement.

**Mot-clé ManyChat :** `BEER`, qui existe déjà et envoie vers la page Krügerl. Aucun nouveau mot-clé à créer.

**TikTok, toujours sans alcool**
- `CheapestCappuccino` une fois au début du mois (sam. 31 oct. 19 h, brouillon) et une fois à la fin (sam. 28 nov., brouillon).
- Quiz : **il n'y a aucun prix de Melange dans la base** (vérifié le 23/10). Le quiz se fait donc sur le cappuccino (`QuizCappuccino`, 107 lieux, 3,00 € à 7,50 €), jeu. 5 nov. 12 h 30, en brouillon tant que le 3,00 € de Neubau n'est pas vérifié.
- Le reste du calendrier TikTok ne change pas.

**Règles, inchangées pendant le défi**
- Pas de moyenne ni de médiane.
- Le lieu le plus cher n'est jamais nommé.
- Le lieu le moins cher n'est pas nommé dans les vidéos : la réponse est sur howmuch.live.
- Le Krügerl respecte la règle Limon : Limon n'a pas de prix de Krügerl.
- **Exception possible, seulement si Hugues la valide :** au bilan du 30 novembre, un carrousel qui nomme et identifie le lieu le moins cher de chaque Bezirk. Sans son accord, publier la grille finale sans les noms.

**Données de la semaine** (requête « dernier prix par lieu » sur `beer/draft_large`, groupée par code postal sinon GPS → `data/cheapest/AAAA-MM-JJ.json` → `python3 -I scripts/cheapest_data.py` → rendre `ChallengeKruegerl` et, pour le lancement, `GapKruegerl` avec la `date` du jour)
- Bezirk : code postal, sinon position GPS dans les contours. Environ 30 adresses n'ont pas de code postal (par exemple The Look Bar, 1010).
- Signaler les prix de plus de 6 mois dans les Bezirke à un seul lieu (2e, 3e et 4e : prix de mars et avril).
- Donner chaque lundi à Hugues : le compte X/23, les Bezirke nouveaux, ceux qui manquent, le nombre de prix ajoutés pendant le défi et le nombre de contributeurs autres que l'admin.

## TikTok (compte howmuch.live, relié à Metricool)

- **Aucun produit avec alcool sur TikTok** (contrainte de Hugues) : pas de bière, Spritzer, vin, cocktail. Seulement café, nourriture, boissons sans alcool, et la carte à trous.
- **3 vidéos par semaine : mardi, jeudi et samedi**, en décalé avec Instagram. 12 h 30 par défaut ; test à 19 h en cours depuis la semaine du 26/10 (Döner 27/10, carte cappuccino 31/10) : comparer les vues avant de généraliser. Hugues répond aux commentaires dans l'heure.
- Mêmes vidéos que les Reels quand le produit est sans alcool, sinon des vidéos dédiées (fichiers `tt-*`).
- `providers: [{"network":"tiktok"}]`, et **`tiktokData.title` est obligatoire** (la question courte, par exemple « Schnitzel in Vienna: 10,90 € or 39,90 €? »). `isAigc: false`, `privacyOption: "PUBLIC_TO_EVERYONE"`.
- Légende comme une recherche : le mot-clé au début (« schnitzel prices in vienna: … »), puis « where's the X one? → howmuch.live », une ligne en allemand et 5 hashtags au plus. Pas de « link in bio » (lien de profil limité sur TikTok) ni de mot-clé ManyChat (Instagram seulement).
- Pour les grandes fourchettes de prix (plus de 12 €), le template regroupe les prix par tranches de 1 à 2 € pour que les points restent lisibles.

## Bilan mensuel (composition `Monthly`, `MonthlyMap.tsx`)

Publié le 1er lundi du mois (Instagram 12 h) et le mardi suivant (TikTok 12 h 30 : pas d'alcool à l'écran, OK). Mardi/jeudi/samedi restent les jours TikTok habituels. Programmer les deux en **brouillon** pendant le mois, puis refaire chiffres et vidéo le 1er et les sortir du brouillon.
Contenu : Bezirke actifs du mois (+prix, +lieux), top 5 avec barres, hausses et baisses au même lieu, prix confirmés par les commerçants, Bezirke encore à 0, « Next update: <date> ». Légende : les totaux, les 3 Bezirke les plus actifs, les Bezirke à 0, « Comment your Bezirk ».
1. Rafraîchir les comptes cumulés par Bezirk dans `gapmap-data.ts` (requête « lieux avec prix », code postal sinon GPS).
2. Requête du mois (remplacer les dates) :
   ```sql
   with v as (select p.id, p.created_at, coalesce(substring(address from '\m1(0[1-9]|1\d|2[0-3])0\M'), round(lat::numeric,5)||','||round(lng::numeric,5)) loc
     from places p where lat between 48.11 and 48.33 and lng between 16.17 and 16.59 and status='active'
     and exists (select 1 from place_prices x where x.place_id=p.id and x.status='active'))
   select v.loc, count(distinct v.id) filter (where v.created_at >= 'DEBUT' and v.created_at < 'FIN') new_places,
     count(pp.id) filter (where pp.created_at >= 'DEBUT' and pp.created_at < 'FIN') prices
   from v left join place_prices pp on pp.place_id=v.id and pp.status='active' group by 1
   ```
   `place_prices.created_at` = date du prix (les imports sont antidatés), pas la date de saisie.
3. Prix confirmés par les commerçants : `count(*) where submitted_as_owner and created_at` dans le mois. Hausses et baisses : comparer seulement le **même lieu + produit + variante** (`lag(price) over (partition by place_id, product, coalesce(variant,'') order by created_at)`). Jamais de moyenne de la ville : elle bouge selon les lieux ajoutés, pas selon les vrais prix.
4. Écrire `template/data/monthly/AAAA-MM.json` (voir 2026-10.json), lancer `python3 -I scripts/monthly_data.py data/monthly/AAAA-MM.json`, rendre `Monthly` (couverture frame 120). Les blocs « hausses/baisses » et « confirmés par les commerçants » n'apparaissent que s'il y a des données.

## Réclamation de fiche (compositions `ClaimBar` / `ClaimCafe`, `ClaimCard.tsx`)

Carte générique « Your bar / Your café » (jamais un vrai commerce). Lien : `howmuch.live/business` (on cherche son lieu, on le réclame gratuitement : infos, confirmation des prix avec badge, vues). Instagram : version bar ; TikTok : version café (pas d'alcool). À reprendre environ une fois par mois, en changeant le Bezirk et le produit dans les props.
Légende Instagram : « Bar owners in Vienna: your prices are probably already on the map », ce qu'on gagne (✓ infos, ✓ prix confirmés avec badge, ✓ vues), « → howmuch.live/business or DM us CLAIM », « Know a bar owner? Tag them 👇 », puis l'allemand. Ne jamais dire combien de fiches sont déjà réclamées tant que le chiffre est très bas.

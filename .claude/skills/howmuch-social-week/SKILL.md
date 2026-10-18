---
name: howmuch-social-week
description: Prépare et programme les posts HOW MUCH?! sur Instagram et TikTok (Reels de prix, carte à trous, bilan mensuel, réclamation de fiche) avec les vrais prix de la base, le template vidéo et Metricool. À utiliser pour « prépare la semaine », « nouveaux posts », « mets à jour les posts », « bilan du mois ».
---

# HOW MUCH?! · posts Instagram et TikTok

Objectif du compte @howmuch.live : faire venir des **contributeurs** (des gens qui ajoutent des prix sur howmuch.live), pas seulement des abonnés. Chaque post finit par une action : trouver le lieu sur la carte, ajouter un prix, commenter son Bezirk.

Réponds à Hugues en français, direct et honnête.

## Outils et accès

- **Base de données** : connecteur Lovable, `query_database`, projet `17cb4adf-2999-46ad-a0b9-a9cf74e4894a` (tables `places`, `place_prices`). Lecture seule, jamais d'écriture.
- **Template vidéo** : dépôt GitHub `Hugues000-bit/h.m.09.10.26`, dossier `template/` (Remotion 4.0.484, React 18). Ajouter le dépôt avec `add_repo` (accès push), cloner, `npm install` dans `template/`.
- **Hébergement des médias** : même dépôt, dossier `AAAA-MM/`. Les liens publics sont `https://raw.githubusercontent.com/Hugues000-bit/h.m.09.10.26/main/<chemin>`. Toujours donner un **nouveau nom de fichier** à une version refaite (suffixe `-vMMDD`), sinon le cache renvoie l'ancienne.
- **Programmation** : connecteur Metricool, marque `blogId 7319232` (Instagram howmuch.live), fuseau `Europe/Vienna`. Metricool copie les médias chez lui au moment de la programmation.
- **Rendu** : `npx remotion render src/howmuch/index.tsx <Id> out.mp4 --codec=h264 --crf=18 --browser-executable=<chromium headless_shell>`. Dans l'espace cloud : `/opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell`. Couvertures : `npx remotion still ... --frame=N` avec N = 10 pour `PriceVideo`, 230 pour `GapMap`, 120 pour `Monthly`, 210 pour `ClaimBar`/`ClaimCafe`.

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

- **3 Reels par semaine** : lundi 12 h 00, mercredi 12 h 30, vendredi 12 h 30. Les stories sont en publication manuelle (`autoPublish: false`, sans texte), parce que les stickers sondage et lien s'ajoutent à la main.
- **Thème** : séries de 4 Reels sombres puis 4 clairs (`theme: "light"` dans la copie, couleurs du mode jour de l'app). Garder le compte d'un mois sur l'autre en regardant les posts déjà programmés.
- **Langue** : anglais en grand, allemand en petit dessous (`hookDe`, `dataDe`, `pctDe`, `stampDe`, `ctaDe`). Les mots viennois (Krügerl, Bezirk, G'spritzter) ne se traduisent pas.
- **Varier les produits** : pas deux Reels du même produit dans la même semaine si on peut l'éviter.
- Formats disponibles dans le template :
  - `PriceVideo` (7 s, depuis le 18/10) : **les deux prix en très gros dès la première image** (« 4,50 € or 6,00 € » + `clash` « for a Krügerl in Neubau. » / `clashDe`), puis les points de prix, l'écart en %, le tampon « ARE WE BEING RIPPED OFF? », puis « Where's the {min} one? ». Raison : avec l'ancienne accroche (question + ticker), 73 % des gens partaient avant 3 s. Copies dans `copy-week.ts` (chaque copie doit avoir `clash` et `clashDe`), données dans `data-week.ts`, compositions dans `index.tsx`.
  - `GapMap` (12 s, clair) : la carte des Bezirke. Bezirke à 0 lieu en rose (« Is yours empty? »), de 1 à 5 lieux en jaune avec leur nombre (« Or almost empty? »), accroche « N Bezirke. Almost no prices. », fin « Add one price · Comment your Bezirk ». Recalculer les comptes dans `gapmap-data.ts`.
  - `Monthly` : le bilan du mois (voir plus bas).
  - `ClaimBar` / `ClaimCafe` : la réclamation de fiche pour les commerçants (voir plus bas).
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

## TikTok (compte howmuch.live, relié à Metricool)

- **Aucun produit avec alcool sur TikTok** (contrainte de Hugues) : pas de bière, Spritzer, vin, cocktail. Seulement café, nourriture, boissons sans alcool, et la carte à trous.
- **3 vidéos par semaine : mardi, jeudi et samedi à 12 h 30**, en décalé avec Instagram. Hugues peut répondre aux commentaires avant 16 h.
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

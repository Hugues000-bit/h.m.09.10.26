---
name: howmuch-social-week
description: Prépare et programme une semaine de Reels Instagram HOW MUCH?! (vrais prix de la base, template vidéo, Metricool). À utiliser pour « prépare la semaine », « nouveaux posts », « mets à jour les posts ».
---

# HOW MUCH?! · semaine de posts Instagram

Objectif du compte @howmuch.live : faire venir des **contributeurs** (des gens qui ajoutent des prix sur howmuch.live), pas seulement des abonnés. Chaque post finit par une action : trouver le lieu sur la carte, ajouter un prix, commenter son Bezirk.

Réponds à Hugues en français, direct et honnête.

## Outils et accès

- **Base de données** : connecteur Lovable, `query_database`, projet `17cb4adf-2999-46ad-a0b9-a9cf74e4894a` (tables `places`, `place_prices`). Lecture seule, jamais d'écriture.
- **Template vidéo** : dépôt GitHub `Hugues000-bit/h.m.09.10.26`, dossier `template/` (Remotion 4.0.484, React 18). Ajouter le dépôt avec `add_repo` (accès push), cloner, `npm install` dans `template/`.
- **Hébergement des médias** : même dépôt, dossier `AAAA-MM/`. Les liens publics sont `https://raw.githubusercontent.com/Hugues000-bit/h.m.09.10.26/main/<chemin>`. Toujours donner un **nouveau nom de fichier** à une version refaite (suffixe `-vMMDD`), sinon le cache renvoie l'ancienne.
- **Programmation** : connecteur Metricool, marque `blogId 7319232` (Instagram howmuch.live), fuseau `Europe/Vienna`. Metricool copie les médias chez lui au moment de la programmation.
- **Rendu** : `npx remotion render src/howmuch/index.tsx <Id> out.mp4 --codec=h264 --crf=18 --browser-executable=<chromium headless_shell>`. Dans l'espace cloud : `/opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell`. Couverture : `npx remotion still ... --frame=70` (190 pour la carte à trous).

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
  - `PriceVideo` (10 s) : accroche « The cheapest X in Y costs… » + ticker ?,?? €, les points de prix, l'écart en %, le tampon « ARE WE BEING RIPPED OFF? », puis « Where's the {min} one? ». Copies dans `copy-week.ts`, données dans `data-week.ts`, compositions dans `index.tsx`.
  - `GapMap` (10 s) : la carte des Bezirke, les Bezirke vides en rose avec « 0 », et l'appel « Be the first in your Bezirk ». Recalculer les comptes dans `gapmap-data.ts`.
- Idées de formats suivants pour faire contribuer : « Know a cheaper one? Add it and take #1 », « Still true? » (un prix daté, à confirmer ou corriger), un tuto de 10 s pour ajouter un prix (à épingler), et plus tard le merci aux contributeurs.

## Légende (modèle)

```
<Accroche en anglais, 1 ligne> <emoji>

<Les deux prix, le nombre de lieux>.
Where's the <min> one? It's on the map → link in bio.
<Question précise qui fait commenter> 👇

🇦🇹 <Le même message, court, en allemand>.

<n> places · HOW MUCH?! community
#wien #<bezirk ou produit> #<produit> #vienna #howmuch
```

5 hashtags au maximum. Premier commentaire : `🔗 howmuch.live · find the cheapest one near you / finde das günstigste in deiner Nähe`.

## Déroulé

1. Lire les posts déjà programmés dans Metricool (`getScheduledPosts`) pour connaître les créneaux libres et le thème (sombre ou clair) en cours.
2. Interroger la base, choisir les produits et les zones selon les règles ci-dessus, et lister les prix à vérifier.
3. Écrire les données et les copies, rendre les vidéos, puis **regarder des images clés** (accroche, points, %, fin) pour vérifier les débordements de texte et les chevauchements.
4. Envoyer sur GitHub (nouveaux noms de fichiers), vérifier que chaque lien répond 200.
5. Programmer dans Metricool (`instagramData.type = "REEL"`, `videoThumbnailUrl` = la couverture), ou mettre à jour les posts existants (`updateScheduledPost` avec le contenu complet).
6. Répondre à Hugues avec un tableau date / post / statut, puis les prix à vérifier en une ou deux lignes.

Quand Hugues dit qu'il a modifié la base : refaire l'étape 2 pour tous les posts à venir, ne refaire que les vidéos dont les chiffres ont changé, et les remplacer dans Metricool sans changer les dates.

## TikTok (compte howmuch.live, relié à Metricool)

- **Aucun produit avec alcool sur TikTok** (contrainte de Hugues) : pas de bière, Spritzer, vin, cocktail. Seulement café, nourriture, boissons sans alcool, et la carte à trous.
- **3 vidéos par semaine : mardi, jeudi et samedi à 12 h 30**, en décalé avec Instagram. Hugues peut répondre aux commentaires avant 16 h.
- Mêmes vidéos que les Reels quand le produit est sans alcool, sinon des vidéos dédiées (fichiers `tt-*`).
- `providers: [{"network":"tiktok"}]`, et **`tiktokData.title` est obligatoire** (la question courte, par exemple « Schnitzel in Vienna: 10,90 € or 39,90 €? »). `isAigc: false`, `privacyOption: "PUBLIC_TO_EVERYONE"`.
- Légende comme une recherche : le mot-clé au début (« schnitzel prices in vienna: … »), puis « where's the X one? → howmuch.live », une ligne en allemand et 5 hashtags au plus. Pas de « link in bio » (lien de profil limité sur TikTok).
- Pour les grandes fourchettes de prix (plus de 12 €), le template regroupe les prix par tranches de 1 à 2 € pour que les points restent lisibles.

## Bilan mensuel (composition `Monthly`, `MonthlyMap.tsx`)

Publié le 1er lundi du mois (Instagram 12 h) et le mardi suivant (TikTok 12 h 30 : pas d'alcool à l'écran, OK). Mardi/jeudi/samedi restent les jours TikTok habituels.
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

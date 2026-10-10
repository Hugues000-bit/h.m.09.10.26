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
# Fagerhult — Hållbarhetskalkyl (Demo)

En säljdemo / showcase-prototyp byggd för Fagerhult. Visar konceptet:

> *"Tänk om era kunder kunde välja armatur i ett verktyg och direkt se hur mycket CO₂ och energi de sparar jämfört med branschens standardalternativ."*

Inför nya rapporteringskrav (CSRD, EPBD) behöver fastighetsägare visa siffror på sin energiförbrukning och sitt klimatavtryck. Det här verktyget gör Fagerhults hållbarhetsfördel tydlig och säljbar — på 5 sekunder.

## Pitch-flöde

1. **Default-läget** visar konkurrentens armatur — röda staplar, höga siffror.
2. Klicka dig genom de tre Fagerhult-alternativen.
3. Staplarna sjunker, siffrorna tickar ner, deltat mot konkurrenten visas i grönt.
4. Sista valet — **Kvisten i trä** — visar Fagerhults bästa: −81% CO₂, −90% energi.

## Kör lokalt

```bash
npm install
npm run dev
```

Öppna http://localhost:5173

## Deploya till Vercel

```bash
# Installera Vercel CLI om du inte har den
npm i -g vercel

# Från projektmappen
vercel
```

Eller pusha till GitHub och importera repot på vercel.com — Vercel detekterar Vite automatiskt.

## Bygg för produktion

```bash
npm run build
npm run preview
```

## Datakälla

Siffror från Fagerhults eget kontorsexempel (12 arbetsplatser, 90 kmv, 50 000 h):

| Alternativ | CO₂ (kg CO₂e) | Energi (kWh/år) |
|---|---|---|
| Konkurrent (100 lm/W, L70, ingen styrning) | 1815 | 30 192 |
| Fagerhult Standard (140 lm/W, L70) | 1411 | 21 216 |
| Fagerhult Smart (CLO + närvaro + dagsljus) | 646 | 9 828 |
| Fagerhult Kvisten i trä (allt + hållbart material) | 344 | 3 120 |

## Nästa steg om Fagerhult tackar ja

- Riktig produktdatabas — varje armaturmodell som val med EPD-dokumenterade siffror
- Anpassbara förutsättningar (antal armaturer, brinntid, elpris)
- SEK-besparingar + ROI-kalkyl
- PDF-rapport som följer CSRD scope 2-format
- Inbäddningsbar widget för Fagerhults egen sajt

## Stack

- Vite 5 + React 18
- Inter Tight (display) + JetBrains Mono (data) — egna fontval, inga generiska systemfonter
- Custom CSS (inga UI-libs) — full kontroll på Fagerhult-känslan

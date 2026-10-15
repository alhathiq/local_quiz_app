import { parseMCQMarkdown } from '../utils/markdownParser';
import type { MCQQuestion } from '../types';

export const INITIAL_MARKDOWN = `# Infarctus du myocarde

### Q 1  Quelles sont les caractéristiques du sus-décalage du segment ST dans un IDM ?

- Convexe vers le haut [True]
- Concave vers le haut [False]
- Systématisé à un territoire vasculaire [True]
- Diffus [False]
- Évolutif [True]

**Explanation:**
> Sus-décalage du segment ST dans un SCA ST+ = onde de Pardee : convexe vers le haut, évolutif, systématisé dans un territoire de vasculaire coronaire, présence d'un miroir, association avec une onde Q de nécrose. Un sus-décalage concave vers le haut et diffus oriente plutôt vers une péricardite aiguë.

---

### Q 2  Quels sont les critères de validité du sus-décalage du segment ST dans un IDM ?

- > 2 mm dans les dérivations V1, V2, V3 [True]
- > 1 mm dans les dérivations frontales et en V4, V5, V6 [True]
- > 2 mm en DII, DIII, aVF, aVR, AVL [False]
- Supérieur à l'onde R [False]
- Caractère permanent [False]

**Explanation:**
> Selon les recommandations ESC/AHA : sus-décalage au point J persistant dans au moins deux dérivations contiguës : ≥ 2.5 mm chez l'homme < 40 ans en V2-V3, ≥ 2 mm chez l'homme ≥ 40 ans (≥ 1.5 mm chez la femme), et ≥ 1 mm dans toutes les autres dérivations. Le sus-décalage est dynamique et évolutif (non permanent).

---

### Q 3  Quelles sont les contre-indications absolues à la fibrinolyse dans un SCA ST+ ?

- AVC hémorragique quel que soit le délai [True]
- Dissection aortique suspectée [True]
- Ulcère gastro-duodénal évolutif [False]
- Traumatisme crânien majeur récent (< 1 mois) [True]
- AVC ischémique dans les 6 derniers mois [True]

**Explanation:**
> Contre-indications absolues à la thrombolyse : ATCD d'AVC hémorragique, AVC ischémique < 6 mois, malformation artério-veineuse ou néoplasie intracrânienne, TC ou chirurgie majeure récents (< 3 semaines), saignement gastro-intestinal actif (< 1 mois), ponction non compressible récente, suspicion de dissection aortique.

---

### Q 4  Quelles sont les complications mécaniques précoces d'un IDM transmural ?

- Rupture de la paroi libre du ventricule gauche [True]
- Rupture du septum interventriculaire (CIV) [True]
- Rupture de pilier mitral avec insuffisance mitrale aiguë [True]
- Bloc auriculo-ventriculaire complet [False]
- Anévrisme ventriculaire gauche calcifié [False]

**Explanation:**
> Les complications purement mécaniques surviennent habituellement entre J2 et J7 : rupture de paroi libre (tamponnade brutale), CIV post-infarctus (souffle holosystolique en rayon de roue), rupture de cordage/pilier mitral (OAP hémodynamique massif). Le BAV complet est une complication électrique/conductive, et l'anévrisme calcifié est une complication tardive.

---

# Tuberculose Pulmonaire

### Q 1  Signes radiologiques typiques de la tuberculose pulmonaire commune de l'adulte ?

- Infiltrats apicaux ou sous-claviculaires [True]
- Présence d'adénopathies hilaires volumineuses constantes [False]
- Caverne tuberculeuse à paroi épaisse avec niveau hydro-aérique [True]
- Atteinte prédominante des bases pulmonaires [False]
- Nodules et micronodules de dissémination bronchogène [True]

**Explanation:**
> La tuberculose commune de réinfection adulte siège électivement aux sommets (segments apicaux et dorsaux des lobes supérieurs). La caverne est la lésion élémentaire la plus caractéristique. Les volumineuses adénopathies médiastinales s'observent surtout dans la primo-infection de l'enfant ou l'immunodépression sévère (VIH).

---

### Q 2  Régime standard de la quadrithérapie antituberculeuse de 1ère ligne (schéma 2RHZE / 4RH) ?

- Isoniazide (H) pendant 6 mois [True]
- Rifampicine (R) pendant 6 mois [True]
- Pyrazinamide (Z) pendant les 2 premiers mois [True]
- Ethambutol (E) pendant 6 mois [False]
- Streptomycine (S) en systématique [False]

**Explanation:**
> Schéma classique OMS / recommandations françaises : phase d'attaque de 2 mois par quadrithérapie (Rifampicine + Isoniazide + Pyrazinamide + Ethambutol), suivie d'une phase d'entretien de 4 mois par bithérapie (Rifampicine + Isoniazide), soit 6 mois au total.

---

### Q 3  Quels sont les effets secondaires majeurs à surveiller sous Rifampicine et Isoniazide ?

- Coloration orangée des sécrétions (urines, sueur, larmes) sous Rifampicine [True]
- Hépatotoxicité cytolytique commune à INH, RIF et PZA [True]
- Névrite optique rétro-bulbaire sous Isoniazide [False]
- Neuropathie périphérique sensitivo-motrice prévenue par la pyridoxine (vit B6) sous INH [True]
- Inducteur enzymatique puissant (Rifampicine) diminuant l'efficacité des contraceptifs oraux [True]

**Explanation:**
> La coloration orangée est un effet bénin mais classique de la Rifampicine (qui est un puissant inducteur du cytochrome P450). L'hépatite médicamenteuse impose un bilan hépatique régulier. La névrite optique rétro-bulbaire (dyschromatopsie rouge-vert) est l'effet secondaire redouté de l'Éthambutol, non de l'Isoniazide.

---

# Pneumonie Aiguë Communautaire

### Q 1  Quels critères font partie du score pronostique CRB-65 (en pratique ambulatoire) ?

- Confusion mentale aiguë [True]
- Fréquence respiratoire ≥ 30 /min [True]
- Pression artérielle systolique < 90 mmHg ou diastolique ≤ 60 mmHg [True]
- Âge ≥ 65 ans [True]
- Protéine C-réactive (CRP) > 100 mg/L [False]

**Explanation:**
> Le score CRB-65 comporte 4 critères cliniques simples (1 point chacun) sans biologie : C = Confusion, R = Respiratory rate ≥ 30/min, B = Blood pressure (PAS < 90 ou PAD ≤ 60 mmHg), 65 = Âge ≥ 65 ans. Un score ≥ 1 justifie une évaluation hospitalière.

---

### Q 2  Antibiothérapie probabiliste de 1ère intention d'une PAC du sujet jeune sans comorbidité ?

- Amoxicilline per os 1 g x 3/j [True]
- Pristinamycine en alternative si allergie aux pénicillines [True]
- Ciprofloxacine per os [False]
- Association Amoxicilline + Acide Clavulanique systématique [False]
- Macrolide per os (ex : Clarithromycine) si suspicion de germe atypique [True]

**Explanation:**
> Streptococcus pneumoniae (pneumocoque) reste le germe prioritaire à cibler par l'amoxicilline à forte dose (3 g/j). L'amoxicilline-acide clavulanique n'est pas indiquée en première intention chez le sujet jeune sain sans comorbidités ni facteurs de risque de germes anaérobies/Gram négatif. Les fluoroquinolones systémiques ne sont pas recommandées d'emblée.
`;

export function getDefaultQuestions(): MCQQuestion[] {
  return parseMCQMarkdown(INITIAL_MARKDOWN);
}

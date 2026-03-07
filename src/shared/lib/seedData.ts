import type { CreateMaterialInput } from '@entities/material/model/types'
import type { CreateEquipmentInput } from '@entities/equipment/model/types'

export const SEED_MATERIALS: CreateMaterialInput[] = [
  // Holz
  { name: 'Stock', specifications: '2 Meter, gerade', unit: 'Stück', currentStock: 10 },
  { name: 'Stock', specifications: '1 Meter, gerade', unit: 'Stück', currentStock: 15 },
  { name: 'Stock', specifications: '50 cm, dünn', unit: 'Stück', currentStock: 20 },
  { name: 'Ast', specifications: 'dick, Y-förmig', unit: 'Stück', currentStock: 5 },
  { name: 'Holzbrett', specifications: 'ca. 30x15 cm', unit: 'Stück', currentStock: 3 },
  { name: 'Birkenrinde', unit: 'Stück', currentStock: 8 },
  { name: 'Rinde', specifications: 'großflächig', unit: 'Stück', currentStock: 6 },
  // Schnüre & Verbindungen
  { name: 'Paracord', specifications: '550, 4mm', unit: 'Meter', currentStock: 50 },
  { name: 'Juteschnur', specifications: '3mm', unit: 'Meter', currentStock: 30 },
  { name: 'Naturfaserschnur', unit: 'Meter', currentStock: 15 },
  { name: 'Draht', specifications: 'verzinkt, 1.5mm', unit: 'Meter', currentStock: 10 },
  { name: 'Kabelbinder', specifications: '200mm', unit: 'Stück', currentStock: 50 },
  // Feuer
  { name: 'Zunder', specifications: 'Birkenrinde / Watte', unit: 'Gramm', currentStock: 100 },
  { name: 'Fichtenharz', unit: 'Gramm', currentStock: 50 },
  { name: 'Kohle', unit: 'Gramm', currentStock: 200 },
  { name: 'Kerze', specifications: 'Teelichter', unit: 'Stück', currentStock: 10 },
  { name: 'Anzündwürfel', unit: 'Stück', currentStock: 20 },
  // Naturmaterialien
  { name: 'Lehm', unit: 'kg', currentStock: 5 },
  { name: 'Sand', unit: 'kg', currentStock: 3 },
  { name: 'Moos', unit: 'Bündel', currentStock: 4 },
  { name: 'Steine', specifications: 'faustgroß, flach', unit: 'Stück', currentStock: 12 },
  { name: 'Tannenzapfen', unit: 'Stück', currentStock: 15 },
  // Sonstiges
  { name: 'Bienenwachs', unit: 'Gramm', currentStock: 100 },
  { name: 'Nägel', specifications: '80mm', unit: 'Stück', currentStock: 30 },
  { name: 'Schrauben', specifications: '50mm, Holz', unit: 'Stück', currentStock: 25 },
]

export const SEED_EQUIPMENT: CreateEquipmentInput[] = [
  // Schneidwerkzeuge
  { name: 'Bushcraft-Messer', specifications: 'Full-Tang, feststehend', currentStock: 1 },
  { name: 'Schnitzmesser', specifications: 'Mora Companion', currentStock: 1 },
  { name: 'Axt', specifications: 'Waldhammer, 600g', currentStock: 1 },
  { name: 'Beil', specifications: 'Handgröße', currentStock: 1 },
  { name: 'Klappsäge', specifications: 'Silky / Bahco', currentStock: 1 },
  { name: 'Multitool', specifications: 'Leatherman', currentStock: 1 },
  // Feuer & Licht
  { name: 'Feuerstahl', specifications: 'mit Schaber', currentStock: 2 },
  { name: 'Feuerzeug', specifications: 'Sturmfeuerzeug', currentStock: 3 },
  { name: 'Stirnlampe', specifications: 'LED, wasserdicht', currentStock: 2 },
  // Unterkunft & Schlaf
  { name: 'Tarp', specifications: '3x3m, wasserdicht', currentStock: 1 },
  { name: 'Hängematte', specifications: 'mit Moskitonetz', currentStock: 1 },
  { name: 'Schlafsack', specifications: '3-Jahreszeiten', currentStock: 1 },
  { name: 'Isomatte', specifications: 'aufblasbar', currentStock: 1 },
  // Kochen & Wasser
  { name: 'Kochtopf', specifications: 'Edelstahl, 1L', currentStock: 1 },
  { name: 'Trinkflasche', specifications: 'Edelstahl, 1L', currentStock: 2 },
  { name: 'Wasserfilter', specifications: 'Sawyer / Katadyn', currentStock: 1 },
  { name: 'Essbesteck', specifications: 'Spork / Göffel', currentStock: 2 },
  { name: 'Schneidebrett', specifications: 'klein, Holz', currentStock: 1 },
  // Navigation & Sicherheit
  { name: 'Kompass', specifications: 'Spiegelkompass', currentStock: 1 },
  { name: 'Erste-Hilfe-Set', specifications: 'kompakt', currentStock: 1 },
  { name: 'Signalpfeife', currentStock: 1 },
  // Transport & Aufbewahrung
  { name: 'Rucksack', specifications: '40L', currentStock: 1 },
  { name: 'Dry Bag', specifications: 'wasserdicht, 10L', currentStock: 2 },
  { name: 'Karabiner', specifications: 'Aluminium', currentStock: 4 },
  // Sonstiges
  { name: 'Schleifstein', specifications: 'Kombi 400/1000', currentStock: 1 },
  { name: 'Klappspaten', currentStock: 1 },
  { name: 'Handschuhe', specifications: 'Leder, Arbeitshandschuhe', currentStock: 1 },
  { name: 'Spaltaxt', specifications: 'Fiskars, 2.5kg', currentStock: 1 },
  { name: 'Fernglas', specifications: '10x42', currentStock: 1 },
  { name: 'Seil', specifications: '8mm, 20m', currentStock: 1 },
  { name: 'Plane', specifications: 'PE, 4x5m', currentStock: 1 },
]

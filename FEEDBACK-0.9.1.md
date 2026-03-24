# Nature Boyz - Feedback & Roadmap v0.9.1

## Gesammeltes Feedback (2026-03-24)

### #1 Tasks: Bauabschnitte, Abhaengigkeiten, visuelle Kette
- Tasks in Bauabschnitte/Phasen gruppieren
- Abhaengigkeiten zwischen Abschnitten ("braucht Phase X zuerst")
- Visuell als zusammenhaengende Kette/Bloecke darstellen (Baukastensystem)
- Fortschritt sichtbar: fertig, naechstes, blockiert
- **Aufwand: Gross**

### #2 Telegram Bot fuer Benachrichtigungen
- Bot postet Updates in Nature Boyz Telegram-Gruppe
- Supabase Edge Function als Trigger
- Neue Pinnwand-Nachricht, Projekt-Updates, Zuweisungen etc.
- **Aufwand: Mittel**

### #3 Hilfe / Onboarding einbauen
- Erklaerungen was die App kann
- Tooltips / Hinweise bei erstem Besuch
- Grober Oberpunkt, Details spaeter definieren
- **Aufwand: Klein-Mittel**

### #4 Equipment-Logik: wiederverwendbar, Kategorien/Typen
- Material wird verbraucht, Ausruestung wird benutzt (nicht verbraucht)
- Equipment braucht Kategorien/Typen (z.B. "Schaufel")
- Projekt braucht den Typ, nicht das spezifische Teil
- Kein Bestandsabzug bei Ausruestung
- Mehrfach-Zuweisung erlauben (selbe Axt in 3 Projekten)
- **Aufwand: Gross**

### #5 Item-Modal: Filter Material/Ausruestung + Anfangsbestand
- Filter-Tabs im Auswahl-Modal (Material | Ausruestung | Alle)
- Anfangsbestand im Anlegen-Modal setzbar (egal wo angelegt)
- **Aufwand: Klein**

### #6 Skizzen-System (Excalidraw o.Ae.)
- Mehrere Skizzen pro Projekt (Galerie + Editor)
- Muss Vue-kompatibel sein (Sonnet-Entwurf war React - muss angepasst werden)
- Offline-first (Dexie), Sync via Supabase
- Mobile-tauglich
- Siehe SKETCH_FEATURE.md fuer Sonnet-Entwurf (Konzept gut, Tech-Stack falsch)
- **Aufwand: Gross**

### #7 Kisten-System (Unter-Ebene von Lagerorten)
- Kisten als Zwischenebene: Lagerort > Kiste > Items
- Inhalte (Material/Equipment) zu Kisten zuweisbar
- Freie vs. belegte Kisten sichtbar
- Kisten-Name/Nummer/Beschreibung
- **Aufwand: Mittel**

### #8 Pinnwand (global + pro Projekt)
- Globale Pinnwand fuer allgemeine Gruppen-Nachrichten
- Pro-Projekt Pinnwand fuer projektbezogene Updates
- Chronologisch, mit Absender + Zeitstempel
- Synced ueber Supabase
- **Aufwand: Mittel**

### #9 Scroll-Bug (beobachten)
- Scroll geht manchmal kaputt
- Reproduktion: Projekt editieren -> Anzahl aendern -> Hardware-Zurueck statt Modal-X -> Scroll locked
- Vermutlich: Modal schliesst ohne overflow auf Body zurueckzusetzen
- Moeglicherweise schon behoben durch letztes Scroll-Update
- **Status: Beobachten, nicht aktiv fixen**

### #10 iOS Anleitung
- Kumpel mit iPhone kommt nicht rein (geringe Technikkenntnisse)
- PWA-Installation ueber Safari erklaeren
- Schritt-fuer-Schritt Anleitung (in App oder extern)
- **Aufwand: Klein**

### #11 Ueberladung vermeiden / UI vereinfachen
- Pruefen wo Features zusammengelegt werden koennen
- Screens nicht ueberfrachten
- Eigene Review-Session einplanen
- **Status: Eigene Session**

---

## Umsetzungsplan

### Session 11 - Quick Wins + Fundament
- [x] #5 Item-Modal verbessern (Filter-Tabs, Farbschema sky/forest/amber, Anfangsbestand + benötigte Menge)
- [x] #10 iOS Anleitung (plattform-spezifisch in Settings + Vercel-Hosting: bushcraft-planer.vercel.app)
- [ ] #4 Equipment-Logik umbauen

### Session 12 - Lager & Struktur
- [ ] #7 Kisten-System
- [ ] #1 Tasks: Bauabschnitte & Abhaengigkeiten

### Session 13 - Kommunikation
- [ ] #8 Pinnwand
- [ ] #2 Telegram Bot

### Session 14 - Extras
- [ ] #6 Skizzen-System
- [ ] #3 Hilfe / Onboarding

### Fortlaufend
- [ ] #9 Scroll-Bug beobachten
- [ ] #11 Ueberladung vermeiden (eigene Review-Session)

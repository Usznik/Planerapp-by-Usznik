# Metin2 — Dziennik wypraw

## Gotowa aplikacja Windows

Uruchom `Metin2-Dziennik-Wypraw-1.0.4-portable.exe` z folderu `dist`. To wersja przenośna — nie wymaga instalatora ani uruchamiania serwera.

Zadania i postacie zapisują się automatycznie w pliku `metin-plan.json` w folderze danych użytkownika Windows. W aplikacji kliknij **Otwórz folder danych**, aby znaleźć ten plik.

W sekcji **Portfel Yang** możesz zapisać sumę zarobionych i wydanych Yang dla wybranego dnia. Zestawienie miesięczne sumuje wpisy z miesiąca widocznego w kalendarzu. Rozliczenia są zapisywane osobno dla każdej postaci.

W panelu **Zliczanie polowań** przyciski **+1** zapisują liczbę metinów, bossów i minibossów dla wybranego dnia i postaci. Panel pokazuje również sumy za miesiąc widoczny w kalendarzu.

Po oznaczeniu zadania jako ukończonego aplikacja zapisuje dokładny czas z komputera i wyświetla go przy zadaniu.

Przy dodawaniu zadania możesz użyć **Dodaj zakres**, aby przypisać je do każdego dnia w przedziale, albo **Ustaw cykl**, aby wybrać konkretne dni tygodnia (np. poniedziałek, środa, piątek i niedziela) w podanym zakresie dat.

## Budowanie pliku EXE

Wymagany jest Node.js. W folderze projektu uruchom:

```sh
npm install
npm run build:win
```

Wynikowy plik `.exe` pojawi się w folderze `dist`.

## Wersja przeglądarkowa

Można nadal otwierać `index.html` bezpośrednio w Chrome lub Edge. W przeglądarce wybierz plik JSON, żeby aplikacja mogła go aktualizować; wersja EXE zapisuje dane automatycznie i nie potrzebuje tego kroku.


## Do zrobienia
-Książki i biolog: wpisywanie dziennej liczby prób i zaznaczanie, czy weszło; nieudana próba nie zmniejsza liczby pozostałych a d.

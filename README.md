# Metin2 — Dziennik wypraw

## Gotowa aplikacja Windows

Uruchom `Metin2-Dziennik-Wypraw-1.0.4-portable.exe` z folderu `dist`. To wersja przenośna — nie wymaga instalatora ani uruchamiania serwera.

Zadania i postacie zapisują się automatycznie w pliku `metin-plan.json` w folderze danych użytkownika Windows. W aplikacji kliknij **Otwórz folder danych**, aby znaleźć ten plik.

W sekcji **Portfel Yang** możesz zapisać sumę zarobionych i wydanych Yang dla wybranego dnia. Zestawienie miesięczne sumuje wpisy z miesiąca widocznego w kalendarzu. Rozliczenia są zapisywane osobno dla każdej postaci.

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
-ksiazki , biolog katergoia i pole do zazneczani czy weszło i jak nie wejdzie to przesuwa zadanie jeden dzien do przodu w kalendarzu.
-Do zrobienia world boss i mozliwosc zacznenia co ile ma się zadanie (poniedzaiłe,sroda,niedziela,poniedziałek)

# TravelRouteApp

TravelRouteApp - tai "Android" mobili aplikacija, skirta rasti įdomias lankytinas vietas esančias netoli pasirinkto maršruto ir jas prie to maršruto pridėti.

## Paleidimo instrukcija

1. Parsisiųsti Node.js iš šio puslapio: https://nodejs.org/en/download/

2. Įsirašyti visus node_modules:

        npm install

3. Įsirašyti "Expo" platformą skirtą kurti mobilioms aplikacijoms:

        npm install --global expo-cli
        
4. Paleisti programėlę galima dviem būdais: per fizinį "Android" įrenginį ir per "Android" virtualų įrenginį kompiuteryje.
    1. Paleidimas per fizinį įrenginį:
        1. Savo įrenginyje "Google Play" parduotuvėje raskite ir parsisiųskite programėlę "Expo Go".
        2. Prijunkite savo įrenginį prie kompiuterio naudojant USB jungtį.
        3. Komandinėje eilutėje paleiskite šią komandą:
                
                npm start
        4. Savo įrenginyje atsidarykite "Expo Go" programėlę.
        5. Viršuje "Tools" skiltyje matysite mygtuką su pavadinimu "Scan QR code". Paspauskite jį.
        6. Atsidarius kamerai nukreipkite ją į naršyklėje atsidariusiame "Metro bundler" lange kairės pusės apačioje esantį QR kodą. Turėtų atsidaryti programėlė.

    2. Paleidimas per virtualų įrenginį:
        1. Norint programėlę paleisti virtualiame įrenginyje jums pirmiausia reikės įsirašyti "Android Studio" kūrimo aplinką. Tai padaryti galite paspaudę čia: https://developer.android.com/studio?gclid=Cj0KCQiAq7COBhC2ARIsANsPATGXxidDi2TLsYS1Jw5ic2RPZZVxoWp3Ym6yB3N9KbhOx3ZhxjECoO0aAuyvEALw_wcB&gclsrc=aw.ds
        2. Kitas žingsnis - "Android Studio" aplinkoje susikurti virtualų įrenginį. Instrukciją kaip tai padaryti rasite čia: https://developer.android.com/studio/run/managing-avds . **Atkreipkite dėmesį, kad lentelėje renkantis iš virtualių įrenginių sąrašo būtina pasirinkti tokį įrenginį, kurio "Play Store" stulpelis nebūtų tuščias ir turėtų ikoną. Priešingu atveju programėlė įrenginyje neveiks.**
        3. Kai įrenginys bus sukurtas, paleiskite jį paspaudę žalią rodyklę "Actions" stulpelyje.
        4. Atsidarykite projekto direktoriją komandinėje eilutėje ir paleiskite šią komandą (virtualus įrenginys turi būti įjungtas): 
        
                npm run android
        5. Po kiek laiko turėtų atsidaryti programėlė.
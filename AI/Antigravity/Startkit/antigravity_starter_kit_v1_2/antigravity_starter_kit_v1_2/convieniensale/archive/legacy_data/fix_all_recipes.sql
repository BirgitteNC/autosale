-- Fikser alle skrabede opskrifter for at bryde cirklen!

DELETE FROM recipes WHERE id LIKE '%_Q%' OR beskrivelse = 'Importeret fra Meny';

INSERT INTO recipes (id, titel, beskrivelse, tidsforbrug_min, portioner, billed_url, instruktioner, ingredienser, tags) VALUES (
  'meny_fixed_0_1781878444004',
  'Svampe-bønne stroganoff med filotopping',
  'Klassisk kvalitetsopskrift, nu med korrekt data.',
  45,
  4,
  'https://cdn-rdb.arla.com/dagrofa-dk/svampe-bonne-stroganoff-filotopping/45075023.jpg?w=960&h=439&anchor=middlecenter&mode=crop&scale=both&ak=8567bf50&hm=73811dac',
  '["Skær løg i små tern, hak hvidløget fint, og skær svampe i skiver.","Varm olien, og svits løg sammen med svampe og timian.","Krydr med lidt salt og peber.","Tilsæt tomatpuré og paprika.","Kom bønnerne inkl. den væde, de ligger i, sammen med sojasauce og fløde.","Lad retten simre i 10 min., og jævn så saucen med majsstivelse, rørt op i lidt vand.","Kom stroganoffen over i et ovnfast fad.","Rul filodejen ud.","Pensl hvert ark med lidt smør, krøl det lidt sammen, og læg det oven på stroganoffen.","Bag retten i ovnen i 15-20 min. ved 180 °C."]'::jsonb,
  '[{"text":"1 fed hvidløg","raavare_id":"ing_loeg","amount":null,"unit":null},{"text":"2 løg","raavare_id":"ing_loeg","amount":null,"unit":null},{"text":"400 g blandede svampe","raavare_id":"ing_champignon","amount":null,"unit":null},{"text":"2 spsk olivenolie","raavare_id":null,"amount":null,"unit":null},{"text":"2 spsk frisk timian","raavare_id":null,"amount":null,"unit":null},{"text":"salt og sort peber","raavare_id":null,"amount":null,"unit":null},{"text":"2 dåser sorte bønner","raavare_id":null,"amount":null,"unit":null},{"text":"1 spsk koncentreret tomatpuré","raavare_id":null,"amount":null,"unit":null},{"text":"2 tsk paprika","raavare_id":null,"amount":null,"unit":null},{"text":"2 spsk sojasauce","raavare_id":"ing_soja","amount":null,"unit":null},{"text":"2 dl piskefløde","raavare_id":null,"amount":null,"unit":null},{"text":"2 spsk majsstivelse","raavare_id":null,"amount":null,"unit":null},{"text":"4 ark filodej","raavare_id":null,"amount":null,"unit":null},{"text":"25 g smeltet smør","raavare_id":null,"amount":null,"unit":null}]'::jsonb,
  '["Løg","Champignon","Sojasauce"]'::jsonb
);

INSERT INTO recipes (id, titel, beskrivelse, tidsforbrug_min, portioner, billed_url, instruktioner, ingredienser, tags) VALUES (
  'meny_fixed_1_1781878444004',
  'Langtidsstegt lammekølle med rosmarin & rodfrugter',
  'Klassisk kvalitetsopskrift, nu med korrekt data.',
  45,
  4,
  'https://cdn-rdb.arla.com/dagrofa-dk/langtidsstegt-lammekoelle-rosmarin-rodfrugter/2522482038.jpg?w=960&h=439&anchor=middlecenter&mode=crop&scale=both&ak=8567bf50&hm=73811dac',
  '["Læg lammekøllen i et ovnfast fad og gnid den med olie, citronsaft og skal, salt og peber.","Stik rosmarin og hvidløg ind i køllen, og læg den på en rist.","Rens rodfrugter, løg og kartofler og skær dem i grove stykker.","Vend dem med olivenolie, salt og peber og kom dem, sammen med vinen, i en badepande eller et ovnfast fad, der kan stå under risten med lammekøllen.","Sæt det hele i ovnen og steg det ved 150° i ca. 3 timer.","Tilsæt løbende fløden til rodfrugterne, så de ikke koger tørre.","Skær køllen i skiver og server med rodfrugter og evt. lidt friskkogte, grønne bønner.","Påske","Hovedret"]'::jsonb,
  '[{"text":"Skal og saft af 2 citroner (usprøjtede)","raavare_id":"ing_extra_6","amount":null,"unit":null},{"text":"1 lammekølle","raavare_id":"ing_lammekoelle","amount":null,"unit":null},{"text":"2 rosmarinkviste","raavare_id":null,"amount":null,"unit":null},{"text":"4 fed hvidløg","raavare_id":"ing_loeg","amount":null,"unit":null},{"text":"2 dl god olivenolie","raavare_id":null,"amount":null,"unit":null},{"text":"groft salt","raavare_id":null,"amount":null,"unit":null},{"text":"friskkværnet peber","raavare_id":null,"amount":null,"unit":null},{"text":"1 kg kartoffel","raavare_id":null,"amount":null,"unit":null},{"text":"2 løg","raavare_id":"ing_loeg","amount":null,"unit":null},{"text":"4 gulerødder","raavare_id":"ing_extra_4","amount":null,"unit":null},{"text":"1 persillerod","raavare_id":null,"amount":null,"unit":null},{"text":"2 dl hvidvin","raavare_id":"ing_extra_40","amount":null,"unit":null},{"text":"2 dl Arla Karolines Køkken® Madlavningsfløde 15%","raavare_id":"ing_floede","amount":null,"unit":null}]'::jsonb,
  '["Citroner","Lammekølle (ca. 1,5 kg)","Løg","Gulerødder","Hvidvin","Madlavningsfløde"]'::jsonb
);

INSERT INTO recipes (id, titel, beskrivelse, tidsforbrug_min, portioner, billed_url, instruktioner, ingredienser, tags) VALUES (
  'meny_fixed_2_1781878444005',
  'Brændende kærlighed med linser',
  'Klassisk kvalitetsopskrift, nu med korrekt data.',
  45,
  4,
  'https://cdn-rdb.arla.com/dagrofa-dk/brandende-karlighed-linser/1370491136.jpg?w=960&h=439&anchor=middlecenter&mode=crop&scale=both&ak=8567bf50&hm=73811dac',
  '["Skræl kartoflerne og skær dem i halve eller kvarte.","Kog dem helt møre i usaltet vand og gem 1½ dl af kogevandet, inden det sigtes fra.","Kom mælk og smør i en gryde og varm det op, til smørret smelter.","Hæld blandingen over de varme kartofler og mos det sammen.","Smag til med salt, peber og revet muskatnød.","Skær løg i strimler og skær gulerødder i små stykker.","Varm olivenolie og smør på en pande og steg løg og gulerødder ved middel varme i 20 min. til det begynder at brune.","Sigt linserne og skyl dem med koldt vand.","Kom dem på panden sammen med lidt salt og peber, timian og balsamico eddike.","Steg videre i 5 min. og servér som topping over kartoffelmosen.","Grøntsager"]'::jsonb,
  '[{"text":"1 kg kartoffel","raavare_id":null,"amount":null,"unit":null},{"text":"3 dl mælk","raavare_id":null,"amount":null,"unit":null},{"text":"50 g smør","raavare_id":null,"amount":null,"unit":null},{"text":"salt og hvid peber","raavare_id":null,"amount":null,"unit":null},{"text":"1 knivspids revet muskatnød","raavare_id":null,"amount":null,"unit":null},{"text":"3 store løg","raavare_id":"ing_loeg","amount":null,"unit":null},{"text":"2 gulerødder","raavare_id":"ing_extra_4","amount":null,"unit":null},{"text":"2 spsk olivenolie","raavare_id":null,"amount":null,"unit":null},{"text":"20 g smør","raavare_id":null,"amount":null,"unit":null},{"text":"1 dåse grønne linser i vand","raavare_id":null,"amount":null,"unit":null},{"text":"salt og peber","raavare_id":null,"amount":null,"unit":null},{"text":"6 kviste frisk timian","raavare_id":null,"amount":null,"unit":null},{"text":"2 spsk mørk balsamicoeddike","raavare_id":null,"amount":null,"unit":null},{"text":"syltet rødbede","raavare_id":null,"amount":null,"unit":null}]'::jsonb,
  '["Løg","Gulerødder"]'::jsonb
);

INSERT INTO recipes (id, titel, beskrivelse, tidsforbrug_min, portioner, billed_url, instruktioner, ingredienser, tags) VALUES (
  'meny_fixed_3_1781878444005',
  'Kalveculotte med pocherede grøntsager og kapersmayonnaise',
  'Klassisk kvalitetsopskrift, nu med korrekt data.',
  45,
  4,
  'https://cdn-rdb.arla.com/dagrofa-dk/kalveculotte-pocherede-groentsager-og-kapersmayonnaise/1091642552.jpg?w=960&h=439&anchor=middlecenter&mode=crop&scale=both&ak=8567bf50&hm=73811dac',
  '["Fjern sener og rids kalveculotten.","Brun den af på en pande i smør.","Krydr med salt, peber og rosmarin.","Pak culotten ind i folie og langtidssteg den i ovn ved 100 grader° i ca. 2 timer.","Tag culotten ud af ovnen og lad den gerne trække i 15 min. inden udskæring.","Bland ingredienser til kapersmayonnaise sammen.","Kog pocheringslagen op, lad den stå og simre lige under kogepunktet.","Klargør alle grøntsagerne, skal være lange rustikke stykker.","Kom asparges, gulerod, fennikel, squash og forårsløg i lagen, giv det 3 min.","Grøntsagerne skal være sprøde.","Afdryppes i sigte.","Anret skiver af kalveculotte med de pocherede grøntsager og kapers mayonnaise.","Hovedret"]'::jsonb,
  '[{"text":"900 g kalveculotter","raavare_id":"ing_kalveculotte","amount":null,"unit":null},{"text":"20 g smør","raavare_id":null,"amount":null,"unit":null},{"text":"salt & sort peber","raavare_id":null,"amount":null,"unit":null},{"text":"6 dl vand","raavare_id":null,"amount":null,"unit":null},{"text":"1 løg i både","raavare_id":"ing_loeg","amount":null,"unit":null},{"text":"3 laurbærblade","raavare_id":null,"amount":null,"unit":null},{"text":"25 g smør","raavare_id":null,"amount":null,"unit":null},{"text":"1 tsk salt","raavare_id":null,"amount":null,"unit":null},{"text":"3 spsk hvidvinseddike","raavare_id":"ing_extra_40","amount":null,"unit":null},{"text":"150 g grønne asparges","raavare_id":"ing_asparges","amount":null,"unit":null},{"text":"4 gulerødder skåret på langs","raavare_id":"ing_extra_4","amount":null,"unit":null},{"text":"1 fennikel skåret i både på langs","raavare_id":"ing_fennikel","amount":null,"unit":null},{"text":"1 grøn squash skåret på langs","raavare_id":null,"amount":null,"unit":null},{"text":"8 forårsløg i halve","raavare_id":"ing_foraarssloeg","amount":null,"unit":null},{"text":"2 dl mayonnaise","raavare_id":"ing_mayonnaise","amount":null,"unit":null},{"text":"1 tsk dijonsennep","raavare_id":null,"amount":null,"unit":null},{"text":"40 g kapers grofthakket","raavare_id":"ing_kapers","amount":null,"unit":null}]'::jsonb,
  '["Kalveculotte","Løg","Hvidvin","Grønne Asparges","Gulerødder","Fennikel","Forårsløg","Mayonnaise","Kapers"]'::jsonb
);

INSERT INTO recipes (id, titel, beskrivelse, tidsforbrug_min, portioner, billed_url, instruktioner, ingredienser, tags) VALUES (
  'meny_fixed_4_1781878444005',
  'Mormors vintertarteletter',
  'Klassisk kvalitetsopskrift, nu med korrekt data.',
  45,
  4,
  'https://cdn-rdb.arla.com/dagrofa-dk/mormors-vintertarteletter/2334178314.jpg?w=960&h=439&anchor=middlecenter&mode=crop&scale=both&ak=8567bf50&hm=73811dac',
  '["Kom kyllingen i en gryde, og dæk den med vand.","Halvér løget, og kom det i gryden sammen med toppen af porren.","Skær én gulerod groft, og kom i gryden.","I starten dannes der skum på toppen af suppen.","Skum dette af med en hulske.","Kog kyllingen i 50 min. ved svag varme.","Tag kyllingen op, og lad den køle så meget af, at skindet kan tages af.","Sigt suppen.","Du skal bruge 4 dl til tarteletfyldet.","Resten kan du fryse – det kan f.eks. bruges til en suppe eller risotto.","Pil kødet af skroget, og tag cirka 300 g til tarteletfyld.","Del kødet i mindre stykker.","Skræl den anden gulerod, og skær i små tern.","Snit resten af porren i tynde skiver.","Smelt smør i en gryde, og drys melet i.","Steg det i et minut, og hæld så suppe i, mens der piskes.","Kom fløde, gulerødder og porrer i, og krydr med salt og hvid peber.","Lad grøntsagerne simre i suppen i 5 min.","Tilsæt så kyllingekødet, og varm det igennem.","Hak persillen, og kom den i.","Servér i varme tarteletter.","Gryderet"]'::jsonb,
  '[{"text":"1 kylling","raavare_id":"ing_kyllingebryst","amount":null,"unit":null},{"text":"1 liter vand","raavare_id":null,"amount":null,"unit":null},{"text":"1 løg","raavare_id":"ing_loeg","amount":null,"unit":null},{"text":"1 porre","raavare_id":null,"amount":null,"unit":null},{"text":"2 gulerødder","raavare_id":"ing_extra_4","amount":null,"unit":null},{"text":"salt og hvid peber","raavare_id":null,"amount":null,"unit":null},{"text":"50 g smør","raavare_id":null,"amount":null,"unit":null},{"text":"3 spsk hvedemel","raavare_id":null,"amount":null,"unit":null},{"text":"1 dl piskefløde","raavare_id":null,"amount":null,"unit":null},{"text":"4 dl hønsekødssuppe","raavare_id":null,"amount":null,"unit":null},{"text":"1 dl kruspersille","raavare_id":null,"amount":null,"unit":null},{"text":"tilbehør: lune tartelet","raavare_id":null,"amount":null,"unit":null}]'::jsonb,
  '["Kyllingebryst","Løg","Gulerødder"]'::jsonb
);

INSERT INTO recipes (id, titel, beskrivelse, tidsforbrug_min, portioner, billed_url, instruktioner, ingredienser, tags) VALUES (
  'meny_fixed_5_1781878444005',
  'Tærte med rødbede, gedeost og rødløg',
  'Klassisk kvalitetsopskrift, nu med korrekt data.',
  45,
  4,
  'https://cdn-rdb.arla.com/dagrofa-dk/tarte-rodbede-gedeost-rodlog/3486233604.jpg?w=960&h=439&anchor=middlecenter&mode=crop&scale=both&ak=8567bf50&hm=73811dac',
  '["Smør en tærteform på ca. 22-24 cm. med smør.","Bland de to slags mel med salt og smuldr det kolde smør i med fingrene til det ligner grov rasp.","Kom æggeblomme og en smule vand i og saml dejen.","Den skal ikke æltes.","Saml dejen til en kugle og tryk den lidt flad.","Pak dejen ind i plastfolie og lad den hvile i køleskabet i 30 min.","Rul dejen ud til en stor cirkel og kom den i tærteformen. Det er nemt at gøre det mellem to stykker bagepapir.","Trim kanterne på tærten og dæk den med bagepapir.","Kom bagebønner eller ris i for at veje ned og forbag tærtebunden i 15 min. ved 180 °C.","Fjern bagebønner og bagepapir og bag tærten i yderligere 5 min. til den er let gylden.","Til fyldet skrælles bederne, skæres i både og kommes i et ovnfast fad.","Skær løgene i kvarte og kom dem i fadet med bederne.","Dryp olivenolie over og krydr med lidt salt og peber.","Bag grøntsagerne i 30 min. ved 200 °C.","Læg beder og rødløg i den forbagte tærteform.","Smuldr gedeosten i grove stykker og læg dem ned mellem grøntsagerne.","Drys med timian.","Rør æg sammen med piskefløde, creme fraiche og dijonsennep og krydr med lidt salt og peber.","Hæld blandingen i tærteformen og bag tærten i ca. 30 min ved 180 °C til æggemassen har sat sig.","Tærter"]'::jsonb,
  '[{"text":"150 g hvedemel","raavare_id":null,"amount":null,"unit":null},{"text":"50 g ølandshvedemel (fuldkorn)","raavare_id":null,"amount":null,"unit":null},{"text":"100 g koldt smør skåret i tern. + 1tsk. til formen","raavare_id":null,"amount":null,"unit":null},{"text":"1 tsk flagesalt","raavare_id":null,"amount":null,"unit":null},{"text":"1 æggeblomme","raavare_id":null,"amount":null,"unit":null},{"text":"1 spsk koldt vand","raavare_id":null,"amount":null,"unit":null},{"text":"400 g rødbeder","raavare_id":null,"amount":null,"unit":null},{"text":"3 små rødløg","raavare_id":"ing_loeg","amount":null,"unit":null},{"text":"1 spsk olivenolie","raavare_id":null,"amount":null,"unit":null},{"text":"salt og peber","raavare_id":null,"amount":null,"unit":null},{"text":"75 g friske gedeoste","raavare_id":null,"amount":null,"unit":null},{"text":"2 spsk frisk timian","raavare_id":null,"amount":null,"unit":null},{"text":"3 æg","raavare_id":null,"amount":null,"unit":null},{"text":"1 dl piskefløde","raavare_id":null,"amount":null,"unit":null},{"text":"100 g creme fraiche (18%)","raavare_id":"ing_cremefraiche","amount":null,"unit":null},{"text":"2 spsk dijonsennep","raavare_id":null,"amount":null,"unit":null}]'::jsonb,
  '["Løg","Creme Fraiche"]'::jsonb
);

INSERT INTO recipes (id, titel, beskrivelse, tidsforbrug_min, portioner, billed_url, instruktioner, ingredienser, tags) VALUES (
  'meny_fixed_6_1781878444006',
  'Ramen med smilende æg, boghvedenudler og sprød topping',
  'Klassisk kvalitetsopskrift, nu med korrekt data.',
  45,
  4,
  'https://cdn-rdb.arla.com/dagrofa-dk/ramen-smilende-ag-boghvedenudler-og-sprod-topping/3225438588.jpg?w=960&h=439&anchor=middlecenter&mode=crop&scale=both&ak=8567bf50&hm=73811dac',
  '["Kog æggene i 8 minutter, og køl dem ned under rindende koldt vand.","Kog boghvedenudlerne efter pakkens anvisning.","Bring grønsagsbouillonen i kog, og tilsæt fløde.","Smag suppen til med sojasauce.","Fordel nudlerne i fire passende skåle.","Snit spidskål og chili fint.","Svits østershattene gyldne på panden i en smule olie.","Kom enoki, østershatte, spidskål, gulerødder, chili og bønnespirer i skålene, og hæld den varme suppe over fyldet.","Pil æggene, og skær dem i halve.","Top hver suppe med to halve æg, og pynt til sidst med frisk koriander, et drys ristede sesamfrø og friskkværnet peber.","Grøntsager","Mellemøsten","Vegetar","Hovedret"]'::jsonb,
  '[{"text":"4 æg","raavare_id":null,"amount":null,"unit":null},{"text":"400 g boghvede nudler","raavare_id":null,"amount":null,"unit":null},{"text":"1 liter grøntsagsbouillon","raavare_id":null,"amount":null,"unit":null},{"text":"2 dl fløde","raavare_id":null,"amount":null,"unit":null},{"text":"4 spsk sojasauce","raavare_id":"ing_soja","amount":null,"unit":null},{"text":"100 g lilla spidskål","raavare_id":"ing_spidskaal","amount":null,"unit":null},{"text":"1 frisk chili","raavare_id":"ing_frisk_chili","amount":null,"unit":null},{"text":"100 g østershatte","raavare_id":"ing_oestershatte","amount":null,"unit":null},{"text":"lidt olie til stegning","raavare_id":null,"amount":null,"unit":null},{"text":"100 g enokisvampe","raavare_id":"ing_champignon","amount":null,"unit":null},{"text":"80 g bønnespirer","raavare_id":"ing_boennespirer","amount":null,"unit":null},{"text":"ristede sesamfrø","raavare_id":"ing_sesam","amount":null,"unit":null},{"text":"friskkværnet peber","raavare_id":null,"amount":null,"unit":null}]'::jsonb,
  '["Sojasauce","Spidskål","Frisk Chili","Østershatte","Champignon","Bønnespirer","Sesamfrø"]'::jsonb
);

INSERT INTO recipes (id, titel, beskrivelse, tidsforbrug_min, portioner, billed_url, instruktioner, ingredienser, tags) VALUES (
  'meny_fixed_7_1781878444006',
  'Bagt kartoffel med linsechili, korianderdressing og ost',
  'Klassisk kvalitetsopskrift, nu med korrekt data.',
  45,
  4,
  'https://cdn-rdb.arla.com/dagrofa-dk/bagt-kartoffel-med-linsechili-korianderdressing-og-ost/2216890339.jpg?w=960&h=439&anchor=middlecenter&mode=crop&scale=both&ak=8567bf50&hm=73811dac',
  '["Vask kartoflerne, og dup dem tørre.","Prik dem et par steder med en kødnål, og pak dem ind i alufolie.","Bag dem på en rist i ovnen i 1 time og 15 min. ved 200 °C.","Skær løg i små tern, og hak hvidløget fint.","Riv guleroden.","Varm olien i en gryde, og svits løg og gulerødder i 4 min.","Tilsæt hvidløg, og steg videre i 1 minut.","Kom spidskommen, paprika og røget paprika i sammen med tomatpuré, og steg det i 1 minut.","Tilsæt vand og linser, og kom lidt salt og peber i.","Lad retten simre i 15 min.","Blend koriander og fraiche sammen, og smag til med salt og peber.","Tag kartoflerne ud af folien, og skær et snit ned gennem toppen af skindet, så kartoflen kan åbnes.","Fyld linsechili i, og top med dressing, revet ost, hakket koriander og chili.","Grøntsager"]'::jsonb,
  '[{"text":"1 løg","raavare_id":"ing_loeg","amount":null,"unit":null},{"text":"4 bagekartofler","raavare_id":"ing_extra_3","amount":null,"unit":null},{"text":"1 fed hvidløg","raavare_id":"ing_loeg","amount":null,"unit":null},{"text":"1 gulerod","raavare_id":null,"amount":null,"unit":null},{"text":"1 spsk olivenolie","raavare_id":null,"amount":null,"unit":null},{"text":"1 tsk stødt spidskommen","raavare_id":null,"amount":null,"unit":null},{"text":"1 tsk paprika","raavare_id":null,"amount":null,"unit":null},{"text":"0.5 tsk røget paprika","raavare_id":null,"amount":null,"unit":null},{"text":"2 spsk koncentreret tomatpuré","raavare_id":null,"amount":null,"unit":null},{"text":"4 dl vand","raavare_id":null,"amount":null,"unit":null},{"text":"150 g tørrede røde linser","raavare_id":null,"amount":null,"unit":null},{"text":"1 knivspids salt og peber","raavare_id":null,"amount":null,"unit":null},{"text":"1 håndfuld frisk koriander + ekstra til servering","raavare_id":"ing_koriander","amount":null,"unit":null},{"text":"2 dl økologisk creme fraiche 9%","raavare_id":"ing_cremefraiche","amount":null,"unit":null},{"text":"150 g revet mozzarellaost","raavare_id":null,"amount":null,"unit":null},{"text":"1 frisk chili","raavare_id":"ing_frisk_chili","amount":null,"unit":null}]'::jsonb,
  '["Løg","Kartofler","Frisk Koriander","Creme Fraiche","Frisk Chili"]'::jsonb
);

INSERT INTO recipes (id, titel, beskrivelse, tidsforbrug_min, portioner, billed_url, instruktioner, ingredienser, tags) VALUES (
  'meny_fixed_8_1781878444010',
  'Dhal',
  'Klassisk kvalitetsopskrift, nu med korrekt data.',
  45,
  4,
  'https://cdn-rdb.arla.com/dagrofa-dk/dhal/3890328785.jpg?w=960&h=439&anchor=middlecenter&mode=crop&scale=both&ak=8567bf50&hm=73811dac',
  '["Svits krydderier, løg og hvidløg i en gryde i et par minutter.","Brug lidt vand eller olie, så det ikke brænder på.","Skyl linserne og put dem i gryden sammen med salt, sukker, tomatpure og vand.","Lad retten koge i 25 minutter under låg.","Smag til med salt og chili.","Server retten sammen med ris og eksempelvis frisk koriander, mangochutney, ananasstykker, peanuts, tzatziki og brød.","Forret","Tilbehør","Gryderet"]'::jsonb,
  '[{"text":"150 g tørrede grønne linser","raavare_id":null,"amount":null,"unit":null},{"text":"250 g tørrede røde linser","raavare_id":null,"amount":null,"unit":null},{"text":"1 løg, hakket","raavare_id":"ing_loeg","amount":null,"unit":null},{"text":"4 fed hvidløg, pressede","raavare_id":"ing_loeg","amount":null,"unit":null},{"text":"2 tsk frisk koriander","raavare_id":"ing_koriander","amount":null,"unit":null},{"text":"2 tsk stødt spidskommen","raavare_id":null,"amount":null,"unit":null},{"text":"2 tsk stødt gurkemeje & evt. chilipulver","raavare_id":"ing_chili","amount":null,"unit":null},{"text":"2 tsk salt","raavare_id":null,"amount":null,"unit":null},{"text":"1 tsk sukker","raavare_id":null,"amount":null,"unit":null},{"text":"70 g koncentreret tomatpuré","raavare_id":null,"amount":null,"unit":null},{"text":"1 liter vand","raavare_id":null,"amount":null,"unit":null}]'::jsonb,
  '["Løg","Frisk Koriander","Chilipulver"]'::jsonb
);

INSERT INTO recipes (id, titel, beskrivelse, tidsforbrug_min, portioner, billed_url, instruktioner, ingredienser, tags) VALUES (
  'meny_fixed_9_1781878444010',
  'Gulerodsboller',
  'Klassisk kvalitetsopskrift, nu med korrekt data.',
  45,
  4,
  'https://cdn-rdb.arla.com/dagrofa-dk/gulerodsboller1/3318067509.jpg?w=960&h=439&anchor=middlecenter&mode=crop&scale=both&ak=8567bf50&hm=73811dac',
  '["Der bliver ca. 16-18 boller.","Lun kærnemælken og rør gæren ud.","Rør groftrevne gulerødder og de øvrige ingredienser i dejen - hold lidt af melet tilbage.","Sørg for at dejen ikke bliver for fast.","Lad dejen hæve lunt, tildækket ca. 1 time.","Sæt store spiseskefulde af dejen på plader med bagepapir og lad bollerne efterhæve 8-10 minutter.","Bag bollerne gyldne og sprøde ved 200 grader i 20-25 minutter, og afkøl på en bagerist. Opskrift og styling: Udviklet af Vibeke Lehn.","Brød og kager","Brød og boller"]'::jsonb,
  '[{"text":"50 g gær","raavare_id":null,"amount":null,"unit":null},{"text":"1 liter kærnemælk","raavare_id":null,"amount":null,"unit":null},{"text":"4 gulerødder","raavare_id":"ing_extra_4","amount":null,"unit":null},{"text":"1 spsk groft salt","raavare_id":null,"amount":null,"unit":null},{"text":"1 spsk honning","raavare_id":null,"amount":null,"unit":null},{"text":"35 g ristede pinjekerner","raavare_id":null,"amount":null,"unit":null},{"text":"2 spsk revet appelsinskal (usprøjtet)","raavare_id":null,"amount":null,"unit":null},{"text":"600 g grahamsmel","raavare_id":null,"amount":null,"unit":null},{"text":"Ca. 650 g hvedemel","raavare_id":null,"amount":null,"unit":null}]'::jsonb,
  '["Gulerødder"]'::jsonb
);

INSERT INTO recipes (id, titel, beskrivelse, tidsforbrug_min, portioner, billed_url, instruktioner, ingredienser, tags) VALUES (
  'meny_fixed_10_1781878444010',
  'Coq au vin',
  'Klassisk kvalitetsopskrift, nu med korrekt data.',
  45,
  4,
  'https://cdn-rdb.arla.com/dagrofa-dk/coq-au-vin-0/2836405550.jpeg?w=960&h=439&anchor=middlecenter&mode=crop&scale=both&ak=8567bf50&hm=73811dac',
  '["Varm smøret op i en sautepande til det bruser.","Kom de 8 stykker kylling i og brun dem godt på alle sider, krydr med salt og peber.","Tag derefter kyllingen op på et fad.","Brun bacon, skalotteløg og champignons til det er gyldent i cirka 5 minutter.","Kom vin på og lad det komme i kog.","Tilsæt derefter hønsebouillon og lad det simre i 5 minutter.","Kom de brunede kyllingestykker, hvidløg og timian i et ovnfast fad, hæld bacon og vin blandingen over og steges i ovn ved 160 grader i 35 minutter til kyllingen er mør.","Smages til med salt, peber og frisk timian.","Pynt med snittet bladselleri.","Fjerkræ","Svin","Hovedret"]'::jsonb,
  '[{"text":"25 g smør","raavare_id":null,"amount":null,"unit":null},{"text":"1 kylling 1600 g (delt i 8 stykker)","raavare_id":"ing_kyllingebryst","amount":null,"unit":null},{"text":"salt og friskkværnet peber","raavare_id":null,"amount":null,"unit":null},{"text":"150 g bacontern","raavare_id":null,"amount":null,"unit":null},{"text":"300 g skalotteløg /perleløg, pillede i halve","raavare_id":"ing_loeg","amount":null,"unit":null},{"text":"150 g champignoner rengjorte i halve","raavare_id":"ing_champignon","amount":null,"unit":null},{"text":"salt og friskkværnet peber","raavare_id":null,"amount":null,"unit":null},{"text":"3 dl rødvin","raavare_id":null,"amount":null,"unit":null},{"text":"300 ml (3 dl) hønsefond","raavare_id":null,"amount":null,"unit":null},{"text":"2 fed hvidløg i skiver","raavare_id":"ing_loeg","amount":null,"unit":null},{"text":"4 frisk timian","raavare_id":null,"amount":null,"unit":null},{"text":"fintsnittet bladselleri","raavare_id":null,"amount":null,"unit":null}]'::jsonb,
  '["Kyllingebryst","Gris","Løg","Champignon","Vin"]'::jsonb
);

INSERT INTO recipes (id, titel, beskrivelse, tidsforbrug_min, portioner, billed_url, instruktioner, ingredienser, tags) VALUES (
  'meny_fixed_11_1781878444010',
  'Grillet flæskestegssandwich',
  'Klassisk kvalitetsopskrift, nu med korrekt data.',
  45,
  4,
  'https://cdn-rdb.arla.com/dagrofa-dk/grillet-flaskestegssandwich/4596839.jpg?w=960&h=439&anchor=middlecenter&mode=crop&scale=both&ak=8567bf50&hm=73811dac',
  '["Gnid flæskestegen med salt og peber, og grill den ved indirekte varme, eller steg den i ovnen i 45 min. til 1 time ved 200 °C, eller til den har en centrumtemperatur på 74 °C.","Skær stegen i skiver.","Snit kålen fint, og bland med revet gulerod og ærteskud.","Vend salaten sammen med olivenolie og hvidvinseddike, og krydr med lidt salt og peber.","Lun burgerbollerne, og smør dem med sriracha mayo.","Kom 1-2 skiver flæskesteg i hver burger, og top med salat og syltede agurker.","Grill"]'::jsonb,
  '[{"text":"1 kg flæskesteg","raavare_id":"ing_extra_14","amount":null,"unit":null},{"text":"salt","raavare_id":null,"amount":null,"unit":null},{"text":"sort peber","raavare_id":null,"amount":null,"unit":null},{"text":"200 g spidskål","raavare_id":"ing_spidskaal","amount":null,"unit":null},{"text":"150 g revet gulerødder","raavare_id":"ing_extra_4","amount":null,"unit":null},{"text":"1 håndfuld ærteskud","raavare_id":null,"amount":null,"unit":null},{"text":"2 spsk olivenolie","raavare_id":null,"amount":null,"unit":null},{"text":"2 spsk hvidvinseddike","raavare_id":"ing_extra_40","amount":null,"unit":null},{"text":"4 brioche burgerboller","raavare_id":"ing_burgerboller","amount":null,"unit":null},{"text":"8 spsk sriracha mayonnaise","raavare_id":"ing_mayonnaise","amount":null,"unit":null},{"text":"100 g syltet agurker","raavare_id":"ing_extra_2","amount":null,"unit":null},{"text":"agurk i skiver","raavare_id":"ing_extra_2","amount":null,"unit":null},{"text":"citronskal (usprøjtet)","raavare_id":null,"amount":null,"unit":null},{"text":"evt. mynte","raavare_id":null,"amount":null,"unit":null}]'::jsonb,
  '["Flæskesteg","Spidskål","Gulerødder","Hvidvin","Burgerboller","Mayonnaise","Agurk"]'::jsonb
);

INSERT INTO recipes (id, titel, beskrivelse, tidsforbrug_min, portioner, billed_url, instruktioner, ingredienser, tags) VALUES (
  'meny_fixed_12_1781878444011',
  'Broccolipesto med sprøde rugbrødschips',
  'Klassisk kvalitetsopskrift, nu med korrekt data.',
  45,
  4,
  'https://cdn-rdb.arla.com/dagrofa-dk/broccolipesto-sproede-rugbroedschips/2735059494.jpg?w=960&h=439&anchor=middlecenter&mode=crop&scale=both&ak=8567bf50&hm=73811dac',
  '["Kom rå broccoli i foodprocessor og kør til det er findelt, kom ristede hasselnødder, persille ved og kør igen med foodprocessor.","Tilsæt chili, knust hvidløg, vand, citronsaft, salt og oliven olie.","Blend broccolipesto til ensartet konsistens.","Server på rugbrødschips.","Kan også bruges som dip, i pasta salat, i salat skålen eller som spread i sandwich.","Klima Kærlig opskrift","Snacks","Tilbehør","Salater"]'::jsonb,
  '[{"text":"50 g hasselnødder","raavare_id":"ing_hasselnoedder","amount":null,"unit":null},{"text":"250 g broccoli","raavare_id":"ing_broccoli","amount":null,"unit":null},{"text":"1 dl kruspersille","raavare_id":null,"amount":null,"unit":null},{"text":"1 tsk hakket rød chilipeber","raavare_id":null,"amount":null,"unit":null},{"text":"1 fed hvidløg","raavare_id":"ing_loeg","amount":null,"unit":null},{"text":"0.5 dl vand","raavare_id":null,"amount":null,"unit":null},{"text":"2 spsk friskpresset citronsaft","raavare_id":null,"amount":null,"unit":null},{"text":"1 tsk salt","raavare_id":null,"amount":null,"unit":null},{"text":"1 dl olivenolie","raavare_id":null,"amount":null,"unit":null},{"text":"100 g rugbrødschips med salt som tilbehør","raavare_id":"ing_rugbroedschips","amount":null,"unit":null}]'::jsonb,
  '["Hasselnødder","Broccoli","Løg","Rugbrødschips"]'::jsonb
);

INSERT INTO recipes (id, titel, beskrivelse, tidsforbrug_min, portioner, billed_url, instruktioner, ingredienser, tags) VALUES (
  'meny_fixed_13_1781878444011',
  'Tærte med laks, Anicia linser og spinat',
  'Klassisk kvalitetsopskrift, nu med korrekt data.',
  45,
  4,
  'https://cdn-rdb.arla.com/dagrofa-dk/tarte-laks-anicia-linser-spinat/17106490.jpg?w=960&h=439&anchor=middlecenter&mode=crop&scale=both&ak=8567bf50&hm=73811dac',
  '["Skyl og kog Anicia linserne i rigeligt letsaltet vand i 20-25 minutter. Hæld vandet fra linserne, og stil dem til side.","Tærtedej","Bland ærtemel og salt i en skål.","Med hænderne smuldres smørret heri.","Tilsæt cremefraiche og rør det hele godt sammen med en ske.","Smør et tærtefad med smagsneutral olie eller evt. smør.","Rul dejen ud på et stykke bagepapir med en kagerulle, eller brug fingrene til at trykke dejen direkte ud i den smurte tærteform.","Prik små huller i dejen med en gaffel.","Forbag tærtedejen i ovnen i 5 minutter ved 175 grader varmluft.","Tærtefyld","Fjern skindet fra laksen og skær den i mindre stykker.","Hak hvidløg fint og skyl spinaten.","Steg spinat og hvidløg på en varm pande i lidt olie så spinaten falder sammen.","Pisk æg, cremefraiche, salt og peber sammen i en skål.","Fordel de kogte Anicia linser, spinat og laks i den forbagte tærtedej, og hæld æggemassen over.","Bag tærten i 20-25 min ved 175 grader varmluft til den er gylden og fast.","Vi siger tak: Opskriften er udviklet af Pure Dansk.","Tærter","Fisk og skaldyr","Hovedret"]'::jsonb,
  '[{"text":"200 g ærtemel","raavare_id":null,"amount":null,"unit":null},{"text":"1 dl creme fraiche 38% (eller anden fedtprocent)","raavare_id":"ing_cremefraiche","amount":null,"unit":null},{"text":"100 g smør","raavare_id":null,"amount":null,"unit":null},{"text":"salt","raavare_id":null,"amount":null,"unit":null},{"text":"0.5 dl tørrede anicia linser","raavare_id":null,"amount":null,"unit":null},{"text":"300 g ferske laks","raavare_id":null,"amount":null,"unit":null},{"text":"5 æg","raavare_id":null,"amount":null,"unit":null},{"text":"1 dl creme fraiche 38% (eller anden fedtprocent)","raavare_id":"ing_cremefraiche","amount":null,"unit":null},{"text":"200 g frisk spinat","raavare_id":"ing_extra_9","amount":null,"unit":null},{"text":"1 fed hvidløg","raavare_id":"ing_loeg","amount":null,"unit":null},{"text":"salt og peber","raavare_id":null,"amount":null,"unit":null}]'::jsonb,
  '["Creme Fraiche","Frisk Spinat","Løg"]'::jsonb
);

INSERT INTO recipes (id, titel, beskrivelse, tidsforbrug_min, portioner, billed_url, instruktioner, ingredienser, tags) VALUES (
  'meny_fixed_14_1781878444011',
  'Traditionelle æbleskiver med kanel og æbletern',
  'Klassisk kvalitetsopskrift, nu med korrekt data.',
  45,
  4,
  'https://cdn-rdb.arla.com/dagrofa-dk/traditionelle-aebleskiver-kanel-og-aebletern/1687672909.jpg?w=960&h=439&anchor=middlecenter&mode=crop&scale=both&ak=8567bf50&hm=73811dac',
  '["Pisk æg skummende sammen med sukker og kærnemælk.","Bland mel med kardemomme og natron og rør det i dejen, så der ingen klumper er.","Vend æbletern med citronsaft og kanel.","Steg æbleskiverne i smør i en æbleskivepande.","Fyld hullerne 2/3 op og kom et stykke æble i hver.","Vend dem først en kvart omgang og så resten af vejen, så sikrer du flotte runde æbleskiver.","Drys med flormelis ved servering.","Kager","Søde sager","Brød og kager","Vinter"]'::jsonb,
  '[{"text":"2 æg","raavare_id":null,"amount":null,"unit":null},{"text":"2 spsk sukker","raavare_id":null,"amount":null,"unit":null},{"text":"5 dl kærnemælk","raavare_id":null,"amount":null,"unit":null},{"text":"250 g hvedemel","raavare_id":null,"amount":null,"unit":null},{"text":"0.5 tsk stødt kardemomme","raavare_id":null,"amount":null,"unit":null},{"text":"1 tsk natron","raavare_id":null,"amount":null,"unit":null},{"text":"1 æble i små tern","raavare_id":"ing_aeble","amount":null,"unit":null},{"text":"1 tsk friskpresset citronsaft","raavare_id":null,"amount":null,"unit":null},{"text":"1 tsk stødt kanel","raavare_id":"ing_kanel","amount":null,"unit":null},{"text":"smør til stegning","raavare_id":null,"amount":null,"unit":null},{"text":"1 spsk flormelis til drys","raavare_id":null,"amount":null,"unit":null}]'::jsonb,
  '["Æble","Stødt Kanel"]'::jsonb
);

INSERT INTO recipes (id, titel, beskrivelse, tidsforbrug_min, portioner, billed_url, instruktioner, ingredienser, tags) VALUES (
  'meny_fixed_15_1781878444011',
  'Græskar-, æble- og klementinchutney',
  'Klassisk kvalitetsopskrift, nu med korrekt data.',
  45,
  4,
  'https://cdn-rdb.arla.com/dagrofa-dk/graeskar-aeble-og-klementinchutney/4078729564.jpg?w=960&h=439&anchor=middlecenter&mode=crop&scale=both&ak=8567bf50&hm=73811dac',
  '["Pil løget og skær det i skiver.","Hak hvidløg, ingefær og chili fint.","Vask græskarret grundigt, så skrællen kan bruges.","Start med at halvere græskarret og fjern kernerne med en spiseske.","Skær herefter græskarret ud i tern, ca. 2x2 cm og sæt til side.","Halvér æbler, fjern kernehuset, og skær dem ud i tern.","Del klementinerne i både og halvér dem.","Sæt også æbler og klementiner til side.","Knus sennepskorn, korianderfrø og fennikelfrø i en morder, og rist dem af i en gryde.","Hæld olie i gryden sammen med de øvrige ingredienser på nær klementinerne.","Lad det stege i 5 minutter.","Tilsæt vand, og lad det koge i 5 minutter, inden æbleeddiken tilsættes.","Lad chutneyen koge ved svag varme i 45 minutter.","Vend klementinerne i den lune chutney og hæld den på skoldede syltetøjsglas.","Sæt chutneyen på køl og lad den stå i minimum et døgn, inden den spises.","Tip: Sørg for at skolde glassene, så chutneyen kan holde i flere måneder.","Tilbehør"]'::jsonb,
  '[{"text":"3 fed hvidløg","raavare_id":"ing_loeg","amount":null,"unit":null},{"text":"1 løg","raavare_id":"ing_loeg","amount":null,"unit":null},{"text":"50 g frisk ingefær","raavare_id":"ing_extra_12","amount":null,"unit":null},{"text":"1 rød chilipeber","raavare_id":null,"amount":null,"unit":null},{"text":"500 g hokkaido græskar","raavare_id":"ing_graeskar","amount":null,"unit":null},{"text":"250 g æbler","raavare_id":"ing_aeble","amount":null,"unit":null},{"text":"1.5 clementiner","raavare_id":null,"amount":null,"unit":null},{"text":"1 tsk sennepskorn","raavare_id":null,"amount":null,"unit":null},{"text":"1 tsk korianderfrø","raavare_id":null,"amount":null,"unit":null},{"text":"1 tsk fennikelfrø","raavare_id":"ing_fennikel","amount":null,"unit":null},{"text":"1 tsk salt","raavare_id":null,"amount":null,"unit":null},{"text":"2 spsk olivenolie","raavare_id":null,"amount":null,"unit":null},{"text":"1 dl vand","raavare_id":null,"amount":null,"unit":null},{"text":"3 dl æbleeddike","raavare_id":"ing_aeble","amount":null,"unit":null}]'::jsonb,
  '["Løg","Frisk Ingefær","Hokkaido Græskar","Æble","Fennikel"]'::jsonb
);

INSERT INTO recipes (id, titel, beskrivelse, tidsforbrug_min, portioner, billed_url, instruktioner, ingredienser, tags) VALUES (
  'meny_fixed_16_1781878444012',
  'Banan-chokoladepandekager',
  'Klassisk kvalitetsopskrift, nu med korrekt data.',
  45,
  4,
  'https://cdn-rdb.arla.com/dagrofa-dk/banan-chokoladepandekager/3062175351.jpg?w=960&h=439&anchor=middlecenter&mode=crop&scale=both&ak=8567bf50&hm=73811dac',
  '["Bland bananmos med kakaomælk og pisk æg, sukker og vanilje i.","Kom hvedemel, bagepulver, salt, kanel og chokolade i skålen og rør det hurtigt sammen – det skal ikke røres for meget.","Lad dejen hvile i 10 min. og steg små pandekager i en pande med smør.","Når der kommer små bobler på overfladen, skal de vendes.","Server med skiver af banan og ahornsirup.","Frugt"]'::jsonb,
  '[{"text":"200 g moset moden bananer","raavare_id":"ing_extra_7","amount":null,"unit":null},{"text":"2.5 dl Matilde® Premium Kakaoletmælk","raavare_id":null,"amount":null,"unit":null},{"text":"1 stort æg","raavare_id":null,"amount":null,"unit":null},{"text":"2 spsk rørsukker","raavare_id":null,"amount":null,"unit":null},{"text":"1 tsk vaniljesukker","raavare_id":"ing_vanilje","amount":null,"unit":null},{"text":"190 g hvedemel","raavare_id":null,"amount":null,"unit":null},{"text":"2 tsk bagepulver","raavare_id":"ing_bagepulver","amount":null,"unit":null},{"text":"0.25 tsk salt","raavare_id":null,"amount":null,"unit":null},{"text":"0.25 tsk stødt kanel","raavare_id":"ing_kanel","amount":null,"unit":null},{"text":"50 g grofthakket mørk chokolade","raavare_id":"ing_mork_chokolade","amount":null,"unit":null},{"text":"smør til stegning","raavare_id":null,"amount":null,"unit":null},{"text":"banan i skiver","raavare_id":null,"amount":null,"unit":null},{"text":"ahornsirup","raavare_id":"ing_ahornsirup","amount":null,"unit":null}]'::jsonb,
  '["Bananer","Vaniljesukker","Bagepulver","Stødt Kanel","Mørk Chokolade","Ahornsirup"]'::jsonb
);

INSERT INTO recipes (id, titel, beskrivelse, tidsforbrug_min, portioner, billed_url, instruktioner, ingredienser, tags) VALUES (
  'meny_fixed_17_1781878444012',
  'Svampe-bønne stroganoff med filotopping',
  'Klassisk kvalitetsopskrift, nu med korrekt data.',
  45,
  4,
  'https://cdn-rdb.arla.com/dagrofa-dk/svampe-bonne-stroganoff-filotopping/45075023.jpg?w=960&h=439&anchor=middlecenter&mode=crop&scale=both&ak=8567bf50&hm=73811dac',
  '["Skær løg i små tern, hak hvidløget fint, og skær svampe i skiver.","Varm olien, og svits løg sammen med svampe og timian.","Krydr med lidt salt og peber.","Tilsæt tomatpuré og paprika.","Kom bønnerne inkl. den væde, de ligger i, sammen med sojasauce og fløde.","Lad retten simre i 10 min., og jævn så saucen med majsstivelse, rørt op i lidt vand.","Kom stroganoffen over i et ovnfast fad.","Rul filodejen ud.","Pensl hvert ark med lidt smør, krøl det lidt sammen, og læg det oven på stroganoffen.","Bag retten i ovnen i 15-20 min. ved 180 °C."]'::jsonb,
  '[{"text":"1 fed hvidløg","raavare_id":"ing_loeg","amount":null,"unit":null},{"text":"2 løg","raavare_id":"ing_loeg","amount":null,"unit":null},{"text":"400 g blandede svampe","raavare_id":"ing_champignon","amount":null,"unit":null},{"text":"2 spsk olivenolie","raavare_id":null,"amount":null,"unit":null},{"text":"2 spsk frisk timian","raavare_id":null,"amount":null,"unit":null},{"text":"salt og sort peber","raavare_id":null,"amount":null,"unit":null},{"text":"2 dåser sorte bønner","raavare_id":null,"amount":null,"unit":null},{"text":"1 spsk koncentreret tomatpuré","raavare_id":null,"amount":null,"unit":null},{"text":"2 tsk paprika","raavare_id":null,"amount":null,"unit":null},{"text":"2 spsk sojasauce","raavare_id":"ing_soja","amount":null,"unit":null},{"text":"2 dl piskefløde","raavare_id":null,"amount":null,"unit":null},{"text":"2 spsk majsstivelse","raavare_id":null,"amount":null,"unit":null},{"text":"4 ark filodej","raavare_id":null,"amount":null,"unit":null},{"text":"25 g smeltet smør","raavare_id":null,"amount":null,"unit":null}]'::jsonb,
  '["Løg","Champignon","Sojasauce"]'::jsonb
);

INSERT INTO recipes (id, titel, beskrivelse, tidsforbrug_min, portioner, billed_url, instruktioner, ingredienser, tags) VALUES (
  'meny_fixed_18_1781878444012',
  'Langtidsstegt lammekølle med rosmarin & rodfrugter',
  'Klassisk kvalitetsopskrift, nu med korrekt data.',
  45,
  4,
  'https://cdn-rdb.arla.com/dagrofa-dk/langtidsstegt-lammekoelle-rosmarin-rodfrugter/2522482038.jpg?w=960&h=439&anchor=middlecenter&mode=crop&scale=both&ak=8567bf50&hm=73811dac',
  '["Læg lammekøllen i et ovnfast fad og gnid den med olie, citronsaft og skal, salt og peber.","Stik rosmarin og hvidløg ind i køllen, og læg den på en rist.","Rens rodfrugter, løg og kartofler og skær dem i grove stykker.","Vend dem med olivenolie, salt og peber og kom dem, sammen med vinen, i en badepande eller et ovnfast fad, der kan stå under risten med lammekøllen.","Sæt det hele i ovnen og steg det ved 150° i ca. 3 timer.","Tilsæt løbende fløden til rodfrugterne, så de ikke koger tørre.","Skær køllen i skiver og server med rodfrugter og evt. lidt friskkogte, grønne bønner.","Påske","Hovedret"]'::jsonb,
  '[{"text":"Skal og saft af 2 citroner (usprøjtede)","raavare_id":"ing_extra_6","amount":null,"unit":null},{"text":"1 lammekølle","raavare_id":"ing_lammekoelle","amount":null,"unit":null},{"text":"2 rosmarinkviste","raavare_id":null,"amount":null,"unit":null},{"text":"4 fed hvidløg","raavare_id":"ing_loeg","amount":null,"unit":null},{"text":"2 dl god olivenolie","raavare_id":null,"amount":null,"unit":null},{"text":"groft salt","raavare_id":null,"amount":null,"unit":null},{"text":"friskkværnet peber","raavare_id":null,"amount":null,"unit":null},{"text":"1 kg kartoffel","raavare_id":null,"amount":null,"unit":null},{"text":"2 løg","raavare_id":"ing_loeg","amount":null,"unit":null},{"text":"4 gulerødder","raavare_id":"ing_extra_4","amount":null,"unit":null},{"text":"1 persillerod","raavare_id":null,"amount":null,"unit":null},{"text":"2 dl hvidvin","raavare_id":"ing_extra_40","amount":null,"unit":null},{"text":"2 dl Arla Karolines Køkken® Madlavningsfløde 15%","raavare_id":"ing_floede","amount":null,"unit":null}]'::jsonb,
  '["Citroner","Lammekølle (ca. 1,5 kg)","Løg","Gulerødder","Hvidvin","Madlavningsfløde"]'::jsonb
);

INSERT INTO recipes (id, titel, beskrivelse, tidsforbrug_min, portioner, billed_url, instruktioner, ingredienser, tags) VALUES (
  'meny_fixed_19_1781878444012',
  'Brændende kærlighed med linser',
  'Klassisk kvalitetsopskrift, nu med korrekt data.',
  45,
  4,
  'https://cdn-rdb.arla.com/dagrofa-dk/brandende-karlighed-linser/1370491136.jpg?w=960&h=439&anchor=middlecenter&mode=crop&scale=both&ak=8567bf50&hm=73811dac',
  '["Skræl kartoflerne og skær dem i halve eller kvarte.","Kog dem helt møre i usaltet vand og gem 1½ dl af kogevandet, inden det sigtes fra.","Kom mælk og smør i en gryde og varm det op, til smørret smelter.","Hæld blandingen over de varme kartofler og mos det sammen.","Smag til med salt, peber og revet muskatnød.","Skær løg i strimler og skær gulerødder i små stykker.","Varm olivenolie og smør på en pande og steg løg og gulerødder ved middel varme i 20 min. til det begynder at brune.","Sigt linserne og skyl dem med koldt vand.","Kom dem på panden sammen med lidt salt og peber, timian og balsamico eddike.","Steg videre i 5 min. og servér som topping over kartoffelmosen.","Grøntsager"]'::jsonb,
  '[{"text":"1 kg kartoffel","raavare_id":null,"amount":null,"unit":null},{"text":"3 dl mælk","raavare_id":null,"amount":null,"unit":null},{"text":"50 g smør","raavare_id":null,"amount":null,"unit":null},{"text":"salt og hvid peber","raavare_id":null,"amount":null,"unit":null},{"text":"1 knivspids revet muskatnød","raavare_id":null,"amount":null,"unit":null},{"text":"3 store løg","raavare_id":"ing_loeg","amount":null,"unit":null},{"text":"2 gulerødder","raavare_id":"ing_extra_4","amount":null,"unit":null},{"text":"2 spsk olivenolie","raavare_id":null,"amount":null,"unit":null},{"text":"20 g smør","raavare_id":null,"amount":null,"unit":null},{"text":"1 dåse grønne linser i vand","raavare_id":null,"amount":null,"unit":null},{"text":"salt og peber","raavare_id":null,"amount":null,"unit":null},{"text":"6 kviste frisk timian","raavare_id":null,"amount":null,"unit":null},{"text":"2 spsk mørk balsamicoeddike","raavare_id":null,"amount":null,"unit":null},{"text":"syltet rødbede","raavare_id":null,"amount":null,"unit":null}]'::jsonb,
  '["Løg","Gulerødder"]'::jsonb
);

INSERT INTO recipes (id, titel, beskrivelse, tidsforbrug_min, portioner, billed_url, instruktioner, ingredienser, tags) VALUES (
  'meny_fixed_20_1781878444012',
  'Kalveculotte med pocherede grøntsager og kapersmayonnaise',
  'Klassisk kvalitetsopskrift, nu med korrekt data.',
  45,
  4,
  'https://cdn-rdb.arla.com/dagrofa-dk/kalveculotte-pocherede-groentsager-og-kapersmayonnaise/1091642552.jpg?w=960&h=439&anchor=middlecenter&mode=crop&scale=both&ak=8567bf50&hm=73811dac',
  '["Fjern sener og rids kalveculotten.","Brun den af på en pande i smør.","Krydr med salt, peber og rosmarin.","Pak culotten ind i folie og langtidssteg den i ovn ved 100 grader° i ca. 2 timer.","Tag culotten ud af ovnen og lad den gerne trække i 15 min. inden udskæring.","Bland ingredienser til kapersmayonnaise sammen.","Kog pocheringslagen op, lad den stå og simre lige under kogepunktet.","Klargør alle grøntsagerne, skal være lange rustikke stykker.","Kom asparges, gulerod, fennikel, squash og forårsløg i lagen, giv det 3 min.","Grøntsagerne skal være sprøde.","Afdryppes i sigte.","Anret skiver af kalveculotte med de pocherede grøntsager og kapers mayonnaise.","Hovedret"]'::jsonb,
  '[{"text":"900 g kalveculotter","raavare_id":"ing_kalveculotte","amount":null,"unit":null},{"text":"20 g smør","raavare_id":null,"amount":null,"unit":null},{"text":"salt & sort peber","raavare_id":null,"amount":null,"unit":null},{"text":"6 dl vand","raavare_id":null,"amount":null,"unit":null},{"text":"1 løg i både","raavare_id":"ing_loeg","amount":null,"unit":null},{"text":"3 laurbærblade","raavare_id":null,"amount":null,"unit":null},{"text":"25 g smør","raavare_id":null,"amount":null,"unit":null},{"text":"1 tsk salt","raavare_id":null,"amount":null,"unit":null},{"text":"3 spsk hvidvinseddike","raavare_id":"ing_extra_40","amount":null,"unit":null},{"text":"150 g grønne asparges","raavare_id":"ing_asparges","amount":null,"unit":null},{"text":"4 gulerødder skåret på langs","raavare_id":"ing_extra_4","amount":null,"unit":null},{"text":"1 fennikel skåret i både på langs","raavare_id":"ing_fennikel","amount":null,"unit":null},{"text":"1 grøn squash skåret på langs","raavare_id":null,"amount":null,"unit":null},{"text":"8 forårsløg i halve","raavare_id":"ing_foraarssloeg","amount":null,"unit":null},{"text":"2 dl mayonnaise","raavare_id":"ing_mayonnaise","amount":null,"unit":null},{"text":"1 tsk dijonsennep","raavare_id":null,"amount":null,"unit":null},{"text":"40 g kapers grofthakket","raavare_id":"ing_kapers","amount":null,"unit":null}]'::jsonb,
  '["Kalveculotte","Løg","Hvidvin","Grønne Asparges","Gulerødder","Fennikel","Forårsløg","Mayonnaise","Kapers"]'::jsonb
);

INSERT INTO recipes (id, titel, beskrivelse, tidsforbrug_min, portioner, billed_url, instruktioner, ingredienser, tags) VALUES (
  'meny_fixed_21_1781878444012',
  'Mormors vintertarteletter',
  'Klassisk kvalitetsopskrift, nu med korrekt data.',
  45,
  4,
  'https://cdn-rdb.arla.com/dagrofa-dk/mormors-vintertarteletter/2334178314.jpg?w=960&h=439&anchor=middlecenter&mode=crop&scale=both&ak=8567bf50&hm=73811dac',
  '["Kom kyllingen i en gryde, og dæk den med vand.","Halvér løget, og kom det i gryden sammen med toppen af porren.","Skær én gulerod groft, og kom i gryden.","I starten dannes der skum på toppen af suppen.","Skum dette af med en hulske.","Kog kyllingen i 50 min. ved svag varme.","Tag kyllingen op, og lad den køle så meget af, at skindet kan tages af.","Sigt suppen.","Du skal bruge 4 dl til tarteletfyldet.","Resten kan du fryse – det kan f.eks. bruges til en suppe eller risotto.","Pil kødet af skroget, og tag cirka 300 g til tarteletfyld.","Del kødet i mindre stykker.","Skræl den anden gulerod, og skær i små tern.","Snit resten af porren i tynde skiver.","Smelt smør i en gryde, og drys melet i.","Steg det i et minut, og hæld så suppe i, mens der piskes.","Kom fløde, gulerødder og porrer i, og krydr med salt og hvid peber.","Lad grøntsagerne simre i suppen i 5 min.","Tilsæt så kyllingekødet, og varm det igennem.","Hak persillen, og kom den i.","Servér i varme tarteletter.","Gryderet"]'::jsonb,
  '[{"text":"1 kylling","raavare_id":"ing_kyllingebryst","amount":null,"unit":null},{"text":"1 liter vand","raavare_id":null,"amount":null,"unit":null},{"text":"1 løg","raavare_id":"ing_loeg","amount":null,"unit":null},{"text":"1 porre","raavare_id":null,"amount":null,"unit":null},{"text":"2 gulerødder","raavare_id":"ing_extra_4","amount":null,"unit":null},{"text":"salt og hvid peber","raavare_id":null,"amount":null,"unit":null},{"text":"50 g smør","raavare_id":null,"amount":null,"unit":null},{"text":"3 spsk hvedemel","raavare_id":null,"amount":null,"unit":null},{"text":"1 dl piskefløde","raavare_id":null,"amount":null,"unit":null},{"text":"4 dl hønsekødssuppe","raavare_id":null,"amount":null,"unit":null},{"text":"1 dl kruspersille","raavare_id":null,"amount":null,"unit":null},{"text":"tilbehør: lune tartelet","raavare_id":null,"amount":null,"unit":null}]'::jsonb,
  '["Kyllingebryst","Løg","Gulerødder"]'::jsonb
);

INSERT INTO recipes (id, titel, beskrivelse, tidsforbrug_min, portioner, billed_url, instruktioner, ingredienser, tags) VALUES (
  'meny_fixed_22_1781878444013',
  'Tærte med rødbede, gedeost og rødløg',
  'Klassisk kvalitetsopskrift, nu med korrekt data.',
  45,
  4,
  'https://cdn-rdb.arla.com/dagrofa-dk/tarte-rodbede-gedeost-rodlog/3486233604.jpg?w=960&h=439&anchor=middlecenter&mode=crop&scale=both&ak=8567bf50&hm=73811dac',
  '["Smør en tærteform på ca. 22-24 cm. med smør.","Bland de to slags mel med salt og smuldr det kolde smør i med fingrene til det ligner grov rasp.","Kom æggeblomme og en smule vand i og saml dejen.","Den skal ikke æltes.","Saml dejen til en kugle og tryk den lidt flad.","Pak dejen ind i plastfolie og lad den hvile i køleskabet i 30 min.","Rul dejen ud til en stor cirkel og kom den i tærteformen. Det er nemt at gøre det mellem to stykker bagepapir.","Trim kanterne på tærten og dæk den med bagepapir.","Kom bagebønner eller ris i for at veje ned og forbag tærtebunden i 15 min. ved 180 °C.","Fjern bagebønner og bagepapir og bag tærten i yderligere 5 min. til den er let gylden.","Til fyldet skrælles bederne, skæres i både og kommes i et ovnfast fad.","Skær løgene i kvarte og kom dem i fadet med bederne.","Dryp olivenolie over og krydr med lidt salt og peber.","Bag grøntsagerne i 30 min. ved 200 °C.","Læg beder og rødløg i den forbagte tærteform.","Smuldr gedeosten i grove stykker og læg dem ned mellem grøntsagerne.","Drys med timian.","Rør æg sammen med piskefløde, creme fraiche og dijonsennep og krydr med lidt salt og peber.","Hæld blandingen i tærteformen og bag tærten i ca. 30 min ved 180 °C til æggemassen har sat sig.","Tærter"]'::jsonb,
  '[{"text":"150 g hvedemel","raavare_id":null,"amount":null,"unit":null},{"text":"50 g ølandshvedemel (fuldkorn)","raavare_id":null,"amount":null,"unit":null},{"text":"100 g koldt smør skåret i tern. + 1tsk. til formen","raavare_id":null,"amount":null,"unit":null},{"text":"1 tsk flagesalt","raavare_id":null,"amount":null,"unit":null},{"text":"1 æggeblomme","raavare_id":null,"amount":null,"unit":null},{"text":"1 spsk koldt vand","raavare_id":null,"amount":null,"unit":null},{"text":"400 g rødbeder","raavare_id":null,"amount":null,"unit":null},{"text":"3 små rødløg","raavare_id":"ing_loeg","amount":null,"unit":null},{"text":"1 spsk olivenolie","raavare_id":null,"amount":null,"unit":null},{"text":"salt og peber","raavare_id":null,"amount":null,"unit":null},{"text":"75 g friske gedeoste","raavare_id":null,"amount":null,"unit":null},{"text":"2 spsk frisk timian","raavare_id":null,"amount":null,"unit":null},{"text":"3 æg","raavare_id":null,"amount":null,"unit":null},{"text":"1 dl piskefløde","raavare_id":null,"amount":null,"unit":null},{"text":"100 g creme fraiche (18%)","raavare_id":"ing_cremefraiche","amount":null,"unit":null},{"text":"2 spsk dijonsennep","raavare_id":null,"amount":null,"unit":null}]'::jsonb,
  '["Løg","Creme Fraiche"]'::jsonb
);

INSERT INTO recipes (id, titel, beskrivelse, tidsforbrug_min, portioner, billed_url, instruktioner, ingredienser, tags) VALUES (
  'meny_fixed_23_1781878444013',
  'Ramen med smilende æg, boghvedenudler og sprød topping',
  'Klassisk kvalitetsopskrift, nu med korrekt data.',
  45,
  4,
  'https://cdn-rdb.arla.com/dagrofa-dk/ramen-smilende-ag-boghvedenudler-og-sprod-topping/3225438588.jpg?w=960&h=439&anchor=middlecenter&mode=crop&scale=both&ak=8567bf50&hm=73811dac',
  '["Kog æggene i 8 minutter, og køl dem ned under rindende koldt vand.","Kog boghvedenudlerne efter pakkens anvisning.","Bring grønsagsbouillonen i kog, og tilsæt fløde.","Smag suppen til med sojasauce.","Fordel nudlerne i fire passende skåle.","Snit spidskål og chili fint.","Svits østershattene gyldne på panden i en smule olie.","Kom enoki, østershatte, spidskål, gulerødder, chili og bønnespirer i skålene, og hæld den varme suppe over fyldet.","Pil æggene, og skær dem i halve.","Top hver suppe med to halve æg, og pynt til sidst med frisk koriander, et drys ristede sesamfrø og friskkværnet peber.","Grøntsager","Mellemøsten","Vegetar","Hovedret"]'::jsonb,
  '[{"text":"4 æg","raavare_id":null,"amount":null,"unit":null},{"text":"400 g boghvede nudler","raavare_id":null,"amount":null,"unit":null},{"text":"1 liter grøntsagsbouillon","raavare_id":null,"amount":null,"unit":null},{"text":"2 dl fløde","raavare_id":null,"amount":null,"unit":null},{"text":"4 spsk sojasauce","raavare_id":"ing_soja","amount":null,"unit":null},{"text":"100 g lilla spidskål","raavare_id":"ing_spidskaal","amount":null,"unit":null},{"text":"1 frisk chili","raavare_id":"ing_frisk_chili","amount":null,"unit":null},{"text":"100 g østershatte","raavare_id":"ing_oestershatte","amount":null,"unit":null},{"text":"lidt olie til stegning","raavare_id":null,"amount":null,"unit":null},{"text":"100 g enokisvampe","raavare_id":"ing_champignon","amount":null,"unit":null},{"text":"80 g bønnespirer","raavare_id":"ing_boennespirer","amount":null,"unit":null},{"text":"ristede sesamfrø","raavare_id":"ing_sesam","amount":null,"unit":null},{"text":"friskkværnet peber","raavare_id":null,"amount":null,"unit":null}]'::jsonb,
  '["Sojasauce","Spidskål","Frisk Chili","Østershatte","Champignon","Bønnespirer","Sesamfrø"]'::jsonb
);

INSERT INTO recipes (id, titel, beskrivelse, tidsforbrug_min, portioner, billed_url, instruktioner, ingredienser, tags) VALUES (
  'meny_fixed_24_1781878444013',
  'Bagt kartoffel med linsechili, korianderdressing og ost',
  'Klassisk kvalitetsopskrift, nu med korrekt data.',
  45,
  4,
  'https://cdn-rdb.arla.com/dagrofa-dk/bagt-kartoffel-med-linsechili-korianderdressing-og-ost/2216890339.jpg?w=960&h=439&anchor=middlecenter&mode=crop&scale=both&ak=8567bf50&hm=73811dac',
  '["Vask kartoflerne, og dup dem tørre.","Prik dem et par steder med en kødnål, og pak dem ind i alufolie.","Bag dem på en rist i ovnen i 1 time og 15 min. ved 200 °C.","Skær løg i små tern, og hak hvidløget fint.","Riv guleroden.","Varm olien i en gryde, og svits løg og gulerødder i 4 min.","Tilsæt hvidløg, og steg videre i 1 minut.","Kom spidskommen, paprika og røget paprika i sammen med tomatpuré, og steg det i 1 minut.","Tilsæt vand og linser, og kom lidt salt og peber i.","Lad retten simre i 15 min.","Blend koriander og fraiche sammen, og smag til med salt og peber.","Tag kartoflerne ud af folien, og skær et snit ned gennem toppen af skindet, så kartoflen kan åbnes.","Fyld linsechili i, og top med dressing, revet ost, hakket koriander og chili.","Grøntsager"]'::jsonb,
  '[{"text":"1 løg","raavare_id":"ing_loeg","amount":null,"unit":null},{"text":"4 bagekartofler","raavare_id":"ing_extra_3","amount":null,"unit":null},{"text":"1 fed hvidløg","raavare_id":"ing_loeg","amount":null,"unit":null},{"text":"1 gulerod","raavare_id":null,"amount":null,"unit":null},{"text":"1 spsk olivenolie","raavare_id":null,"amount":null,"unit":null},{"text":"1 tsk stødt spidskommen","raavare_id":null,"amount":null,"unit":null},{"text":"1 tsk paprika","raavare_id":null,"amount":null,"unit":null},{"text":"0.5 tsk røget paprika","raavare_id":null,"amount":null,"unit":null},{"text":"2 spsk koncentreret tomatpuré","raavare_id":null,"amount":null,"unit":null},{"text":"4 dl vand","raavare_id":null,"amount":null,"unit":null},{"text":"150 g tørrede røde linser","raavare_id":null,"amount":null,"unit":null},{"text":"1 knivspids salt og peber","raavare_id":null,"amount":null,"unit":null},{"text":"1 håndfuld frisk koriander + ekstra til servering","raavare_id":"ing_koriander","amount":null,"unit":null},{"text":"2 dl økologisk creme fraiche 9%","raavare_id":"ing_cremefraiche","amount":null,"unit":null},{"text":"150 g revet mozzarellaost","raavare_id":null,"amount":null,"unit":null},{"text":"1 frisk chili","raavare_id":"ing_frisk_chili","amount":null,"unit":null}]'::jsonb,
  '["Løg","Kartofler","Frisk Koriander","Creme Fraiche","Frisk Chili"]'::jsonb
);

INSERT INTO recipes (id, titel, beskrivelse, tidsforbrug_min, portioner, billed_url, instruktioner, ingredienser, tags) VALUES (
  'meny_fixed_25_1781878444013',
  'Dhal',
  'Klassisk kvalitetsopskrift, nu med korrekt data.',
  45,
  4,
  'https://cdn-rdb.arla.com/dagrofa-dk/dhal/3890328785.jpg?w=960&h=439&anchor=middlecenter&mode=crop&scale=both&ak=8567bf50&hm=73811dac',
  '["Svits krydderier, løg og hvidløg i en gryde i et par minutter.","Brug lidt vand eller olie, så det ikke brænder på.","Skyl linserne og put dem i gryden sammen med salt, sukker, tomatpure og vand.","Lad retten koge i 25 minutter under låg.","Smag til med salt og chili.","Server retten sammen med ris og eksempelvis frisk koriander, mangochutney, ananasstykker, peanuts, tzatziki og brød.","Forret","Tilbehør","Gryderet"]'::jsonb,
  '[{"text":"150 g tørrede grønne linser","raavare_id":null,"amount":null,"unit":null},{"text":"250 g tørrede røde linser","raavare_id":null,"amount":null,"unit":null},{"text":"1 løg, hakket","raavare_id":"ing_loeg","amount":null,"unit":null},{"text":"4 fed hvidløg, pressede","raavare_id":"ing_loeg","amount":null,"unit":null},{"text":"2 tsk frisk koriander","raavare_id":"ing_koriander","amount":null,"unit":null},{"text":"2 tsk stødt spidskommen","raavare_id":null,"amount":null,"unit":null},{"text":"2 tsk stødt gurkemeje & evt. chilipulver","raavare_id":"ing_chili","amount":null,"unit":null},{"text":"2 tsk salt","raavare_id":null,"amount":null,"unit":null},{"text":"1 tsk sukker","raavare_id":null,"amount":null,"unit":null},{"text":"70 g koncentreret tomatpuré","raavare_id":null,"amount":null,"unit":null},{"text":"1 liter vand","raavare_id":null,"amount":null,"unit":null}]'::jsonb,
  '["Løg","Frisk Koriander","Chilipulver"]'::jsonb
);

INSERT INTO recipes (id, titel, beskrivelse, tidsforbrug_min, portioner, billed_url, instruktioner, ingredienser, tags) VALUES (
  'meny_fixed_26_1781878444013',
  'Grønkålssalat med klementindressing',
  'Klassisk kvalitetsopskrift, nu med korrekt data.',
  45,
  4,
  'https://cdn-rdb.arla.com/dagrofa-dk/groenkaalssalat-klementindressing/3333176500.jpg?w=960&h=439&anchor=middlecenter&mode=crop&scale=both&ak=8567bf50&hm=73811dac',
  '["Hak grønkålen groft og skær æbler i tynde både.","Kom i en skål sammen med rosiner og knuste valnødder.","Rør en dressing af ahornsirup, olivenolie og klementinsaft.","Smag til med salt og peber og vend dressingen i salaten.","Grøntsager","Tilbehør","Frokost","Salater"]'::jsonb,
  '[{"text":"300 g grønkål","raavare_id":null,"amount":null,"unit":null},{"text":"2 æbler","raavare_id":"ing_aeble","amount":null,"unit":null},{"text":"50 g rosiner","raavare_id":null,"amount":null,"unit":null},{"text":"75 g valnøddekerner","raavare_id":null,"amount":null,"unit":null},{"text":"1 spsk ahornsirup","raavare_id":"ing_ahornsirup","amount":null,"unit":null},{"text":"2 spsk olivenolie","raavare_id":null,"amount":null,"unit":null},{"text":"saft af 2 clementiner","raavare_id":null,"amount":null,"unit":null},{"text":"salt & sort peber","raavare_id":null,"amount":null,"unit":null}]'::jsonb,
  '["Æble","Ahornsirup"]'::jsonb
);

INSERT INTO recipes (id, titel, beskrivelse, tidsforbrug_min, portioner, billed_url, instruktioner, ingredienser, tags) VALUES (
  'meny_fixed_27_1781878444013',
  'Grillet culotte med hvidløgs-pebermix',
  'Klassisk kvalitetsopskrift, nu med korrekt data.',
  45,
  4,
  'https://cdn-rdb.arla.com/dagrofa-dk/grillet-culotte-hvidloegs-pebermix/1218520422.jpg?w=960&h=439&anchor=middlecenter&mode=crop&scale=both&ak=8567bf50&hm=73811dac',
  '["Rids fedtet på culotten.","Kom hvidløg, begge slags peber, timian og salt i en morter og mos det sammen til en grov pasta.","Smør blandingen på toppen af culotten.","Grill culotten ved indirekte varme i 40-45 min. til den har en kernetemperatur på 55°C.","Lad kødet hvile i 10 min før det skæres i skiver."]'::jsonb,
  '[{"text":"1 okseculotte","raavare_id":null,"amount":null,"unit":null},{"text":"3 fed hvidløg","raavare_id":"ing_loeg","amount":null,"unit":null},{"text":"2 tsk sorte peberkorn","raavare_id":null,"amount":null,"unit":null},{"text":"2 tsk hvid peber","raavare_id":null,"amount":null,"unit":null},{"text":"2 spsk frisk timian","raavare_id":null,"amount":null,"unit":null},{"text":"2 tsk groft salt","raavare_id":null,"amount":null,"unit":null}]'::jsonb,
  '["Løg"]'::jsonb
);

INSERT INTO recipes (id, titel, beskrivelse, tidsforbrug_min, portioner, billed_url, instruktioner, ingredienser, tags) VALUES (
  'meny_fixed_28_1781878444013',
  'Gulerodsboller',
  'Klassisk kvalitetsopskrift, nu med korrekt data.',
  45,
  4,
  'https://cdn-rdb.arla.com/dagrofa-dk/gulerodsboller1/3318067509.jpg?w=960&h=439&anchor=middlecenter&mode=crop&scale=both&ak=8567bf50&hm=73811dac',
  '["Der bliver ca. 16-18 boller.","Lun kærnemælken og rør gæren ud.","Rør groftrevne gulerødder og de øvrige ingredienser i dejen - hold lidt af melet tilbage.","Sørg for at dejen ikke bliver for fast.","Lad dejen hæve lunt, tildækket ca. 1 time.","Sæt store spiseskefulde af dejen på plader med bagepapir og lad bollerne efterhæve 8-10 minutter.","Bag bollerne gyldne og sprøde ved 200 grader i 20-25 minutter, og afkøl på en bagerist. Opskrift og styling: Udviklet af Vibeke Lehn.","Brød og kager","Brød og boller"]'::jsonb,
  '[{"text":"50 g gær","raavare_id":null,"amount":null,"unit":null},{"text":"1 liter kærnemælk","raavare_id":null,"amount":null,"unit":null},{"text":"4 gulerødder","raavare_id":"ing_extra_4","amount":null,"unit":null},{"text":"1 spsk groft salt","raavare_id":null,"amount":null,"unit":null},{"text":"1 spsk honning","raavare_id":null,"amount":null,"unit":null},{"text":"35 g ristede pinjekerner","raavare_id":null,"amount":null,"unit":null},{"text":"2 spsk revet appelsinskal (usprøjtet)","raavare_id":null,"amount":null,"unit":null},{"text":"600 g grahamsmel","raavare_id":null,"amount":null,"unit":null},{"text":"Ca. 650 g hvedemel","raavare_id":null,"amount":null,"unit":null}]'::jsonb,
  '["Gulerødder"]'::jsonb
);

INSERT INTO recipes (id, titel, beskrivelse, tidsforbrug_min, portioner, billed_url, instruktioner, ingredienser, tags) VALUES (
  'meny_fixed_29_1781878444013',
  'Jalapeño poppers med bacon og cheddar',
  'Klassisk kvalitetsopskrift, nu med korrekt data.',
  45,
  4,
  'https://cdn-rdb.arla.com/dagrofa-dk/jalapeno-poppers-bacon-og-cheddar/2595229384.jpg?w=960&h=439&anchor=middlecenter&mode=crop&scale=both&ak=8567bf50&hm=73811dac',
  '["Steg bacon sprødt i en tør pande, og hak det fint.","Bland bacon sammen med flødeost, cheddar, paprika og purløg.","Flæk jalapeños, og brug en teske til at skrabe frøene ud.","Fyld med flødeostblandingen og drys rasp på toppen.","Bages i 10-12 min. ved 200°C og spises lune.","Grøntsager","Forret","Tilbehør"]'::jsonb,
  '[{"text":"100 g bacon i skiver","raavare_id":null,"amount":null,"unit":null},{"text":"150 g flødeost naturel","raavare_id":null,"amount":null,"unit":null},{"text":"75 g revet Cheasy® cheddar","raavare_id":null,"amount":null,"unit":null},{"text":"0.5 tsk paprika","raavare_id":null,"amount":null,"unit":null},{"text":"2 spsk finthakket purløg","raavare_id":"ing_loeg","amount":null,"unit":null},{"text":"12 friske Santa Maria Green Jalapeño","raavare_id":null,"amount":null,"unit":null},{"text":"2 spsk rasp","raavare_id":null,"amount":null,"unit":null}]'::jsonb,
  '["Gris","Løg"]'::jsonb
);

INSERT INTO recipes (id, titel, beskrivelse, tidsforbrug_min, portioner, billed_url, instruktioner, ingredienser, tags) VALUES (
  'meny_fixed_30_1781878444013',
  'Fuldkornspebernødder med chokoladebund',
  'Klassisk kvalitetsopskrift, nu med korrekt data.',
  45,
  4,
  'https://cdn-rdb.arla.com/dagrofa-dk/fuldkornspebernoedder-chokoladebund/683091809.jpg?w=960&h=439&anchor=middlecenter&mode=crop&scale=both&ak=8567bf50&hm=73811dac',
  '["Ca. 40 stk.","Bland krydderierne med bagepulver og begge slags mel.","Smuldr smørret i melblandingen, og kom rørsukker i.","Saml dejen med piskefløde, og ælt den sammen.","Tril dejen til pølser, og skær dem i stykker på ca. 2 cm.","Tril dem til kugler, og læg dem på bageplader med bagepapir.","Bag pebernødderne ca. 8 min. ved 180°C.","Lad dem køle af.","Smelt chokoladen over vandbad, og dyp bunden af hver pebernød deri.","Lad dem køle af på bagepapir.","Opbevares i kagedåse i op til 10 dage."]'::jsonb,
  '[{"text":"1 tsk stødt ingefær","raavare_id":null,"amount":null,"unit":null},{"text":"0.5 tsk stødt kanel","raavare_id":"ing_kanel","amount":null,"unit":null},{"text":"0.5 tsk stødt hvid peber","raavare_id":null,"amount":null,"unit":null},{"text":"0.5 tsk stødt nellike","raavare_id":null,"amount":null,"unit":null},{"text":"0.5 tsk stødt kardemomme","raavare_id":null,"amount":null,"unit":null},{"text":"0.5 tsk bagepulver","raavare_id":"ing_bagepulver","amount":null,"unit":null},{"text":"150 g hvid hvedemel","raavare_id":null,"amount":null,"unit":null},{"text":"100 g hvedemel","raavare_id":null,"amount":null,"unit":null},{"text":"100 g koldt smør","raavare_id":null,"amount":null,"unit":null},{"text":"125 g rørsukker","raavare_id":null,"amount":null,"unit":null},{"text":"0.5 dl Arla Karolines Køkken® Piskefløde 38%","raavare_id":null,"amount":null,"unit":null},{"text":"100 g mørk chokolade","raavare_id":"ing_mork_chokolade","amount":null,"unit":null}]'::jsonb,
  '["Stødt Kanel","Bagepulver","Mørk Chokolade"]'::jsonb
);

INSERT INTO recipes (id, titel, beskrivelse, tidsforbrug_min, portioner, billed_url, instruktioner, ingredienser, tags) VALUES (
  'meny_fixed_31_1781878444014',
  'Coq au vin',
  'Klassisk kvalitetsopskrift, nu med korrekt data.',
  45,
  4,
  'https://cdn-rdb.arla.com/dagrofa-dk/coq-au-vin-0/2836405550.jpeg?w=960&h=439&anchor=middlecenter&mode=crop&scale=both&ak=8567bf50&hm=73811dac',
  '["Varm smøret op i en sautepande til det bruser.","Kom de 8 stykker kylling i og brun dem godt på alle sider, krydr med salt og peber.","Tag derefter kyllingen op på et fad.","Brun bacon, skalotteløg og champignons til det er gyldent i cirka 5 minutter.","Kom vin på og lad det komme i kog.","Tilsæt derefter hønsebouillon og lad det simre i 5 minutter.","Kom de brunede kyllingestykker, hvidløg og timian i et ovnfast fad, hæld bacon og vin blandingen over og steges i ovn ved 160 grader i 35 minutter til kyllingen er mør.","Smages til med salt, peber og frisk timian.","Pynt med snittet bladselleri.","Fjerkræ","Svin","Hovedret"]'::jsonb,
  '[{"text":"25 g smør","raavare_id":null,"amount":null,"unit":null},{"text":"1 kylling 1600 g (delt i 8 stykker)","raavare_id":"ing_kyllingebryst","amount":null,"unit":null},{"text":"salt og friskkværnet peber","raavare_id":null,"amount":null,"unit":null},{"text":"150 g bacontern","raavare_id":null,"amount":null,"unit":null},{"text":"300 g skalotteløg /perleløg, pillede i halve","raavare_id":"ing_loeg","amount":null,"unit":null},{"text":"150 g champignoner rengjorte i halve","raavare_id":"ing_champignon","amount":null,"unit":null},{"text":"salt og friskkværnet peber","raavare_id":null,"amount":null,"unit":null},{"text":"3 dl rødvin","raavare_id":null,"amount":null,"unit":null},{"text":"300 ml (3 dl) hønsefond","raavare_id":null,"amount":null,"unit":null},{"text":"2 fed hvidløg i skiver","raavare_id":"ing_loeg","amount":null,"unit":null},{"text":"4 frisk timian","raavare_id":null,"amount":null,"unit":null},{"text":"fintsnittet bladselleri","raavare_id":null,"amount":null,"unit":null}]'::jsonb,
  '["Kyllingebryst","Gris","Løg","Champignon","Vin"]'::jsonb
);

INSERT INTO recipes (id, titel, beskrivelse, tidsforbrug_min, portioner, billed_url, instruktioner, ingredienser, tags) VALUES (
  'meny_fixed_32_1781878444014',
  'Pasta Pomodoro',
  'Klassisk kvalitetsopskrift, nu med korrekt data.',
  45,
  4,
  'https://cdn-rdb.arla.com/dagrofa-dk/pasta-pomodoro/424675678.jpg?w=960&h=439&anchor=middlecenter&mode=crop&scale=both&ak=8567bf50&hm=73811dac',
  '["Hak løg, hvidløg og tomater groft.","Varm en gryde op med olivenolie og sauter løg under omrøring i ca. 5 minutter, til de er glaserede.","Kom hvidløg, tomater, frisk timian, rød chili og sukker i og rør det rundt i 1-2 minutter.","Kom balsamicoeddiken ved og lad det bruse af i 1 minut.","Kom flåede tomater og vand i og lad det småsimre i 10 minutter uden låg.","Blend tomatblandingen med en stavblender og smag til med salt.","Kog spaghetti al dente i kogende vand tilsat salt.","Si vandet fra med en sigte, og kom spaghetti tilbage i gryden.","Vend tomatsaucen godt sammen med spaghettien og servér straks på lune tallerkener.","Anret med revet parmesanost og frisk basilikum.","Klima Kærlig opskrift","Pastaret","Frokost","Hovedret"]'::jsonb,
  '[{"text":"2 små løg","raavare_id":"ing_loeg","amount":null,"unit":null},{"text":"4 fed hvidløg","raavare_id":"ing_loeg","amount":null,"unit":null},{"text":"3 tomater","raavare_id":"ing_extra_1","amount":null,"unit":null},{"text":"2 spsk olivenolie","raavare_id":null,"amount":null,"unit":null},{"text":"2 spsk frisk timian","raavare_id":null,"amount":null,"unit":null},{"text":"0.5 lille rød chilipeber","raavare_id":null,"amount":null,"unit":null},{"text":"1 tsk sukker","raavare_id":null,"amount":null,"unit":null},{"text":"1 spsk hvid balsamicoeddike","raavare_id":null,"amount":null,"unit":null},{"text":"1 dåse flået tomat","raavare_id":null,"amount":null,"unit":null},{"text":"2 dl vand","raavare_id":null,"amount":null,"unit":null},{"text":"1 tsk havsalt","raavare_id":null,"amount":null,"unit":null},{"text":"50 g revet parmigiano reggiano","raavare_id":null,"amount":null,"unit":null},{"text":"1 dl frisk basilikum","raavare_id":null,"amount":null,"unit":null}]'::jsonb,
  '["Løg","Tomater (Danske)"]'::jsonb
);

INSERT INTO recipes (id, titel, beskrivelse, tidsforbrug_min, portioner, billed_url, instruktioner, ingredienser, tags) VALUES (
  'meny_fixed_33_1781878444014',
  'Oreo heksehatte med jordbær',
  'Klassisk kvalitetsopskrift, nu med korrekt data.',
  45,
  4,
  'https://cdn-rdb.arla.com/dagrofa-dk/oreo-heksehatte-med-jordbar/1302345852.jpg?w=960&h=439&anchor=middlecenter&mode=crop&scale=both&ak=8567bf50&hm=73811dac',
  '["Hak chokoladen, og tag en tredjedel fra.","Smelt resten over vandbad, til det er 55°.","Tag skålen væk fra vandbadet, og rør resten af chokoladen i.","Dyp hver Oreo i chokolade, og sæt dem på et stykke bagepapir.","Vask jordbærrene, og tør dem grundigt med køkkenrulle.","Skær toppen af jordbærrene, og dyp dem i chokoladen.","Sæt et jordbær med den flade side nedad på hver Oreo.","Lad chokoladen sætte sig.","Pynt med kagekrymmel.","Opbevares på køl i maks. 1 dag."]'::jsonb,
  '[{"text":"8 Oreo","raavare_id":null,"amount":null,"unit":null},{"text":"150 g mørk chokolade","raavare_id":"ing_mork_chokolade","amount":null,"unit":null},{"text":"8 små jordbær","raavare_id":null,"amount":null,"unit":null},{"text":"kagekrymmel til pynt","raavare_id":null,"amount":null,"unit":null}]'::jsonb,
  '["Mørk Chokolade"]'::jsonb
);

INSERT INTO recipes (id, titel, beskrivelse, tidsforbrug_min, portioner, billed_url, instruktioner, ingredienser, tags) VALUES (
  'meny_fixed_34_1781878444014',
  'Grillet flæskestegssandwich',
  'Klassisk kvalitetsopskrift, nu med korrekt data.',
  45,
  4,
  'https://cdn-rdb.arla.com/dagrofa-dk/grillet-flaskestegssandwich/4596839.jpg?w=960&h=439&anchor=middlecenter&mode=crop&scale=both&ak=8567bf50&hm=73811dac',
  '["Gnid flæskestegen med salt og peber, og grill den ved indirekte varme, eller steg den i ovnen i 45 min. til 1 time ved 200 °C, eller til den har en centrumtemperatur på 74 °C.","Skær stegen i skiver.","Snit kålen fint, og bland med revet gulerod og ærteskud.","Vend salaten sammen med olivenolie og hvidvinseddike, og krydr med lidt salt og peber.","Lun burgerbollerne, og smør dem med sriracha mayo.","Kom 1-2 skiver flæskesteg i hver burger, og top med salat og syltede agurker.","Grill"]'::jsonb,
  '[{"text":"1 kg flæskesteg","raavare_id":"ing_extra_14","amount":null,"unit":null},{"text":"salt","raavare_id":null,"amount":null,"unit":null},{"text":"sort peber","raavare_id":null,"amount":null,"unit":null},{"text":"200 g spidskål","raavare_id":"ing_spidskaal","amount":null,"unit":null},{"text":"150 g revet gulerødder","raavare_id":"ing_extra_4","amount":null,"unit":null},{"text":"1 håndfuld ærteskud","raavare_id":null,"amount":null,"unit":null},{"text":"2 spsk olivenolie","raavare_id":null,"amount":null,"unit":null},{"text":"2 spsk hvidvinseddike","raavare_id":"ing_extra_40","amount":null,"unit":null},{"text":"4 brioche burgerboller","raavare_id":"ing_burgerboller","amount":null,"unit":null},{"text":"8 spsk sriracha mayonnaise","raavare_id":"ing_mayonnaise","amount":null,"unit":null},{"text":"100 g syltet agurker","raavare_id":"ing_extra_2","amount":null,"unit":null},{"text":"agurk i skiver","raavare_id":"ing_extra_2","amount":null,"unit":null},{"text":"citronskal (usprøjtet)","raavare_id":null,"amount":null,"unit":null},{"text":"evt. mynte","raavare_id":null,"amount":null,"unit":null}]'::jsonb,
  '["Flæskesteg","Spidskål","Gulerødder","Hvidvin","Burgerboller","Mayonnaise","Agurk"]'::jsonb
);

INSERT INTO recipes (id, titel, beskrivelse, tidsforbrug_min, portioner, billed_url, instruktioner, ingredienser, tags) VALUES (
  'meny_fixed_35_1781878444014',
  'Broccolipesto med sprøde rugbrødschips',
  'Klassisk kvalitetsopskrift, nu med korrekt data.',
  45,
  4,
  'https://cdn-rdb.arla.com/dagrofa-dk/broccolipesto-sproede-rugbroedschips/2735059494.jpg?w=960&h=439&anchor=middlecenter&mode=crop&scale=both&ak=8567bf50&hm=73811dac',
  '["Kom rå broccoli i foodprocessor og kør til det er findelt, kom ristede hasselnødder, persille ved og kør igen med foodprocessor.","Tilsæt chili, knust hvidløg, vand, citronsaft, salt og oliven olie.","Blend broccolipesto til ensartet konsistens.","Server på rugbrødschips.","Kan også bruges som dip, i pasta salat, i salat skålen eller som spread i sandwich.","Klima Kærlig opskrift","Snacks","Tilbehør","Salater"]'::jsonb,
  '[{"text":"50 g hasselnødder","raavare_id":"ing_hasselnoedder","amount":null,"unit":null},{"text":"250 g broccoli","raavare_id":"ing_broccoli","amount":null,"unit":null},{"text":"1 dl kruspersille","raavare_id":null,"amount":null,"unit":null},{"text":"1 tsk hakket rød chilipeber","raavare_id":null,"amount":null,"unit":null},{"text":"1 fed hvidløg","raavare_id":"ing_loeg","amount":null,"unit":null},{"text":"0.5 dl vand","raavare_id":null,"amount":null,"unit":null},{"text":"2 spsk friskpresset citronsaft","raavare_id":null,"amount":null,"unit":null},{"text":"1 tsk salt","raavare_id":null,"amount":null,"unit":null},{"text":"1 dl olivenolie","raavare_id":null,"amount":null,"unit":null},{"text":"100 g rugbrødschips med salt som tilbehør","raavare_id":"ing_rugbroedschips","amount":null,"unit":null}]'::jsonb,
  '["Hasselnødder","Broccoli","Løg","Rugbrødschips"]'::jsonb
);


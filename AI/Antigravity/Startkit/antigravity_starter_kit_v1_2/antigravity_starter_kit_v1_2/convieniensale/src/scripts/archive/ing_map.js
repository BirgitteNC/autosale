const ingMap = {
  'tomater_danske': 'ing_extra_1', // Tomater (Danske)
  'agurk': 'ing_extra_2', // Agurk
  'hakket_grisek_d': 'ing_hakket_gris', // Hakket Grisekød
  'bacon_i_tern': 'ing_bacon', // Bacon i tern
  'kyllingebryst': 'ing_kyllingebryst', // Kyllingebryst
  'hvidk_l': 'ing_hvidkaal', // Hvidkål
  'champignon': 'ing_champignon', // Champignon
  'peberfrugt': 'ing_peberfrugt', // Peberfrugt
  'ble': 'ing_aeble', // Æble
  'lammek_lle_ca_1_5_kg': 'ing_lammekoelle', // Lammekølle (ca. 1,5 kg)
  'laktosefri_fl_de': 'ing_laktosefri_floede', // Laktosefri Fløde
  'glutenfri_pasta': 'ing_glutenfri_pasta', // Glutenfri Pasta
  'kartofler': 'ing_extra_3', // Kartofler
  'quinoa': 'ing_quinoa', // Quinoa
  'ris': 'ing_ris', // Ris
  'karrypulver': 'ing_karry', // Karrypulver
  'bouillon': 'ing_bouillon', // Bouillon
  't_rtedej': 'ing_taertedej', // Tærtedej
  'guler_dder': 'ing_extra_4', // Gulerødder
  'porrer': 'ing_extra_5', // Porrer
  'citroner': 'ing_extra_6', // Citroner
  'bananer': 'ing_extra_7', // Bananer
  'iceberg_salat': 'ing_extra_8', // Iceberg Salat
  'frisk_spinat': 'ing_extra_9', // Frisk Spinat
  'avocado': 'ing_extra_10', // Avocado
  'frisk_ingef_r': 'ing_extra_12', // Frisk Ingefær
  'svinekoteletter': 'ing_extra_13', // Svinekoteletter
  'fl_skesteg': 'ing_extra_14', // Flæskesteg
  'hakket_kalv_og_fl_sk': 'ing_extra_15', // Hakket Kalv og Flæsk
  'roastbeef': 'ing_extra_16', // Roastbeef
  'skinketern': 'ing_extra_17', // Skinketern
  'medister': 'ing_extra_18', // Medister
  'kyllingeunderl_r': 'ing_extra_19', // Kyllingeunderlår
  'torskefileter': 'ing_extra_21', // Torskefileter
  'r_dsp_tte': 'ing_extra_22', // Rødspætte
  'fiskefars': 'ing_extra_23', // Fiskefars
  'rejer_i_lage': 'ing_extra_24', // Rejer i lage
  'hakkede_tomater': 'ing_extra_25', // Hakkede Tomater
  'kokosm_lk': 'ing_extra_26', // Kokosmælk
  'r_de_linser': 'ing_extra_27', // Røde Linser
  'sorte_b_nner': 'ing_extra_28', // Sorte Bønner
  'olivenolie': 'ing_extra_31', // Olivenolie
  'ketchup': 'ing_extra_32', // Ketchup
  'havregryn': 'ing_extra_33', // Havregryn
  'm_rkt_rugbr_d': 'ing_extra_34', // Mørkt Rugbrød
  'solsikkerugbr_d': 'ing_extra_35', // Solsikkerugbrød
  'franskbr_d': 'ing_extra_36', // Franskbrød
  'rundstykker': 'ing_extra_37', // Rundstykker
  'kanelsnegle': 'ing_extra_38', // Kanelsnegle
  'r_dvin_italiensk': 'ing_extra_39', // Rødvin (Italiensk)
  'hvidvin': 'ing_extra_40', // Hvidvin
  'ros': 'ing_extra_41', // Rosé
  'pilsner_l': 'ing_extra_42', // Pilsner Øl
  'salt': 'ing_extra_43', // Salt
  'sort_peber': 'ing_extra_44', // Sort Peber
  'paprika': 'ing_extra_45', // Paprika
  'oregano': 'ing_extra_46', // Oregano
  'basilikum_t_rret': 'ing_extra_47', // Basilikum (Tørret)
  'laktosefri_ost': 'ing_laktosefri_ost', // Laktosefri Ost
  'm_lk': 'ing_maelk', // Mælk
  'hvedemel': 'ing_extra_29', // Hvedemel
  'pasta': 'ing_pasta', // Pasta
  'kokosm_lk': 'ing_kokosmaelk', // Kokosmælk
  'r_d_karrypasta': 'ing_rød_karry', // Rød Karrypasta
  'kik_rter_p_d_se': 'ing_kikærter', // Kikærter på dåse
  'spidskommen': 'ing_spidskommen', // Spidskommen
  'tortillas': 'ing_tortillas', // Tortillas
  'glutenfri_tortillas': 'ing_glutenfri_tortillas', // Glutenfri Tortillas
  'frisk_rosmarin': 'ing_rosmarin', // Frisk Rosmarin
  'hakkede_tomater': 'ing_tomatsovs', // Hakkede Tomater
  'aubergine': 'ing_aubergine', // Aubergine
  'squash': 'ing_squash', // Squash
  'frisk_mozzarella': 'ing_mozzarella', // Frisk Mozzarella
  'madlavningsfl_de': 'ing_floede', // Madlavningsfløde
  'pancetta_bacon_i_tern': 'ing_pancetta', // Pancetta / Bacon i tern
  'g': 'ing_aeg', // Æg
  'parmesan': 'ing_parmesan', // Parmesan
  'cheddarost': 'ing_cheddar', // Cheddarost
  'hakket_oksek_d_8_14': 'ing_extra_20', // Hakket oksekød (8-14%)
  'svinem_rbrad': 'ing_svinemoerbrad', // Svinemørbrad
  'sukker': 'ing_extra_30', // Sukker
  'friske_rejer': 'ing_rejer', // Friske Rejer
  'hakket_oksek_d': 'ing_hakket_okse', // Hakket Oksekød
  'st_dt_kanel': 'ing_kanel', // Stødt Kanel
  'm_rk_chokolade': 'ing_mork_chokolade', // Mørk Chokolade
  'ahornsirup': 'ing_ahornsirup', // Ahornsirup
  'frisk_persille': 'ing_persille', // Frisk Persille
  'fersk_laks': 'ing_laks', // Fersk Laks
  'vaniljesukker': 'ing_vanilje', // Vaniljesukker
  'bagepulver': 'ing_bagepulver', // Bagepulver
  'gode_brunchp_lser': 'ing_pølser', // Gode Brunchpølser
  'r_de_linser': 'ing_linser', // Røde Linser
  'burgerboller': 'ing_burgerboller', // Burgerboller
  'blandet_salat': 'ing_salat_mix', // Blandet salat
  'avocado': 'ing_avocado', // Avocado
  'sk_ret_salatblanding': 'ing_salatblanding', // Skåret Salatblanding
  'frisk_pasta': 'ing_frisk_pasta', // Frisk Pasta
  'creme_fraiche': 'ing_cremefraiche', // Creme Fraiche
  'hakket_gris_kalv': 'ing_hakket_gris_kalv', // Hakket Gris & Kalv
  'broccoli': 'ing_broccoli', // Broccoli
  'hasseln_dder': 'ing_hasselnoedder', // Hasselnødder
  'rugbr_dschips': 'ing_rugbroedschips', // Rugbrødschips
  'kogt_skinke': 'ing_skinke', // Kogt Skinke
  'friske_tomater': 'ing_tomat', // Friske Tomater
  'citron': 'ing_citron', // Citron
  'friskbagt_flutes': 'ing_flutes', // Friskbagt Flutes
  'kalveculotte': 'ing_kalveculotte', // Kalveculotte
  'gr_nne_asparges': 'ing_asparges', // Grønne Asparges
  'fennikel': 'ing_fennikel', // Fennikel
  'mayonnaise': 'ing_mayonnaise', // Mayonnaise
  'kapers': 'ing_kapers', // Kapers
  'boghvedenudler_soba': 'ing_boghvedenudler', // Boghvedenudler (Soba)
  'sojasauce': 'ing_soja', // Sojasauce
  'frisk_chili': 'ing_frisk_chili', // Frisk Chili
  'stershatte': 'ing_oestershatte', // Østershatte
  'enoki_svampe': 'ing_enoki', // Enoki Svampe
  'b_nnespirer': 'ing_boennespirer', // Bønnespirer
  'frisk_koriander': 'ing_koriander', // Frisk Koriander
  'sesamfr': 'ing_sesam', // Sesamfrø
  'r_dvin_til_madlavning': 'ing_roedvin', // Rødvin til madlavning
  'hokkaido_gr_skar': 'ing_graeskar', // Hokkaido Græskar
  'klementiner': 'ing_klementiner', // Klementiner
  'for_rsl_g': 'ing_foraarssloeg', // Forårsløg
  'torskefilet': 'ing_torsk', // Torskefilet
  'revet_ost': 'ing_ost', // Revet Ost
  'surdejsbaguette': 'ing_baguette', // Surdejsbaguette
  'bagekartofler': 'ing_bagekartofler', // Bagekartofler
  'chilipulver': 'ing_chili', // Chilipulver
  'koldt_vand': 'ing_vand', // Koldt vand
  'l_g': 'ing_loeg', // Løg
  'hvidl_g': 'ing_extra_11', // Hvidløg
  's_d_kartoffel': 'ing_sødkartoffel', // Sød Kartoffel
  'spidsk_l': 'ing_spidskaal', // Spidskål
  'toastbr_d': 'ing_toastbrod', // Toastbrød
  'hel_kylling': 'ing_hel_kylling', // Hel kylling
  'sm_kartofler': 'ing_smaa_kartofler', // Små kartofler
  'nye_kartofler': 'ing_nye_kartofler', // Nye kartofler
};

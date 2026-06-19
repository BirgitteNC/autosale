# Hands-Off SAP Integration Strategy 🔒

Dette dokument tjener som whitepaper til Dagrofas IT-afdeling og CISO (Security).

## Problemet med traditionelle integrationer
De fleste eksterne retail-løsninger kræver "urinbefængte fingre" direkte nede i butikkens Enterprise ERP (SAP) og POS system. De kræver to-vejs API-nøgler, live adgang til inventory, og læser/skriver potentielt korrupte data ind i kerneforretningen. Det udgør en enorm IT-sikkerhedsrisiko.

## MenyMenus "Brevsprække" Løsning
MenyMenu er designet til at operere i fuld isolation. Vi kender ikke butikkens lagerstatus, og vi har ikke adgang til POS.
I stedet fungerer vi som en passiv "udstillings-monitor".

### Arkitekturen
1. **Envejs-Kommunikation:** Dagrofas eget system taler til os. Vi taler aldrig til Dagrofas system.
2. **REST Webhook (Brevsprækken):** Vi stiller et krypteret, sikret API-endpoint til rådighed.
3. **Frivilligt Data-push:** Når Dagrofas eget (allerede eksisterende) "Early Warning" system detekterer et kritisk overlager på en vare (f.eks. Laks med 1 dags holdbarhed), kan jeres egne IT-systemer vælge at skubbe en simpel JSON-payload over i vores webhook.

### JSON Payload Eksempel
```json
{
  "store_id": "meny_2000",
  "priority_ingredient": "Laks",
  "auth_token": "dagrofa_secure_push_token"
}
```

### Resultat
Når vi modtager ovenstående JSON, vil Supabase automatisk matche råvaren med en høj-margin opskrift og vise den på skærmen i "meny_2000".

**Konklusion:** Dagrofas IT afdeling bevarer 100% kontrol. Der er ingen data-lækage risiko, ingen GDPR-kompromittering, og ingen teknisk gæld forbundet med to-vejs systemintegration.

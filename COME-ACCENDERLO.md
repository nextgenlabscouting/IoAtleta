# Accendere l'accesso con account

Tempo: una ventina di minuti. Costo: zero per iniziare.

Finché non fai questi passaggi l'app funziona esattamente come prima —
tutto sul dispositivo — e la scheda "Accesso e sincronizzazione" lo dice
apertamente. Non si rompe niente.

---

## 1. Crea il progetto Supabase

Vai su supabase.com, crea un account, poi **New project**.

Tre campi che contano:

- **Name**: `ioatleta`
- **Database password**: generala e salvala da qualche parte. Non serve
  all'app, serve a te se un giorno vuoi entrare nel database.
- **Region**: **Frankfurt (eu-central-1)**.

> La regione si sceglie **solo adesso**. Dopo non si sposta: bisogna
> creare un altro progetto e migrare tutto. Dati di ragazzi minorenni
> devono stare in Europa, quindi non sbagliare questo campo.

## 2. Crea la tabella

Nel menu a sinistra: **SQL Editor** → **New query**. Incolla tutto il
contenuto di `schema.sql` e premi **Run**.

Devi vedere `Success. No rows returned`.

Questo passaggio non è facoltativo. La chiave che finisce nel codice è
pubblica per progetto: senza le regole di sicurezza create da questo
file, chiunque la legga può leggere i dati di tutti.

Per controllare che sia andata: **Table Editor** → tabella `profili`,
deve comparire la scritta **RLS enabled**.

## 3. Prendi le due chiavi

**Project Settings** → **API**. Ti servono:

- **Project URL** — qualcosa come `https://abcdefgh.supabase.co`
- **anon public** — una stringa lunga che inizia con `eyJ...`

Non prendere la `service_role`. Quella sì che è un segreto e non deve
finire mai nel codice del sito.

## 4. Incollale nell'app

In `index.html`, cerca `const SUPABASE`. Sono le prime righe del blocco
accesso:

```js
const SUPABASE = {
  url: "https://abcdefgh.supabase.co",
  chiave: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  google: false
};
```

Commit, push, e Vercel pubblica. Da quel momento la schermata iniziale
mostra "Ho già un account" e la sezione Il tuo spazio permette di
registrarsi.

## 5. Sistema le email

**Authentication** → **Providers** → **Email**: lascia acceso
*Confirm email*. Serve a evitare che qualcuno registri account con
l'email di un altro.

**Authentication** → **URL Configuration**:

- **Site URL**: l'indirizzo vero dell'app (`https://ioatleta.vercel.app`)
- **Redirect URLs**: aggiungi lo stesso indirizzo

Senza questo, i link di conferma e di recupero password rimandano a
`localhost` e non funzionano per nessuno.

> Il servizio email incluso in Supabase ha un limite basso — va bene per
> provare, non per decine di persone al giorno. Quando serve, si collega
> un SMTP vero (Resend ha un piano gratuito che basta e avanza) da
> **Authentication → Emails → SMTP Settings**.

## 6. Google, se lo vuoi (facoltativo)

**Authentication** → **Providers** → **Google**. Ti chiede Client ID e
Secret, che si creano nella Google Cloud Console. Quando funziona, metti
`google: true` nella configurazione dell'app e compare il pulsante.

Apple invece richiede l'iscrizione all'Apple Developer Program, 99
dollari l'anno anche solo per il web. Lascialo per ultimo.

---

## Prima di dire alla gente di registrarsi

Tre cose non tecniche, e sono quelle che contano di più:

1. **Compila il titolare.** In `index.html`, `const TITOLARE`: nome e
   email veri. Senza, l'informativa ha un buco in mezzo ed è visibile.
2. **Firma il DPA con Supabase.** Sta in Project Settings, si accetta in
   un click. È l'accordo che li vincola come responsabili del
   trattamento: senza, stai trasferendo dati sanitari di minorenni a un
   fornitore senza base contrattuale.
3. **Decidi cosa fai con gli under 14.** L'app dice già che serve un
   genitore, ma dirlo non è verificarlo. Finché non hai un modo vero di
   raccogliere quel consenso, la strada prudente è non accettare
   registrazioni sotto i 14 anni.

## Come verificare che funzioni davvero

Registrati con la tua email, conferma, entra. Poi apri il **Table
Editor**: deve esserci una riga in `profili`, con dentro il tuo profilo.

La prova che conta è questa: apri l'app in una finestra anonima, accedi
con lo stesso account e controlla che il profilo arrivi. Se arriva, la
sincronizzazione funziona.

E la prova di sicurezza: crea un secondo account, entra con quello e
verifica che **non** veda i dati del primo. Se li vede, lo SQL del
passaggio 2 non è stato eseguito.

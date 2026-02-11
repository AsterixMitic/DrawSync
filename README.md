# DrawSync

**DrawSync** je real-time multiplayer web aplikacija za zajedničko crtanje i pogađanje pojmova, inspirisana igrama poput *Scribbl.io*. Sistem omogućava više istovremenih soba u kojima korisnici u realnom vremenu razmenjuju poteze crtanja, poruke i događaje igre, dok se svi relevantni podaci pouzdano perzistiraju za kasniji pregled i analizu.

Projekat je razvijan u okviru akademskog kursa, sa posebnim fokusom na **softversku arhitekturu**, razdvajanje odgovornosti i primenu dizajnerskih obrazaca.

---

## Cilj projekta

Glavni cilj projekta je projektovanje i implementacija skalabilnog i održivog real-time sistema koji:
- podržava istovremeni rad više korisnika,
- razdvaja real-time tok od perzistencije podataka,
- omogućava jasnu podelu između domen logike i infrastrukturnih detalja,
- koristi savremene arhitekturne obrasce (Clean/Onion Architecture).

---

## Ključne funkcionalnosti

- Kreiranje i upravljanje sobama za igru
- Real-time sinhronizacija crtanja putem WebSocket komunikacije
- Pessimistic locking (samo jedan korisnik može da crta u datom trenutku)
- Pogađanje pojmova i upravljanje rundama igre
- Asinhrona perzistencija događaja (crtanje, poruke, rezultati)
- Mogućnost rekonstrukcije igre (replay) na osnovu sačuvanih događaja

---

## Arhitektura sistema

Backend sistema je projektovan prema **Onion / Clean Architecture** principima uz primenu **Ports & Adapters** pristupa.

Osnovni arhitekturni koncepti:
- **Domain-centric dizajn** – domen logika je izolovana i nezavisna od infrastrukture
- **Command-based domain logic** – svaka poslovna akcija implementirana je kao Domain Command
- **Event-driven perzistencija** – događaji se asinhrono obrađuju putem message broker-a
- **Razdvajanje real-time i persistence sloja** – niska latencija i visoka pouzdanost

### Glavne komponente
- **Angular Web Client** – korisnički interfejs i real-time interakcija
- **Nginx** – reverse proxy za HTTP i WebSocket saobraćaj
- **NestJS API** – HTTP backend za upravljanje sobama i metapodacima
- **WebSocket Gateway** – real-time obrada poteza i događaja
- **RabbitMQ** – message broker (pub/sub)
- **NestJS Worker** – asinhrona obrada i perzistencija događaja
- **PostgreSQL** – relacijska baza podataka
- **Redis** – in-memory shared state za real-time sloj

---

## Tehnologije

### Frontend
- Angular
- TypeScript
- RxJS
- WebSocket

### Backend
- Node.js
- NestJS
- TypeScript
- WebSocket Gateway
- RabbitMQ (AMQP)

### Perzistencija
- PostgreSQL
- TypeORM
- Redis

## Preduslovi
- Docker Desktop (Docker Engine + Docker Compose)

## Podešavanje okruženja
`docker-compose.yml` očekuje `Aplikacija/.env`. Ako ne postoji, napravite
`Aplikacija/.env` sa najmanje sledećim:

```
NODE_ENV=production
BACKEND_PORT=3000
NGINX_PORT=80

POSTGRES_USER=drawsync
POSTGRES_PASSWORD=drawsync
POSTGRES_DB=drawsync
POSTGRES_PORT=5432

REDIS_PORT=6379

RABBITMQ_USER=drawsync
RABBITMQ_PASSWORD=drawsync
RABBITMQ_PORT=5672
RABBITMQ_MANAGEMENT_PORT=15672
RABBITMQ_VHOST=/
```

## Pokretanje preko Dockera (preporučeno)
Iz korena repozitorijuma:

```
docker compose --env-file .\Aplikacija\.env -f .\Aplikacija\docker\docker-compose.yml up --build
```

Zaustavljanje:

```
docker compose --env-file .\Aplikacija\.env -f .\Aplikacija\docker\docker-compose.yml down
```

## Korisni portovi
- Aplikacija preko nginx: `http://localhost:${NGINX_PORT}` (podrazumevano `80`)
- RabbitMQ UI: `http://localhost:${RABBITMQ_MANAGEMENT_PORT}` (podrazumevano `15672`)
- Postgres: `localhost:${POSTGRES_PORT}` (podrazumevano `5432`)
- Redis: `localhost:${REDIS_PORT}` (podrazumevano `6379`)

## Lokalni razvoj (opciono)
Ako želite da pokrećete servise bez Dockera:

```
cd .\Aplikacija\backend
npm install
npm run start:dev
```

```
cd .\Aplikacija\frontend
npm install
npm run dev
```

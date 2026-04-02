# Paxos Consensus Protocol

A distributed implementation of the **Basic Paxos consensus algorithm** with a real-time monitoring dashboard. This project consists of a .NET 8.0 backend (5-node cluster) and a React frontend for visualizing consensus state.

## Architecture

```
┌─────────────────────────────────────────┐
│           React Dashboard               │
│   (Real-time monitoring & proposals)    │
└──────────────┬──────────────────────────┘
               │ HTTP (polling every 5s)
    ┌──────────┼──────────┬──────────┬──────────┐
    ▼          ▼          ▼          ▼          ▼
 ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐
 │Node 1│  │Node 2│  │Node 3│  │Node 4│  │Node 5│
 └──────┘  └──────┘  └──────┘  └──────┘  └──────┘
    │          │          │          │          │
    └──────────┴──────────┴──────────┴──────────┘
              HTTP inter-node communication
```

## Paxos Protocol

Each node implements the three phases of Basic Paxos:

1. **Prepare** - Proposer sends a proposal number to all acceptors. Acceptors promise not to accept proposals with lower numbers.
2. **Accept** - Proposer sends the chosen value to all acceptors. Acceptors accept the value if they haven't promised a higher number.
3. **Learn** - Once a majority accepts, the value is learned by all nodes.

## Project Structure

```
PaxosProject/
├── backend/                 # .NET 8.0 Web API (Paxos nodes)
│   ├── Controllers/         # REST API endpoints
│   ├── Services/            # Paxos protocol implementation
│   │   ├── PaxosAcceptorService.cs      # Prepare/Accept handling
│   │   ├── PaxosCoordinatorService.cs   # Full proposal orchestration
│   │   ├── PaxosLearnerService.cs       # Learn phase handling
│   │   ├── PeerCommunicationService.cs  # HTTP inter-node communication
│   │   └── ProposalNumberService.cs     # Unique proposal number generation
│   ├── Models/              # Request/Response DTOs
│   ├── State/               # Shared in-memory node state
│   ├── Dockerfile           # Multi-stage Docker build
│   ├── docker-compose.yml   # 5-node cluster deployment
│   └── PaxosNode.csproj     # .NET project file
├── frontend/                # React + Vite dashboard
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── services/        # API client & Paxos service
│   │   ├── config/          # Node configuration
│   │   └── pages/           # Page components
│   ├── package.json
│   └── vite.config.js
├── .editorconfig            # Code formatting rules
└── README.md                # This file
```

## Getting Started

### Prerequisites

- **.NET 8.0 SDK** - [Download](https://dotnet.microsoft.com/download/dotnet/8.0)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **Docker & Docker Compose** (optional, for containerized deployment)

### Running the Backend

#### Option 1: Local Development

Run a single node locally:

```bash
cd backend
dotnet run --NODE_ID=1 --PORT=5001 --PEERS="http://localhost:5002,http://localhost:5003"
```

Run multiple nodes in separate terminals with different `NODE_ID` and `PORT` values.

#### Option 2: Docker Compose (Recommended)

```bash
cd backend
docker compose up --build
```

This starts a 5-node cluster on ports 5001-5005.

### Running the Frontend

```bash
cd frontend
npm install
npm run dev
```

### Configuring Node URLs

The frontend connects to backend nodes via URLs defined in `frontend/src/config/nodes.js`. You can override these at build time:

```bash
# Option 1: Comma-separated URLs
VITE_NODE_URLS="http://localhost:5001,http://localhost:5002,http://localhost:5003,http://localhost:5004,http://localhost:5005" npm run build

# Option 2: JSON array
VITE_NODES_JSON='[{"id":1,"name":"Node 1","baseUrl":"http://localhost:5001"}]' npm run build
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/paxos/propose` | Start a full Paxos proposal |
| `POST` | `/api/paxos/prepare` | Handle Prepare phase (acceptor) |
| `POST` | `/api/paxos/accept` | Handle Accept phase (acceptor) |
| `POST` | `/api/paxos/learn` | Handle Learn phase (learner) |
| `GET` | `/api/paxos/state` | Get current node state |
| `GET` | `/api/paxos/health` | Health check |

### Example: Submit a Proposal

```bash
curl -X POST http://localhost:5001/api/paxos/propose \
  -H "Content-Type: application/json" \
  -d '{"value": "my-consensus-value"}'
```

## Configuration

### Backend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ID` | Unique identifier for this node | `1` |
| `PORT` | HTTP port to listen on | `8080` |
| `PEERS` | Comma-separated list of peer node URLs | (empty) |
| `ALLOWED_ORIGINS` | Allowed CORS origins (comma-separated) | (any) |
| `STARTUP_DELAY` | Delay in seconds before starting (Docker) | `0` |

### Frontend Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_NODE_URLS` | Comma-separated backend node URLs |
| `VITE_NODES_JSON` | JSON array of node objects |

## Key Implementation Details

- **Proposal Numbers**: Generated as `(counter * 10) + nodeId` to ensure uniqueness across nodes
- **Quorum**: Majority = `(N / 2) + 1` where N is total cluster size (5 nodes → majority of 3)
- **Concurrency**: State mutations are protected with locks; peer communication is parallel via `Task.WhenAll`
- **Self-Inclusion**: Each node includes itself in Prepare/Accept phases (handles its own request locally)
- **HTTP Client**: 5-second timeout with connection pooling for reliable inter-node communication

## License

MIT

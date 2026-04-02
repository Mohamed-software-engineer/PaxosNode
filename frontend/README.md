# Paxos Dashboard

A real-time monitoring dashboard for the Paxos Consensus Protocol cluster. Built with React, Vite, and Framer Motion.

## Features

- **Cluster Visualization** - SVG topology view with animated message passing
- **Node Status Cards** - Individual health and state for each node
- **Consensus Phase Timeline** - Visual progress through Prepare, Accept, and Learn phases
- **Proposal Form** - Submit consensus values directly from the UI
- **Manual Phase Control** - Trigger individual Paxos phases for debugging
- **Activity Log** - Event feed tracking all cluster interactions
- **Auto-Refresh** - Polls all nodes every 5 seconds for real-time updates

## Getting Started

```bash
npm install
npm run dev
```

## Configuration

Node URLs are configured in `src/config/nodes.js`. Override at build time:

```bash
VITE_NODE_URLS="http://localhost:5001,http://localhost:5002" npm run build
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

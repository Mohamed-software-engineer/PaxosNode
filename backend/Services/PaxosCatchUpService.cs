using Models;
using State;

namespace Services
{
    public class PaxosCatchUpService
    {
        private readonly PeerCommunicationService _peerComm;
        private readonly PaxosLearnerService _learnerService;
        private readonly PaxosState _state;
        private readonly int _nodeId;

        public PaxosCatchUpService(
            PeerCommunicationService peerComm,
            PaxosLearnerService learnerService,
            PaxosState state,
            int nodeId)
        {
            _peerComm = peerComm;
            _learnerService = learnerService;
            _state = state;
            _nodeId = nodeId;
        }

        public async Task<bool> CatchUpAsync(List<string> peerUrls)
        {
            if (peerUrls.Count == 0)
            {
                Console.WriteLine($"[Node {_nodeId}] No peers to catch up from.");
                return false;
            }

            if (_state.IsChosen && !string.IsNullOrEmpty(_state.LearnedValue))
            {
                Console.WriteLine($"[Node {_nodeId}] Already has a learned value: '{_state.LearnedValue}'. Skipping catch-up.");
                return true;
            }

            Console.WriteLine($"[Node {_nodeId}] Starting catch-up from {peerUrls.Count} peers...");

            var peerStates = await _peerComm.GetStatesAsync(peerUrls);

            if (peerStates.Count == 0)
            {
                Console.WriteLine($"[Node {_nodeId}] Could not reach any peers. Catch-up failed.");
                return false;
            }

            var totalNodes = peerStates.Count + 1;
            var majority = (totalNodes / 2) + 1;

            var nodesWithValue = peerStates
                .Where(p => p.IsChosen && !string.IsNullOrEmpty(p.LearnedValue))
                .ToList();

            if (nodesWithValue.Count < majority)
            {
                Console.WriteLine($"[Node {_nodeId}] Only {nodesWithValue.Count} of {totalNodes} nodes have a learned value. Need {majority} for majority. Catch-up deferred.");
                return false;
            }

            var valueGroups = nodesWithValue
                .GroupBy(p => p.LearnedValue!)
                .Select(g => new { Value = g.Key, Count = g.Count(), MaxProposalNumber = g.Max(p => p.AcceptedProposalNumber ?? p.PromisedProposalNumber) })
                .OrderByDescending(g => g.MaxProposalNumber)
                .ThenByDescending(g => g.Count)
                .ToList();

            var chosenValue = valueGroups.First().Value;

            Console.WriteLine($"[Node {_nodeId}] Majority consensus value identified: '{chosenValue}' (from {nodesWithValue.Count} peers).");

            var highestProposalNumber = peerStates
                .Where(p => p.AcceptedProposalNumber.HasValue)
                .Max(p => p.AcceptedProposalNumber!.Value);

            lock (_state)
            {
                if (highestProposalNumber > _state.PromisedProposalNumber)
                {
                    _state.PromisedProposalNumber = highestProposalNumber;
                }

                _learnerService.LearnValue(highestProposalNumber, chosenValue);
                _state.JoinedLate = true;
            }

            Console.WriteLine($"[Node {_nodeId}] Catch-up complete. Learned value: '{chosenValue}'.");
            return true;
        }
    }
}

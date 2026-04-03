using Models;
using State;

namespace Services
{
    public class PaxosCoordinatorService
    {
        private readonly ProposalNumberService _proposalNumberService;
        private readonly PeerCommunicationService _peerCommunicationService;
        private readonly PaxosLearnerService _paxosLearnerService;
        private readonly PaxosAcceptorService _acceptorService;
        private readonly PaxosState _state;
        private readonly int _nodeId;
        private readonly List<string> _peerUrls;

        public PaxosCoordinatorService(
            ProposalNumberService proposalNumberService,
            PeerCommunicationService peerCommunicationService,
            PaxosLearnerService paxosLearnerService,
            PaxosAcceptorService acceptorService,
            PaxosState state,
            int nodeId,
            List<string> peerUrls)
        {
            _proposalNumberService = proposalNumberService;
            _peerCommunicationService = peerCommunicationService;
            _paxosLearnerService = paxosLearnerService;
            _acceptorService = acceptorService;
            _state = state;
            _nodeId = nodeId;
            _peerUrls = peerUrls;
        }

        public async Task<string> StartProposalAsync(string originalValue)
        {
            long proposalNumber = _proposalNumberService.GetNextProposalNumber();

            Console.WriteLine($"[Node {_nodeId}] Starting proposal n={proposalNumber}, value={originalValue}");

            _state.CurrentPhase = "Prepare";

            var prepareRequest = new PrepareRequest
            {
                ProposalNumber = proposalNumber,
                ProposerId = _nodeId
            };

            var peerPrepareResponses = await _peerCommunicationService.SendPrepareAsync(
                prepareRequest,
                _peerUrls
            );

            var selfPrepareResponse = _acceptorService.HandlePrepare(prepareRequest);
            peerPrepareResponses.Add(selfPrepareResponse);

            var promisedResponses = peerPrepareResponses
                .Where(r => r.Promised)
                .ToList();

            int totalNodes = _peerUrls.Count + 1;
            int majority = (totalNodes / 2) + 1;

            if (promisedResponses.Count < majority)
            {
                _state.CurrentPhase = "Failed";
                return $"Proposal failed: only {promisedResponses.Count} promises received, majority is {majority}";
            }

            string chosenValue = originalValue;

            var highestAccepted = promisedResponses
                .Where(r => r.AcceptedProposalNumber.HasValue && !string.IsNullOrEmpty(r.AcceptedValue))
                .OrderByDescending(r => r.AcceptedProposalNumber)
                .FirstOrDefault();

            if (highestAccepted != null)
            {
                chosenValue = highestAccepted.AcceptedValue!;
            }

            Console.WriteLine($"[Node {_nodeId}] Chosen value for accept phase = {chosenValue}");

            _state.CurrentPhase = "Accept";

            var acceptRequest = new AcceptRequest
            {
                ProposalNumber = proposalNumber,
                Value = chosenValue,
                ProposerId = _nodeId
            };

            var peerAcceptResponses = await _peerCommunicationService.SendAcceptAsync(
                acceptRequest,
                _peerUrls
            );

            var selfAcceptResponse = _acceptorService.HandleAccept(acceptRequest);
            peerAcceptResponses.Add(selfAcceptResponse);

            var acceptedResponses = peerAcceptResponses
                .Where(r => r.Accepted)
                .ToList();

            if (acceptedResponses.Count < majority)
            {
                _state.CurrentPhase = "Failed";
                return $"Accept phase failed: only {acceptedResponses.Count} accepts received, majority is {majority}";
            }

            Console.WriteLine($"[Node {_nodeId}] Value chosen = {chosenValue}");

            _state.CurrentPhase = "Learn";

            _paxosLearnerService.LearnValue(proposalNumber, chosenValue);

            var learnRequest = new LearnRequest
            {
                ProposalNumber = proposalNumber,
                Value = chosenValue
            };

            await _peerCommunicationService.BroadcastLearnAsync(
                learnRequest,
                _peerUrls
            );

            _state.CurrentPhase = "Complete";

            return $"Success: value '{chosenValue}' chosen with proposal number {proposalNumber}";
        }

        public async Task BroadcastProposerAsync(int proposerNodeId)
        {
            await _peerCommunicationService.BroadcastSetProposerAsync(
                proposerNodeId,
                _peerUrls
            );
        }
    }
}
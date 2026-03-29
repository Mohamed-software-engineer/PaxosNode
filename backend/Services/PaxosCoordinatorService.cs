using Models;
using State;

namespace Services
{
    public class PaxosCoordinatorService
    {
        private readonly ProposalNumberService _proposalNumberService;
        private readonly PeerCommunicationService _peerCommunicationService;
        private readonly PaxosLearnerService _paxosLearnerService;
        private readonly PaxosState _state;
        private readonly int _nodeId;
        private readonly List<string> _peerUrls;

        public PaxosCoordinatorService(
            ProposalNumberService proposalNumberService,
            PeerCommunicationService peerCommunicationService,
            PaxosLearnerService paxosLearnerService,
            PaxosState state,
            int nodeId,
            List<string> peerUrls)
        {
            _proposalNumberService = proposalNumberService;
            _peerCommunicationService = peerCommunicationService;
            _paxosLearnerService = paxosLearnerService;
            _state = state;
            _nodeId = nodeId;
            _peerUrls = peerUrls;
        }

        public async Task<string> StartProposalAsync(string originalValue)
        {
            long proposalNumber = _proposalNumberService.GetNextProposalNumber();

            Console.WriteLine($"[Node {_nodeId}] Starting proposal n={proposalNumber}, value={originalValue}");

            var prepareRequest = new PrepareRequest
            {
                ProposalNumber = proposalNumber,
                ProposerId = _nodeId
            };

            var prepareResponses = await _peerCommunicationService.SendPrepareAsync(
                prepareRequest,
                _peerUrls
            );

            var promisedResponses = prepareResponses
                .Where(r => r.Promised)
                .ToList();

            int majority = (_peerUrls.Count / 2) + 1;

            if (promisedResponses.Count < majority)
            {
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

            var acceptRequest = new AcceptRequest
            {
                ProposalNumber = proposalNumber,
                Value = chosenValue,
                ProposerId = _nodeId
            };

            var acceptResponses = await _peerCommunicationService.SendAcceptAsync(
                acceptRequest,
                _peerUrls
            );

            var acceptedResponses = acceptResponses
                .Where(r => r.Accepted)
                .ToList();

            if (acceptedResponses.Count < majority)
            {
                return $"Accept phase failed: only {acceptedResponses.Count} accepts received, majority is {majority}";
            }

            Console.WriteLine($"[Node {_nodeId}] Value chosen = {chosenValue}");

            lock (_state)
            {
                _state.IsChosen = true;
                _state.LearnedValue = chosenValue;
            }

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

            return $"Success: value '{chosenValue}' chosen with proposal number {proposalNumber}";
        }
    }
}
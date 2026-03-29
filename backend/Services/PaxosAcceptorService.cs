using Models;
using State;

namespace Services
{
    public class PaxosAcceptorService
    {
        private readonly PaxosState _state;
        private readonly int _nodeId;

        public PaxosAcceptorService(PaxosState state, int nodeId)
        {
            _state = state;
            _nodeId = nodeId;
        }

        public PrepareResponse HandlePrepare(PrepareRequest request)
        {
            lock (_state)
            {
                if (request.ProposalNumber > _state.PromisedProposalNumber)
                {
                    _state.PromisedProposalNumber = request.ProposalNumber;

                    return new PrepareResponse
                    {
                        Promised = true,
                        PromisedProposalNumber = _state.PromisedProposalNumber,
                        AcceptedProposalNumber = _state.AcceptedProposalNumber,
                        AcceptedValue = _state.AcceptedValue,
                        NodeId = _nodeId,
                        Message = "Promise granted"
                    };
                }

                return new PrepareResponse
                {
                    Promised = false,
                    PromisedProposalNumber = _state.PromisedProposalNumber,
                    AcceptedProposalNumber = _state.AcceptedProposalNumber,
                    AcceptedValue = _state.AcceptedValue,
                    NodeId = _nodeId,
                    Message = "Rejected: higher or equal promise already exists"
                };
            }
        }

        public AcceptResponse HandleAccept(AcceptRequest request)
        {
            lock (_state)
            {
                if (request.ProposalNumber >= _state.PromisedProposalNumber)
                {
                    _state.PromisedProposalNumber = request.ProposalNumber;
                    _state.AcceptedProposalNumber = request.ProposalNumber;
                    _state.AcceptedValue = request.Value;

                    return new AcceptResponse
                    {
                        Accepted = true,
                        NodeId = _nodeId,
                        Message = "Accept granted"
                    };
                }

                return new AcceptResponse
                {
                    Accepted = false,
                    NodeId = _nodeId,
                    Message = "Rejected: higher promised proposal exists"
                };
            }
        }
    }
}
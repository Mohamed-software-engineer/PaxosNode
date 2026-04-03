using Microsoft.AspNetCore.Mvc;
using Models;
using Services;
using State;

namespace Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaxosController : ControllerBase
    {
        private readonly PaxosCoordinatorService _coordinatorService;
        private readonly PaxosAcceptorService _acceptorService;
        private readonly PaxosLearnerService _learnerService;
        private readonly PaxosCatchUpService _catchUpService;
        private readonly PaxosState _state;
        private readonly int _nodeId;
        private readonly List<string> _peerUrls;

        public PaxosController(
            PaxosCoordinatorService coordinatorService,
            PaxosAcceptorService acceptorService,
            PaxosLearnerService learnerService,
            PaxosCatchUpService catchUpService,
            PaxosState state,
            NodeConfiguration nodeConfiguration,
            List<string> peerUrls)
        {
            _coordinatorService = coordinatorService;
            _acceptorService = acceptorService;
            _learnerService = learnerService;
            _catchUpService = catchUpService;
            _state = state;
            _nodeId = nodeConfiguration.NodeId;
            _peerUrls = peerUrls;
        }

        [HttpPost("propose")]
        public async Task<IActionResult> Propose([FromBody] ProposeRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Value))
            {
                return BadRequest(new { message = "Value is required." });
            }

            var result = await _coordinatorService.StartProposalAsync(request.Value);

            return Ok(new
            {
                message = result
            });
        }

        [HttpPost("set-provider")]
        public IActionResult SetProvider([FromBody] SetProviderRequest request)
        {
            if (request == null || request.ProviderNodeId <= 0)
            {
                return BadRequest(new { message = "Invalid request." });
            }

            _state.IsProvider = false;

            Console.WriteLine($"[Node {_nodeId}] Node {request.ProviderNodeId} is now the provider.");

            return Ok(new
            {
                message = $"Node {request.ProviderNodeId} is now the provider."
            });
        }

        [HttpPost("prepare")]
        public IActionResult Prepare([FromBody] PrepareRequest request)
        {
            if (request == null)
            {
                return BadRequest(new { message = "Invalid prepare request." });
            }

            var response = _acceptorService.HandlePrepare(request);
            return Ok(response);
        }

        [HttpPost("accept")]
        public IActionResult Accept([FromBody] AcceptRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Value))
            {
                return BadRequest(new { message = "Invalid accept request." });
            }

            var response = _acceptorService.HandleAccept(request);
            return Ok(response);
        }

        [HttpPost("learn")]
        public IActionResult Learn([FromBody] LearnRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Value))
            {
                return BadRequest(new { message = "Invalid learn request." });
            }

            _learnerService.LearnValue(request.ProposalNumber, request.Value);

            return Ok(new
            {
                message = $"Value '{request.Value}' learned successfully."
            });
        }

        [HttpGet("state")]
        public IActionResult GetState()
        {
            var response = new NodeStateResponse
            {
                NodeId = _nodeId,
                PromisedProposalNumber = _state.PromisedProposalNumber,
                AcceptedProposalNumber = _state.AcceptedProposalNumber,
                AcceptedValue = _state.AcceptedValue,
                IsChosen = _state.IsChosen,
                LearnedValue = _state.LearnedValue,
                IsProvider = _state.IsProvider,
                CurrentPhase = _state.CurrentPhase,
                JoinedLate = _state.JoinedLate
            };

            return Ok(response);
        }

        [HttpGet("health")]
        public IActionResult Health()
        {
            return Ok(new
            {
                status = "ok",
                message = "Paxos node is running"
            });
        }

        [HttpPost("catch-up")]
        public async Task<IActionResult> CatchUp()
        {
            var success = await _catchUpService.CatchUpAsync(_peerUrls);

            if (success)
            {
                return Ok(new
                {
                    message = $"Successfully caught up. Learned value: '{_state.LearnedValue}'."
                });
            }

            return StatusCode(503, new
            {
                message = "Could not catch up. Not enough peers have a consensus value yet."
            });
        }
    }
}
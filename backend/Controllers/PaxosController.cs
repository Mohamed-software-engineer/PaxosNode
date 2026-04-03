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
        private readonly PaxosState _state;
        private readonly int _nodeId;

        public PaxosController(
            PaxosCoordinatorService coordinatorService,
            PaxosAcceptorService acceptorService,
            PaxosLearnerService learnerService,
            PaxosState state,
            NodeConfiguration nodeConfiguration)
        {
            _coordinatorService = coordinatorService;
            _acceptorService = acceptorService;
            _learnerService = learnerService;
            _state = state;
            _nodeId = nodeConfiguration.NodeId;
        }

        [HttpPost("propose")]
        public async Task<IActionResult> Propose([FromBody] ProposeRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Value))
            {
                return BadRequest(new { message = "Value is required." });
            }

            _state.IsProvider = true;

            await _coordinatorService.BroadcastProviderAsync(_nodeId);

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
                IsProvider = _state.IsProvider
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
    }
}
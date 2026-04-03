namespace Models
{
    public class NodeStateResponse
    {
        public int NodeId { get; set; }
        public long PromisedProposalNumber { get; set; }
        public long? AcceptedProposalNumber { get; set; }
        public string? AcceptedValue { get; set; }
        public bool IsChosen { get; set; }
        public string? LearnedValue { get; set; }
        public bool IsProvider { get; set; }
        public string CurrentPhase { get; set; } = "Idle";
        public bool JoinedLate { get; set; } = false;
    }
}
namespace State
{
    public class PaxosState
    {
        public long PromisedProposalNumber { get; set; } = -1;
        public long? AcceptedProposalNumber { get; set; }
        public string? AcceptedValue { get; set; }

        public bool IsChosen { get; set; } = false;
        public string? LearnedValue { get; set; }
        public bool IsProvider { get; set; } = false;
        public string CurrentPhase { get; set; } = "Idle";
    }
}
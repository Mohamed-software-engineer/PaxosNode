namespace Models
{
    public class PrepareResponse
    {
        public bool Promised { get; set; }
        public long PromisedProposalNumber { get; set; }
        public long? AcceptedProposalNumber { get; set; }
        public string? AcceptedValue { get; set; }
        public int NodeId { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}
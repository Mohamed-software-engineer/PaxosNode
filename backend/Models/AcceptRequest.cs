namespace Models
{
    public class AcceptRequest
    {
        public long ProposalNumber { get; set; }
        public string Value { get; set; } = string.Empty;
        public int ProposerId { get; set; }
    }
}
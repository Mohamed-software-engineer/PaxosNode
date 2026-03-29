namespace Models
{
    public class AcceptResponse
    {
        public bool Accepted { get; set; }
        public int NodeId { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}
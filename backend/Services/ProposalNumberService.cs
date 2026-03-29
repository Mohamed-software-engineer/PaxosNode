namespace Services
{
    public class ProposalNumberService
    {
        private long _counter = 0;
        private readonly int _nodeId;
        private readonly object _lock = new();

        public ProposalNumberService(int nodeId)
        {
            _nodeId = nodeId;
        }

        public long GetNextProposalNumber()
        {
            lock (_lock)
            {
                _counter++;
                return (_counter * 10) + _nodeId;
            }
        }
    }
}
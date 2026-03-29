using State;

namespace Services
{
    public class PaxosLearnerService
    {
        private readonly PaxosState _state;

        public PaxosLearnerService(PaxosState state)
        {
            _state = state;
        }

        public void LearnValue(long proposalNumber, string value)
        {
            lock (_state)
            {
                _state.IsChosen = true;
                _state.LearnedValue = value;
            }
        }
    }
}
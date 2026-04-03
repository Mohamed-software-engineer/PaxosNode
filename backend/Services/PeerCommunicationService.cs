using System.Net.Http.Json;
using Models;

namespace Services
{
    public class PeerCommunicationService
    {
        private readonly HttpClient _httpClient;

        public PeerCommunicationService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<List<PrepareResponse>> SendPrepareAsync(
            PrepareRequest request,
            List<string> peerUrls)
        {
            var tasks = peerUrls.Select(async peer =>
            {
                try
                {
                    var response = await _httpClient.PostAsJsonAsync(
                        $"{peer}/api/paxos/prepare",
                        request
                    );

                    if (response.IsSuccessStatusCode)
                    {
                        var body = await response.Content.ReadFromJsonAsync<PrepareResponse>();
                        return body;
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Prepare failed for {peer}: {ex.Message}");
                }

                return (PrepareResponse?)null;
            });

            var results = await Task.WhenAll(tasks);
            return results.Where(r => r != null).Select(r => r!).ToList();
        }

        public async Task<List<AcceptResponse>> SendAcceptAsync(
            AcceptRequest request,
            List<string> peerUrls)
        {
            var tasks = peerUrls.Select(async peer =>
            {
                try
                {
                    var response = await _httpClient.PostAsJsonAsync(
                        $"{peer}/api/paxos/accept",
                        request
                    );

                    if (response.IsSuccessStatusCode)
                    {
                        var body = await response.Content.ReadFromJsonAsync<AcceptResponse>();
                        return body;
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Accept failed for {peer}: {ex.Message}");
                }

                return (AcceptResponse?)null;
            });

            var results = await Task.WhenAll(tasks);
            return results.Where(r => r != null).Select(r => r!).ToList();
        }

        public async Task BroadcastLearnAsync(
            LearnRequest request,
            List<string> peerUrls)
        {
            var tasks = peerUrls.Select(async peer =>
            {
                try
                {
                    await _httpClient.PostAsJsonAsync(
                        $"{peer}/api/paxos/learn",
                        request
                    );
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Learn failed for {peer}: {ex.Message}");
                }
            });

            await Task.WhenAll(tasks);
        }

        public async Task<List<NodeStateResponse>> GetStatesAsync(List<string> peerUrls)
        {
            var tasks = peerUrls.Select(async peer =>
            {
                try
                {
                    var response = await _httpClient.GetAsync($"{peer}/api/paxos/state");

                    if (response.IsSuccessStatusCode)
                    {
                        var body = await response.Content.ReadFromJsonAsync<NodeStateResponse>();
                        return body;
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"GetState failed for {peer}: {ex.Message}");
                }

                return (NodeStateResponse?)null;
            });

            var results = await Task.WhenAll(tasks);
            return results.Where(r => r != null).Select(r => r!).ToList();
        }

        public async Task BroadcastSetProposerAsync(
            int proposerNodeId,
            List<string> peerUrls)
        {
            var payload = new { proposerNodeId };

            var tasks = peerUrls.Select(async peer =>
            {
                try
                {
                    await _httpClient.PostAsJsonAsync(
                        $"{peer}/api/paxos/set-proposer",
                        payload
                    );
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"SetProposer broadcast failed for {peer}: {ex.Message}");
                }
            });

            await Task.WhenAll(tasks);
        }
    }
}

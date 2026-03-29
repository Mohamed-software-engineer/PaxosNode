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
            var responses = new List<PrepareResponse>();

            foreach (var peer in peerUrls)
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
                        if (body != null)
                        {
                            responses.Add(body);
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Prepare failed for {peer}: {ex.Message}");
                }
            }

            return responses;
        }

        public async Task<List<AcceptResponse>> SendAcceptAsync(
            AcceptRequest request,
            List<string> peerUrls)
        {
            var responses = new List<AcceptResponse>();

            foreach (var peer in peerUrls)
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
                        if (body != null)
                        {
                            responses.Add(body);
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Accept failed for {peer}: {ex.Message}");
                }
            }

            return responses;
        }

        public async Task BroadcastLearnAsync(
            LearnRequest request,
            List<string> peerUrls)
        {
            foreach (var peer in peerUrls)
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
            }
        }
    }
}
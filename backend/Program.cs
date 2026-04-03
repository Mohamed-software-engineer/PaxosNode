using Models;
using Services;
using State;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

//
// Read configuration from environment variables
//
var nodeIdEnv = Environment.GetEnvironmentVariable("NODE_ID");
int nodeId = string.IsNullOrWhiteSpace(nodeIdEnv) ? 1 : int.Parse(nodeIdEnv);

var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

var peersEnv = Environment.GetEnvironmentVariable("PEERS");
var peerUrls = string.IsNullOrWhiteSpace(peersEnv)
    ? new List<string>()
    : peersEnv.Split(',', StringSplitOptions.RemoveEmptyEntries)
              .Select(p => p.Trim())
              .ToList();

//
// Register shared state
//
builder.Services.AddSingleton<PaxosState>();

//
// Register HttpClient
//
builder.Services.AddHttpClient<PeerCommunicationService>(client =>
{
    client.Timeout = TimeSpan.FromSeconds(5);
})
.ConfigurePrimaryHttpMessageHandler(() => new SocketsHttpHandler
{
    PooledConnectionLifetime = TimeSpan.FromMinutes(2),
    MaxConnectionsPerServer = 10
});

//
// Register services
//
builder.Services.AddSingleton(new ProposalNumberService(nodeId));

builder.Services.AddSingleton<PaxosLearnerService>(sp =>
{
    var state = sp.GetRequiredService<PaxosState>();
    return new PaxosLearnerService(state);
});

builder.Services.AddSingleton<PaxosAcceptorService>(sp =>
{
    var state = sp.GetRequiredService<PaxosState>();
    return new PaxosAcceptorService(state, nodeId);
});

builder.Services.AddSingleton<PaxosCatchUpService>(sp =>
{
    var peerComm = sp.GetRequiredService<PeerCommunicationService>();
    var learnerService = sp.GetRequiredService<PaxosLearnerService>();
    var state = sp.GetRequiredService<PaxosState>();
    return new PaxosCatchUpService(peerComm, learnerService, state, nodeId);
});

builder.Services.AddSingleton<PaxosCoordinatorService>(sp =>
{
    var proposalNumberService = sp.GetRequiredService<ProposalNumberService>();
    var peerCommunicationService = sp.GetRequiredService<PeerCommunicationService>();
    var learnerService = sp.GetRequiredService<PaxosLearnerService>();
    var acceptorService = sp.GetRequiredService<PaxosAcceptorService>();
    var state = sp.GetRequiredService<PaxosState>();

    return new PaxosCoordinatorService(
        proposalNumberService,
        peerCommunicationService,
        learnerService,
        acceptorService,
        state,
        nodeId,
        peerUrls
    );
});

builder.Services.AddSingleton(sp =>
{
    return new NodeConfiguration { NodeId = nodeId };
});

builder.Services.AddSingleton<List<string>>(peerUrls);

var allowedOrigins = Environment.GetEnvironmentVariable("ALLOWED_ORIGINS")
    ?.Split(',', StringSplitOptions.RemoveEmptyEntries)
    .Select(o => o.Trim())
    .ToArray()
    ?? Array.Empty<string>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        if (allowedOrigins.Length > 0)
        {
            policy.WithOrigins(allowedOrigins)
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        }
        else
        {
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        }
    });
});


var app = builder.Build();

app.UseCors("AllowFrontend");

// Configure the HTTP request pipeline.
// if (app.Environment.IsDevelopment())
// {
// }
    app.UseSwagger();
    app.UseSwaggerUI();

//app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

//
// Proposer election: first node to start becomes the proposer
//
var lifetime = app.Services.GetRequiredService<IHostApplicationLifetime>();
var peerComm = app.Services.GetRequiredService<PeerCommunicationService>();
var state = app.Services.GetRequiredService<PaxosState>();

lifetime.ApplicationStarted.Register(async () =>
{
    await Task.Delay(1000);

    Console.WriteLine($"[Node {nodeId}] Checking if a proposer already exists...");

    bool proposerExists = false;

    foreach (var peer in peerUrls)
    {
        try
        {
            using var client = new HttpClient { Timeout = TimeSpan.FromSeconds(2) };
            var response = await client.GetAsync($"{peer}/api/paxos/state");

            if (response.IsSuccessStatusCode)
            {
                var peerState = await response.Content.ReadFromJsonAsync<NodeStateResponse>();
                if (peerState != null && peerState.IsProposer)
                {
                    Console.WriteLine($"[Node {nodeId}] Proposer found: Node {peerState.NodeId} at {peer}");
                    proposerExists = true;
                    break;
                }
            }
        }
        catch
        {
            Console.WriteLine($"[Node {nodeId}] Peer {peer} not reachable yet.");
        }
    }

    if (!proposerExists)
    {
        state.IsProposer = true;
        Console.WriteLine($"[Node {nodeId}] No proposer found. This node is now the PROPOSER.");
    }
    else
    {
        state.IsProposer = false;
        Console.WriteLine($"[Node {nodeId}] Proposer already exists. This node is an acceptor.");
    }

    var catchUpService = app.Services.GetRequiredService<PaxosCatchUpService>();
    await catchUpService.CatchUpAsync(peerUrls);
});

app.Run();
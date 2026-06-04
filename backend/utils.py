import random
from datetime import datetime

ALIASES = [
    "Aegis", "Aether", "Aftershock", "Albatross", "Alpha", "Ambassador",
    "Anvil", "Apollo", "Arbiter", "Arcadia", "Archer", "Argon",
    "Artemis", "Ashfall", "Aspen", "Atlas", "Aurora", "Avalanche",
    "Axis", "Azimuth", "Banshee", "Basilisk", "Beacon", "Bearclaw",
    "Behemoth", "Blackbird", "Blackout", "Blizzard", "BlueNova",
    "Bolt", "Boomerang", "Borealis", "Bulwark", "Byte", "Calypso",
    "Cascade", "Catalyst", "Centaur", "Cerberus", "Chaos", "Cipher",
    "Cirrus", "Citadel", "Cobalt", "Comet", "Compass", "Condor",
    "Conquest", "Cosmos", "Crimson", "Crow", "Cryo", "Cyclone",
    "Daemon", "Darkstar", "Dawn", "Daybreak", "Delta", "Diamond",
    "Draco", "Dragonfly", "Dreadnought", "EagleEye", "Echo",
    "Eclipse", "Edge", "Element", "Ember", "Endeavor", "Enigma",
    "Equinox", "Everest", "Excalibur", "Exodus", "Falcon", "Fathom",
    "Fenrir", "Firefly", "Firestorm", "Flux", "Forge", "Frontier",
    "Frostbite", "Fusion", "Gaia", "Galaxy", "Gamma", "Genesis",
    "Ghost", "Glacier", "Goliath", "Griffin", "Guardian", "Halo",
    "Hammer", "Havoc", "Helios", "Hermes", "Horizon", "Hydra",
    "Hyperion", "Iceberg", "Icon", "Ignite", "Inferno", "Ion",
    "Iris", "Jaguar", "Javelin", "Juno", "Keystone", "Kraken",
    "Labyrinth", "Lancer", "Legacy", "Leviathan", "Liberty",
    "Lightning", "Lighthouse", "Loki", "Lotus", "Lynx", "Mammoth",
    "Mantis", "Mariner", "Matrix", "Meridian", "Meteor", "Mirage",
    "Monarch", "Moonshot", "Nebula", "Nemesis", "Neptune", "Nexus",
    "Nightfall", "Nimbus", "Nomad", "Nova", "Obelisk", "Obsidian",
    "Odyssey", "Olympus", "Omega", "Onyx", "Oracle", "Orbit",
    "Orion", "Outrider", "Overwatch", "Owl", "Pandora", "Paradox",
    "Patriot", "Pegasus", "Perseus", "Phantom", "Phoenix", "Pioneer",
    "Plasma", "Polaris", "Poseidon", "Predator", "Prime", "Prometheus",
    "Pulse", "Quantum", "Quasar", "Ragnarok", "Raptor", "Raven",
    "Redshift", "Requiem", "Resolver", "Rocket", "Rogue", "Saber",
    "Saffron", "Samurai", "Scarab", "Sentinel", "Shadow", "Shogun",
    "Signal", "Silverback", "Skylark", "Solstice", "Specter",
    "Spartan", "Sphinx", "Starlight", "Storm", "Stormbreaker",
    "Stratos", "Summit", "Sunfire", "Supernova", "Surtur", "Talon",
    "Tempest", "Terminal", "Thor", "Thunder", "Titan", "Torch",
    "Tornado", "Trident", "Triton", "Umbra", "Unicorn", "Valkyrie",
    "Vector", "Venom", "Vertex", "Viper", "Vortex", "Voyager",
    "Warlock", "Watchtower", "Whisper", "Wildfire", "Windshear",
    "Wolfpack", "Wraith", "Xenon", "Ymir", "Zephyr", "Zenith",
    "ZeroDay", "Zodiac", "Zulu",

    "GhostTunn", "SilentEcho", "DarkRelay", "CipherNet", "VoidLink",
    "IronGate", "ShadowNode", "NightProtocol", "SpectralBridge",
    "QuantumTunnel", "BlackSignal", "NeuralPath", "CrimsonNode",
    "PhantomWire", "ProjectEclipse", "OperationAtlas",
    "ProjectNebula", "OperationTempest", "ProjectSentinel",
    "OperationVanguard", "ProjectAegis", "OperationObsidian",
    "CyberHydra", "CyberKraken", "CyberOracle", "CyberPhoenix",
    "DataForge", "DataHorizon", "DataVault", "DataSpecter",
    "CodeTitan", "CodeVortex", "CodePhantom", "CodeAurora",
    "BinaryStorm", "BinaryGhost", "BinaryRaven", "BinaryTitan",
    "Kernel", "Root", "DaemonCore", "Socket", "Pipeline",
    "Backbone", "Gridlock", "Mainframe", "Hyperlink", "Payload",
    "Proxy", "Relay", "Sandbox", "KernelX", "RootZero",
    "TitanCore", "QuantumCore", "Astra", "Astraeus", "Chronos",
    "Helix", "VertexPrime", "DarkMatter", "EventHorizon",
    "Singularity", "Starforge", "Solaris", "Lunaris",
    "Terranova", "ProjectGenesis", "ProjectAscension",
    "ProjectFrontier", "ProjectInfinity", "ProjectPinnacle",
    "OperationNightfall", "OperationFirestorm",
    "OperationBlackout", "OperationSkyfall",
    "OperationSilentStorm", "OperationIronShield",
    "OperationSilverArrow", "OperationThunderbolt",
    "OperationDeepBlue", "OperationFrozenDawn",
    "OperationCrimsonWave", "OperationWhiteWolf",
    "OperationGoldenEagle", "OperationSteelRain"
]

AVATAR_CHOICES = [
    {"name": "Amber Trail", "symbol": "⛰️", "description": "Abstract mountain road"},
    {"name": "Neon Ghost", "symbol": "👻", "description": "Digital ghost symbol"},
    {"name": "Midnight Owl", "symbol": "🦉", "description": "Nocturnal guide"},
    {"name": "Golden Circuit", "symbol": "⚡", "description": "Electric pathway"},
    {"name": "Lunar Wave", "symbol": "🌙", "description": "Soft lunar glow"},
    {"name": "Silent Arrow", "symbol": "🏹", "description": "Stealth motion"},
    {"name": "Crimson Shadow", "symbol": "🩸", "description": "Dark red silhouette"},
    {"name": "Azure Flame", "symbol": "🔥", "description": "Blue fire energy"},
    {"name": "Emerald Pulse", "symbol": "💚", "description": "Vibrant green beat"},
    {"name": "Obsidian Wing", "symbol": "🦅", "description": "Dark feathered flight"},
    {"name": "Blue Moon", "symbol": "🌙", "description": "Celestial glow"},
    {"name": "Silver Ghost", "symbol": "👻", "description": "Shiny ghost symbol"},
    {"name": "Golden Phantom", "symbol": "👻", "description": "Luxurious ghost symbol"},
    {"name": "Violet Specter", "symbol": "👻", "description": "Mysterious purple ghost"},
    {"name": "Emerald Sphinx", "symbol": "🦁", "description": "Green mythical creature"},
    {"name": "Azure Eclipse", "symbol": "🌑", "description": "Dark blue eclipse"},
    {"name": "Scarlet Vortex", "symbol": "🌀", "description": "Red swirling energy"},
    {"name": "Indigo Nebula", "symbol": "🌌", "description": "Deep space cloud"},
    {"name": "Violet Nebula", "symbol": "🌌", "description": "Purple space cloud"},
    {"name": "Crimson Nebula", "symbol": "🌌", "description": "Red space cloud"},
    {"name": "Emerald Nebula", "symbol": "🌌", "description": "Green space cloud"},
]


def generate_public_id(alias: str = None) -> str:
    alias = alias or random.choice(ALIASES)
    digits = random.randint(100, 999)
    return f"@Ghost-{alias}-{digits}"


def generate_private_id() -> str:
    variable = "".join(random.choices("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", k=3))
    date_segment = datetime.utcnow().strftime("%d%m")
    return f"#ghost-{variable}-{date_segment}-EH-EV-E01"


def get_avatar_choices():
    return AVATAR_CHOICES

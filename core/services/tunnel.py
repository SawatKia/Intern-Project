from sshtunnel import SSHTunnelForwarder
import os


dir_path = os.path.dirname(os.path.realpath(__file__))


class Tunnel_Session:
    def __init__(self):
        bind_hosts = [h.strip() for h in os.getenv("SSL_TUNNEL_BIND_HOSTS", "").split(",") if h.strip() != ""]
        bind_ports = [int(p.strip()) for p in os.getenv("SSL_TUNNEL_BIND_PORTS", "").split(",") if p.strip() != ""]

        # zip the two lists together
        remote_bind_addresses = list(zip(bind_hosts, bind_ports))

        preferred_local_hosts = os.getenv("SSL_TUNNEL_PREFERRED_LOCAL_HOST", None)
        preferred_local_ports = os.getenv("SSL_TUNNEL_PREFERRED_LOCAL_PORT", None)

        if preferred_local_hosts is not None and preferred_local_ports is not None:
            preferred_local_hosts = [h.strip() for h in preferred_local_hosts.split(",") if h.strip() != ""]
            preferred_local_ports = [int(p.strip()) for p in preferred_local_ports.split(",") if p.strip() != ""]
            if len(preferred_local_hosts) != len(preferred_local_ports):
                raise Exception("Number of preferred local hosts does not match number of preferred local ports.")
            else:
                local_bind_addresses = list(zip(preferred_local_hosts, preferred_local_ports))
        else:
            local_bind_addresses = None

        self.server = SSHTunnelForwarder(
            (os.getenv("SSL_TUNNEL_HOST"), 22),
            ssh_username=os.getenv("SSL_TUNNEL_USERNAME"),  
            ssh_pkey=os.getenv("SSL_TUNNEL_PRIVKEY_PATH", os.path.join(dir_path, "..", "..", "artifacts", "id_rsa")),
            remote_bind_addresses=remote_bind_addresses,
            local_bind_addresses=local_bind_addresses,
        )
        self.server.start()
        self.server.check_tunnels()
        for (h, p), s in self.server.tunnel_is_up.items():
            if not s:
                raise Exception(f"Tunnel to {h}:{p} is not up.")
            else:
                print(f"Tunnel to {h}:{p} is up.")

        print("Tunneling start")
        

    def get_bind_addresses(self):
        return [('127.0.0.1', p) for p in self.server.local_bind_ports]

    def disconnect(self):
        self.server.stop()



ssh_tunnel = None
domain_overrides = {
}

def initialize():
    global ssh_tunnel

    use_tunnel = os.getenv("USE_SSH_TUNNEL", None)
    if use_tunnel is not None and use_tunnel.lower() == "true":
        try:
            ssh_tunnel = Tunnel_Session()
        except Exception as e:
            print(e)
            print("Biding port fails: Exiting.")
            exit(1)

        overrides = ssh_tunnel.get_bind_addresses()
        if len(overrides) > 0:
            domain_overrides["database"] = overrides[0]
        if len(overrides) > 1:
            domain_overrides["message_brokers"] = overrides[1]
        if len(overrides) > 2:
            domain_overrides["docker"] = overrides[2]


def get_override(domain):
    if domain not in domain_overrides:
        return None, None
    ov = domain_overrides[domain]
    return ov[0], ov[1]
    

def terminate():
    if ssh_tunnel is not None:
        ssh_tunnel.disconnect()

initialize()
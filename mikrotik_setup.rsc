# === 1) Paramètres (modifier avant exécution) ===
:local WAN_IF "ether1"            # interface WAN
:local BRIDGE_NAME "bridge-wifi"
:local HOTSPOT_ADDR "192.168.50.1/24"
:local POOL_RANGE "192.168.50.10-192.168.50.254"
:local SSID_24 "MonWifiZone"
:local SSID_5 "MonWifiZone-5G"
:local WIFI_PASS "ChangeMoi123"
:local API_USER "backend_api"
:local API_PASS "TrèsSecretApiPass123!"
:local HOTSPOT_DNSNAME "hotspot.local"

# === 2) Activer API et créer user API ===
/ip service enable api
/user add name=$API_USER group=full password=$API_PASS

# === 3) Bridge et interfaces ===
/interface bridge add name=$BRIDGE_NAME
# ajouter ports Ethernet déjà présents (si besoin) -- commenter si bridge existe
# /interface bridge port add bridge=$BRIDGE_NAME interface=ether2

# ajouter wlan1/wlan2 au bridge après configuration Wireless

# === 4) IP, pool, DHCP, NAT ===
/ip address add address=$HOTSPOT_ADDR interface=$BRIDGE_NAME
/ip pool add name=hs-pool ranges=$POOL_RANGE
/ip dhcp-server add name=dhcp-hotspot interface=$BRIDGE_NAME address-pool=hs-pool lease-time=1h
/ip dhcp-server network add address=192.168.50.0/24 gateway=[:pick [$HOTSPOT_ADDR] 0] dns-server=8.8.8.8
/ip firewall nat add chain=srcnat out-interface=$WAN_IF action=masquerade

# === 5) Wireless setup (2.4 + 5GHz) ===
# 2.4GHz - wlan1
/interface wireless set wlan1 mode=ap-bridge ssid=$SSID_24 band=2ghz-b/g/n frequency=2412 disabled=no
/interface wireless security-profiles add name=wifi-secure auth-types=wpa2-psk unicast-ciphers=aes-ccm group-ciphers=aes-ccm wpa2-pre-shared-key=$WIFI_PASS
/interface wireless set wlan1 security-profile=wifi-secure
/interface bridge port add bridge=$BRIDGE_NAME interface=wlan1

# 5GHz - wlan2 (si présent)
:if ([/interface find name=wlan2] != "") do={
  /interface wireless set wlan2 mode=ap-bridge ssid=$SSID_5 band=5ghz-a/n/ac frequency=5180 disabled=no
  /interface wireless set wlan2 security-profile=wifi-secure
  /interface bridge port add bridge=$BRIDGE_NAME interface=wlan2
}

# === 6) Hotspot setup (profile + server) ===
/ip hotspot profile add name=hsprof hotspot-address=([:pick $HOTSPOT_ADDR 0]) dns-name=$HOTSPOT_DNSNAME html-directory=hotspot
/ip hotspot add name=hotspot1 interface=$BRIDGE_NAME profile=hsprof address-pool=hs-pool

# Create a default admin user for hotspot (local, for tests)
# NOTE: in prod, backend will create users dynamically
/ip hotspot user add name="demo_user" password="demo_pass" limit-uptime=1d

# === 7) Optional: enable API-SSL (if RouterOS supports) ===
/ip service set api-ssl disabled=yes  # enable if certificate is configured

# === 8) Save configuration ===
/system backup save name=after-hotspot
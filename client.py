import urllib.request, json 
from pprint import pprint

return_data = []
with urllib.request.urlopen('http://192.168.5.107:5000/access/ips') as url:
    data = json.loads(url.read().decode())
    pprint(data)
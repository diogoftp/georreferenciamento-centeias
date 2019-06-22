import urllib.request, json 
from pprint import pprint
import ssl

def retrieve_json(this_url):
    # Pega um Json do banco de dados
    #context = ssl._create_unverified_context()    
    #with urllib.request.urlopen(this_url, context=context) as url:
    with urllib.request.urlopen(this_url) as url:
        data = json.loads(url.read().decode())
        # Query vazia
        if(data == []):            
            return None
        else:    
            return data

# Retorna as eventos disponiveis no banco
def available_events(url):
    data = retrieve_json(url)
    if data == None:
        return {}
    array = []
    dic = {}
    for result in data['data']:
        for result2 in result['event']:
            event = result2
            if event:
                array.append(event)

    array = (list(set(array)))
    dic['events'] = array
    return dic

# Processa um Json para o front receber o dado
# search_country define se deve-se buscar no brasil ou no mundo inteiro
def process_json(data, search_country, date_begin, date_end, event):
    # count_dic contém quantas noticias tem em cada localização
    count_dic = {}
    # url_dic contém as url's de cada localização
    url_dic = {}

    for result in data['data']:
        if search_country:
            # Se o resultado for global pesquise paises
            local = result['country']
        else:
            # se n, pesquise estados
            local = result['uf']

        if date_end != []:
            date_result = result['publishedAt'].split('T')[0].split('-')
            if date_result[0] > date_end[0]:
                continue
            elif date_result[0] == date_end[0]:
                if date_result[1] > date_end[1]:
                    continue
                elif date_result[1] == date_end[1]:
                    if date_result[2] > date_end[2]:
                        continue

        if date_begin != []:
            date_result = result['publishedAt'].split('T')[0].split('-')
            if date_result[0] < date_begin[0]:
                continue
            elif date_result[0] == date_begin[0]:
                if date_result[1] < date_begin[1]:
                    continue
                elif date_result[1] == date_begin[1]:
                    if date_result[2] < date_begin[2]:
                        continue

        if local == '':            
            continue

        # Inserção dos counts
        if (local not in count_dic):
            count_dic[local] = 1                        
        else:
            count_dic[local] += 1

        # Inserção das urls
        if(local not in url_dic):
            url_dic[local] = [
                {'link': result['url'],
                'title': result['title'],
                'description':result['description']
                }]
        else:
            url_dic[local].append(
                {'link': result['url'],
                'title': result['title'],
                'description':result['description']
                })
                
    result_dictionary = {}

    result_dictionary['country'] = search_country
    result_dictionary['event'] = event
    result_dictionary['data'] = []    
    
    for d in count_dic:
        result_dictionary['data'].append(
            {
            'local': d,
            'count': count_dic[d],
            'url': url_dic[d]
            })
                
    return result_dictionary

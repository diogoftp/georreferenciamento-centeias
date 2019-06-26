## Sistema de Informação Georreferenciado 
Sistema utilizado no Centeias da UnB - Universidade de Brasília. Esse sistema acessa ao banco de dados da organização e é capaz de plotar pontos pelo mapa, sendo possível aplicar filtros para pesquisas específicas. O intuito é que o usuário possa realizar pesquisas de maneira mais intuitiva e dinâmica, podendo obter resultados mais concretos de maneira rápida e objetiva.


## Instalação 
É necessário ter o Python 3.x instalado na máquina. Com o repositório na máquina, acesse o diretório e execute o código abaixo:
```
python3 -m venv venv
```
```
pip install -r requirements.txt
```

Configuração:
Declare a variável de ambiente que será o IP o banco de dados da seguinte forma:
```
export DATABASE_URL=http://127.0.0.1:8080/noticias?
```
Nota: Importante colocar o "http://". O IP e a porta devem ser trocados para o IP e a porta do banco de dados.

OU

Abra o arquivo server.py.
Comente a linha: database_url = os.environ['DATABASE_URL']
Descomente a linha: database_url = "http://127.0.0.1:8080/noticias?" alterando o IP e a porta para o endereço do banco de dados.

Para executar:
```
python3 -E server.py
```
O mapa pode ser acessado pelo endereço http://127.0.0.1:5000 através do navegador.

## Desenvolvedores
O sistema foi desenvolvido por Gabriel Silva, Léo Silva e Luan Caldas (2018), e redesenhado por Camila Pontes e Diogo Pontes (2019).

import tmdbsimple as tmdb
import sys
import json

tmdb.API_KEY = '1a3f1b0a8620851f42d4b1a95494d44d'

"""
movie = tmdb.Movies(603)
response = movie.info()
print(movie.title)
print(movie.budget)

search = tmdb.Search()
response = search.movie(query = "suits")
for s in search.results:
	print(s['title'], s['id'], s['release_date'], s['popularity'])
"""

discover = tmdb.Discover()
responseByPop = discover.movie(sort_by = 'popularity.desc')
responseByPop = json.dumps(responseByPop)
print(responseByPop)
#for r in discover.results:
#	print(r['title'], r['popularity'])

"""
#La query est toujours obligatoire et se fait sur le titre
search = tmdb.Search()
response = search.movie(query = "action", year = 2015)
for s in search.results:
	print(s['title'], s['id'], s['release_date'], s['popularity'])
"""

import tmdbsimple as tmdb
import sys

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
response = discover.movie(year=2015, sort_by = "vote_average.asc")
for r in discover.results:
	print(r['title'], r['vote_average'], r['release_date'], r['popularity'])

import tmdbsimple as tmdb
import sys

tmdb.API_KEY = '1a3f1b0a8620851f42d4b1a95494d44d'

movie = tmdb.Movies(603)
response = movie.info()
print(movie.title)
print(movie.budget)
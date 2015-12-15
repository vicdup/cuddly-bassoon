import tmdbsimple as tmdb
import sys

tmdb.API_KEY = '1a3f1b0a8620851f42d4b1a95494d44d'

if __name__ == "__main__":
    search = tmdb.Search()
    query = raw_input("saisons de suits")
    response = search.movie(query=query)
    for s in search.results:
        print(s['title'], s['id'], s['release_date'], s['popularity'])